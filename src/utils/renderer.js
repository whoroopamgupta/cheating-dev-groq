// renderer.js
const { ipcRenderer } = require('electron');
const path = require('path');
const { requiresScreenContext, captureDimensions } = require(path.join(__dirname, 'utils', 'requestPolicy.js'));

// Import VAD functionality
let VADProcessor;
let shouldFlushAudioSegment = metadata => metadata?.streaming !== true;
try {
    // __dirname resolves to 'src' folder when loaded from index.html
    // So we need to go to 'utils/vad.js'
    const vadPath = path.join(__dirname, 'utils', 'vad.js');
    const vad = require(vadPath);
    VADProcessor = vad.VADProcessor;
    shouldFlushAudioSegment = vad.shouldFlushAudioSegment;
    console.log('✅ VAD module loaded successfully from:', vadPath);
} catch (error) {
    console.warn('❌ VAD module not available:', error);
    console.warn('Tried path:', path.join(__dirname, 'utils', 'vad.js'));
    VADProcessor = null;
}

// Initialize random display name for UI components
window.randomDisplayName = null;

// Request random display name from main process
ipcRenderer
    .invoke('get-random-display-name')
    .then(name => {
        window.randomDisplayName = name;
        console.log('Set random display name:', name);
    })
    .catch(err => {
        console.warn('Could not get random display name:', err);
        window.randomDisplayName = 'System Monitor';
    });

let mediaStream = null;
let screenshotInterval = null;
let audioContext = null;
let audioProcessor = null;
let audioBuffer = [];
let vadProcessor = null; // VAD processor instance
const SAMPLE_RATE = 24000;
const AUDIO_CHUNK_DURATION = 0.1; // seconds
const BUFFER_SIZE = 4096; // Increased buffer size for smoother audio

let hiddenVideo = null;
let offscreenCanvas = null;
let offscreenContext = null;
let currentImageQuality = 'medium'; // Store current image quality for manual screenshots
let microphoneEnabled = false; // Microphone toggle state - starts OFF by default
let screenAnalysisPromise = null;

const isLinux = process.platform === 'linux';
const isMacOS = process.platform === 'darwin';

// Token tracking system for rate limiting
let tokenTracker = {
    tokens: [], // Array of {timestamp, count, type} objects
    audioStartTime: null,

    // Add tokens to the tracker
    addTokens(count, type = 'image') {
        const now = Date.now();
        this.tokens.push({
            timestamp: now,
            count: count,
            type: type,
        });

        // Clean old tokens (older than 1 minute)
        this.cleanOldTokens();
    },

    // Calculate image tokens based on Gemini 2.0 rules
    calculateImageTokens(width, height) {
        // Images ≤384px in both dimensions = 258 tokens
        if (width <= 384 && height <= 384) {
            return 258;
        }

        // Larger images are tiled into 768x768 chunks, each = 258 tokens
        const tilesX = Math.ceil(width / 768);
        const tilesY = Math.ceil(height / 768);
        const totalTiles = tilesX * tilesY;

        return totalTiles * 258;
    },

    // Track audio tokens continuously
    trackAudioTokens() {
        if (!this.audioStartTime) {
            this.audioStartTime = Date.now();
            return;
        }

        const now = Date.now();
        const elapsedSeconds = (now - this.audioStartTime) / 1000;

        // Audio = 32 tokens per second
        const audioTokens = Math.floor(elapsedSeconds * 32);

        if (audioTokens > 0) {
            this.addTokens(audioTokens, 'audio');
            this.audioStartTime = now;
        }
    },

    // Clean tokens older than 1 minute
    cleanOldTokens() {
        const oneMinuteAgo = Date.now() - 60 * 1000;
        this.tokens = this.tokens.filter(token => token.timestamp > oneMinuteAgo);
    },

    // Get total tokens in the last minute
    getTokensInLastMinute() {
        this.cleanOldTokens();
        return this.tokens.reduce((total, token) => total + token.count, 0);
    },

    // Check if we should throttle based on settings
    shouldThrottle() {
        // Get rate limiting settings from localStorage
        const throttleEnabled = localStorage.getItem('throttleTokens') === 'true';
        if (!throttleEnabled) {
            return false;
        }

        const maxTokensPerMin = parseInt(localStorage.getItem('maxTokensPerMin') || '1000000', 10);
        const throttleAtPercent = parseInt(localStorage.getItem('throttleAtPercent') || '75', 10);

        const currentTokens = this.getTokensInLastMinute();
        const throttleThreshold = Math.floor((maxTokensPerMin * throttleAtPercent) / 100);

        console.log(`Token check: ${currentTokens}/${maxTokensPerMin} (throttle at ${throttleThreshold})`);

        return currentTokens >= throttleThreshold;
    },

    // Reset the tracker
    reset() {
        this.tokens = [];
        this.audioStartTime = null;
    },
};

// Track audio tokens every few seconds
setInterval(() => {
    tokenTracker.trackAudioTokens();
}, 2000);

function convertFloat32ToInt16(float32Array) {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
        // Improved scaling to prevent clipping
        const s = Math.max(-1, Math.min(1, float32Array[i]));
        int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return int16Array;
}

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

async function ensureCaptureVideoReady(timeoutMs = 4000) {
    const videoTrack = mediaStream?.getVideoTracks?.()[0];
    if (!videoTrack || videoTrack.readyState !== 'live') throw new Error('Screen sharing has stopped. Start the session again.');
    if (!hiddenVideo) {
        hiddenVideo = document.createElement('video');
        hiddenVideo.muted = true;
        hiddenVideo.playsInline = true;
    }
    if (hiddenVideo.srcObject !== mediaStream) hiddenVideo.srcObject = mediaStream;
    await hiddenVideo.play();
    const deadline = Date.now() + timeoutMs;
    while ((hiddenVideo.readyState < 2 || !hiddenVideo.videoWidth || !hiddenVideo.videoHeight) && Date.now() < deadline) await wait(25);
    if (hiddenVideo.readyState < 2 || !hiddenVideo.videoWidth || !hiddenVideo.videoHeight) throw new Error('Screen capture is not ready. Please try again.');
    if (typeof hiddenVideo.requestVideoFrameCallback === 'function') {
        await Promise.race([new Promise(resolve => hiddenVideo.requestVideoFrameCallback(resolve)), wait(500)]);
    } else {
        await new Promise(resolve => requestAnimationFrame(resolve));
    }
    if (!offscreenCanvas) offscreenCanvas = document.createElement('canvas');
    if (!offscreenContext) offscreenContext = offscreenCanvas.getContext('2d', { alpha: false });
    if (!offscreenContext) throw new Error('Screen capture could not initialize.');
    return hiddenVideo;
}

function canvasBlob(canvas, quality) {
    return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
}

async function canvasBase64(canvas, quality) {
    // Keep the encoded file below the managed proxy request limit. Fallbacks
    // only affect unusually noisy/high-detail frames.
    let blob = await canvasBlob(canvas, quality);
    if (blob?.size > 2_000_000) blob = await canvasBlob(canvas, Math.min(quality, 0.65));
    if (blob?.size > 2_000_000) blob = await canvasBlob(canvas, 0.5);
    if (!blob) throw new Error('Could not encode the screenshot.');
    if (blob.size > 2_000_000) throw new Error('Screenshot is too detailed to send. Select Medium image quality and retry.');
    const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error || new Error('Could not read the screenshot.'));
        reader.readAsDataURL(blob);
    });
    const base64 = String(dataUrl).split(',')[1];
    if (!base64 || base64.length < 100) throw new Error('The captured screenshot was empty.');
    return base64;
}

async function initializeGemini(profile = 'interview', language = 'en-US', mode = 'interview', model = 'gemini-2.5-flash', providedApiKey = null) {
    const apiKey = (providedApiKey || localStorage.getItem('geminiApiKey') || localStorage.getItem('apiKey'))?.trim();
    if (apiKey) {
        // Get mode and model from localStorage if not provided
        const selectedMode = mode || localStorage.getItem('selectedMode') || 'interview';
        const selectedModel = model || localStorage.getItem('selectedModel') || 'gemini-2.5-flash';

        const success = await ipcRenderer.invoke(
            'initialize-gemini',
            apiKey,
            localStorage.getItem('customPrompt') || '',
            profile,
            language,
            selectedMode,
            selectedModel,
            localStorage.getItem('resumeContext') || ''
        );
        if (success) {
            cheddar.setStatus(selectedMode === 'interview' ? 'Live' : 'Ready');
        } else {
            cheddar.setStatus('error');
        }
    }
}

// Initialize Groq API for interview mode STT
async function initializeGroq(apiKey) {
    if (!apiKey) {
        console.error('[GROQ] No API key provided');
        cheddar.setStatus('Error: No Groq API key');
        return false;
    }

    try {
        const result = await ipcRenderer.invoke('initialize-groq', apiKey);
        if (result.success) {
            console.log('[GROQ] Initialized successfully');
            cheddar.setStatus('Listening...');
            return true;
        } else {
            console.error('[GROQ] Initialization failed:', result.error);
            cheddar.setStatus('Error: ' + result.error);
            return false;
        }
    } catch (error) {
        console.error('[GROQ] Initialization error:', error);
        cheddar.setStatus('Error: ' + error.message);
        return false;
    }
}

// Listen for status updates
ipcRenderer.on('update-status', (event, status) => {
    console.log('Status update:', status);
    cheddar.setStatus(status);
});

// Listen for Groq transcription results and generate response with Llama
ipcRenderer.on('groq-transcription', async (event, transcription) => {
    console.log('\n========================================');
    console.log('[GROQ STT] RECEIVED TRANSCRIPTION:');
    console.log('----------------------------------------');
    console.log(transcription);
    console.log('========================================\n');

    // Update status to show transcription was received
    cheddar.setStatus('Transcription received');

    // Trim and validate transcription
    const cleanTranscription = transcription?.trim();
    if (!cleanTranscription || cleanTranscription.length < 3) {
        console.log('[GROQ] Transcription too short, skipping Llama generation');
        return;
    }

    // Check if we're in interview mode (non-exam mode uses Groq)
    const selectedMode = localStorage.getItem('selectedMode') || 'interview';
    if (selectedMode === 'coding') {
        console.log('[GROQ] In coding/exam mode - skipping Llama generation');
        return;
    }
    // Auto-detect intent to scan the screen (e.g., "solve this question", "look at the screen")
    const lowerTranscript = cleanTranscription.toLowerCase();
    const screenIntentRegex = /(solve|look at|read|explain|analyze|check)\s+(this|the|that)?\s*(question|problem|code|screen|snippet|function)/i;
    const directScreenMention = /on (the )?screen/i;

    if (screenIntentRegex.test(lowerTranscript) || directScreenMention.test(lowerTranscript)) {
        console.log('[GROQ] Auto-detected screen analysis intent from transcription:', cleanTranscription);
        cheddar.setStatus('Auto-scanning screen...');
        if (window.captureManualScreenshot) {
            await window.captureManualScreenshot();
            return; // Skip standard text-only LLM generation since screenshot generation will handle it
        }
    }

    // Generate response using Llama
    try {
        console.log('[GROQ LLAMA] Sending transcription to Llama for response...');
        cheddar.setStatus('Generating response...');

        const result = await ipcRenderer.invoke('groq-generate-response', {
            message: cleanTranscription,
            imageBase64: null, // Text-only for now, screenshots handled separately
        });

        if (!result.success) {
            console.error('[GROQ LLAMA] Generation failed:', result.error);
            cheddar.setStatus('Error generating response');
        }
        // Response is streamed via update-response event, handled by CheatingDaddyApp.js
    } catch (error) {
        console.error('[GROQ LLAMA] Error:', error);
        cheddar.setStatus('Error: ' + error.message);
    }
});

// Listen for responses - REMOVED: This is handled in CheatingDaddyApp.js to avoid duplicates
// ipcRenderer.on('update-response', (event, response) => {
//     console.log('Gemini response:', response);
//     cheddar.e().setResponse(response);
//     // You can add UI elements to display the response if needed
// });

async function startCapture(screenshotIntervalSeconds = 5, imageQuality = 'medium') {
    // Store the image quality for manual screenshots
    currentImageQuality = imageQuality;

    // Reset token tracker when starting new capture session
    tokenTracker.reset();
    console.log('🎯 Token tracker reset for new capture session');

    // Initialize microphone state based on VAD settings
    const vadEnabled = localStorage.getItem('vadEnabled') === 'true';
    const vadMode = localStorage.getItem('vadMode') || 'automatic';

    if (vadEnabled && vadMode === 'automatic') {
        microphoneEnabled = true;
        console.log('🎤 [VAD AUTOMATIC MODE] Microphone enabled at session start');
    } else if (vadEnabled && vadMode === 'manual') {
        microphoneEnabled = false;
        console.log('🔴 [VAD MANUAL MODE] Microphone OFF - Press Cmd+Shift+M to enable');
    } else {
        // VAD disabled: enable microphone by default so audio flows
        microphoneEnabled = true;
        console.log('🎤 [VAD DISABLED] Microphone enabled by default - audio will be processed continuously');
    }

    try {
        if (isMacOS) {
            // On macOS, use SystemAudioDump for audio and getDisplayMedia for screen
            console.log('Starting macOS capture with SystemAudioDump...');

            // Get VAD settings from localStorage to pass to main process
            const vadEnabled = localStorage.getItem('vadEnabled') === 'true';
            const vadMode = localStorage.getItem('vadMode') || 'automatic';

            // Check if we're in interview mode (uses Groq) or exam mode (uses Gemini)
            const selectedMode = localStorage.getItem('selectedMode') || 'interview';
            const useGroqForSTT = selectedMode === 'interview';
            console.log(`[macOS] Mode: ${selectedMode}, Using Groq for STT: ${useGroqForSTT}`);

            // Do not race two macOS capture/permission flows. Running the
            // helper and display picker concurrently made both intermittent.
            const audioResult = await ipcRenderer.invoke('start-macos-audio', vadEnabled, vadMode, useGroqForSTT);
            if (!audioResult.success) throw new Error('Failed to start macOS audio capture: ' + audioResult.error);
            try {
                mediaStream = await navigator.mediaDevices.getDisplayMedia({
                    video: {
                        frameRate: 1,
                        width: { ideal: 1920 },
                        height: { ideal: 1080 },
                    },
                    audio: false, // Don't use browser audio on macOS
                });
            } catch (error) {
                await ipcRenderer.invoke('stop-macos-audio');
                throw error;
            }

            console.log('macOS screen capture started - audio handled by SystemAudioDump');
        } else if (isLinux) {
            // Linux - use display media for screen capture and try to get system audio
            try {
                // First try to get system audio via getDisplayMedia (works on newer browsers)
                mediaStream = await navigator.mediaDevices.getDisplayMedia({
                    video: {
                        frameRate: 1,
                        width: { ideal: 1920 },
                        height: { ideal: 1080 },
                    },
                    audio: {
                        sampleRate: SAMPLE_RATE,
                        channelCount: 1,
                        echoCancellation: false, // Don't cancel system audio
                        noiseSuppression: false,
                        autoGainControl: false,
                    },
                });

                console.log('Linux system audio capture via getDisplayMedia succeeded');

                // Setup audio processing for Linux system audio
                setupLinuxSystemAudioProcessing();
            } catch (systemAudioError) {
                console.warn('System audio via getDisplayMedia failed, trying screen-only capture:', systemAudioError);

                // Fallback to screen-only capture
                mediaStream = await navigator.mediaDevices.getDisplayMedia({
                    video: {
                        frameRate: 1,
                        width: { ideal: 1920 },
                        height: { ideal: 1080 },
                    },
                    audio: false,
                });
            }

            console.log('Linux capture started - system audio:', mediaStream.getAudioTracks().length > 0);
        } else {
            // Windows - use display media with loopback for system audio
            mediaStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    frameRate: 1,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                },
                audio: {
                    sampleRate: SAMPLE_RATE,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });

            console.log('Windows capture started with loopback audio');

            // Setup audio processing for Windows loopback audio only
            setupWindowsLoopbackProcessing();
        }

        console.log('MediaStream obtained:', {
            hasVideo: mediaStream.getVideoTracks().length > 0,
            hasAudio: mediaStream.getAudioTracks().length > 0,
            videoTrack: mediaStream.getVideoTracks()[0]?.getSettings(),
        });

        // Wait for a real first frame so screen analysis is usable as soon as
        // Start Session completes instead of randomly returning "video not ready".
        await ensureCaptureVideoReady();

        // Start capturing screenshots - check if manual mode
        if (screenshotIntervalSeconds === 'manual' || screenshotIntervalSeconds === 'Manual') {
            console.log('Manual mode enabled - screenshots will be captured on demand only');
            // Don't start automatic capture in manual mode
        } else {
            const intervalMilliseconds = parseInt(screenshotIntervalSeconds) * 1000;
            screenshotInterval = setInterval(() => captureScreenshot(imageQuality), intervalMilliseconds);

            // Capture first screenshot immediately
            setTimeout(() => captureScreenshot(imageQuality), 100);
        }
        return true;
    } catch (err) {
        console.error('Error starting capture:', err);
        cheddar.setStatus('error');
        return false;
    }
}

function setupLinuxSystemAudioProcessing() {
    // Setup system audio processing for Linux (from getDisplayMedia)
    audioContext = new AudioContext({ sampleRate: SAMPLE_RATE });
    const source = audioContext.createMediaStreamSource(mediaStream);
    audioProcessor = audioContext.createScriptProcessor(BUFFER_SIZE, 1, 1);

    // Check if we're in interview mode (uses Groq) or exam mode (uses Gemini)
    const selectedMode = localStorage.getItem('selectedMode') || 'interview';
    const useGroqForSTT = selectedMode === 'interview';

    console.log(`[AUDIO] Mode: ${selectedMode}, Using Groq for STT: ${useGroqForSTT}`);

    // Initialize VAD if enabled and available
    let isVADEnabled = false;
    if (VADProcessor) {
        try {
            const vadEnabled = localStorage.getItem('vadEnabled') === 'true';
            if (vadEnabled) {
                // Get VAD mode from localStorage (default: 'automatic')
                const vadMode = localStorage.getItem('vadMode') || 'automatic';
                console.log(`Initializing VAD in ${vadMode.toUpperCase()} mode`);

                // Create VAD processor with onCommit callback and mode
                vadProcessor = new VADProcessor(
                    async (audioSegment, metadata) => {
                        try {
                            // Convert Float32Array to Int16 PCM
                            const pcmData16 = convertFloat32ToInt16(audioSegment);
                            const base64Data = arrayBufferToBase64(pcmData16.buffer);

                            if (useGroqForSTT) {
                                // Interview mode: Send to Groq for transcription
                                // Automatic mode emits streaming frames; only a
                                // completed VAD/manual segment should force flush.
                                const committed = shouldFlushAudioSegment(metadata);
                                await ipcRenderer.invoke('groq-add-audio', { data: base64Data, committed });
                                console.log('[GROQ] VAD segment added, duration:', metadata?.duration || 'unknown');
                            } else {
                                // Exam mode: Send to Gemini
                                await ipcRenderer.invoke('send-audio-content', {
                                    data: base64Data,
                                    mimeType: 'audio/pcm;rate=24000',
                                });
                                console.log('VAD audio segment sent:', metadata);
                            }
                        } catch (error) {
                            console.error('Failed to send VAD audio segment:', error);
                        }
                    },
                    null, // onStateChange callback
                    vadMode // VAD mode
                );
                isVADEnabled = true;
                console.log('VAD enabled for Linux system audio processing');

                // In AUTOMATIC mode: enable microphone by default
                if (vadMode === 'automatic') {
                    microphoneEnabled = true;
                    console.log('🎤 Automatic mode - microphone enabled by default');
                }
            }
        } catch (error) {
            console.error('Failed to initialize VAD:', error);
        }
    }

    let audioBuffer = [];
    const samplesPerChunk = SAMPLE_RATE * AUDIO_CHUNK_DURATION;
    let audioFrameCount = 0;
    let droppedFrameCount = 0;

    audioProcessor.onaudioprocess = async e => {
        audioFrameCount++;

        // Debug: Log first few frames
        if (audioFrameCount <= 3) {
            console.log(
                `🔊 [AUDIO] Frame ${audioFrameCount}: microphoneEnabled=${microphoneEnabled}, isVADEnabled=${isVADEnabled}, useGroq=${useGroqForSTT}`
            );
        }

        // Skip audio processing if microphone is not enabled
        if (!microphoneEnabled) {
            droppedFrameCount++;
            if (droppedFrameCount === 1 || droppedFrameCount % 100 === 0) {
                console.warn(
                    `⚠️ [Linux] Audio being dropped - microphone is OFF. Press Cmd+Shift+M to enable. (${droppedFrameCount} frames dropped)`
                );
            }
            return;
        }

        const inputData = e.inputBuffer.getChannelData(0);
        audioBuffer.push(...inputData);

        // Process audio in chunks
        while (audioBuffer.length >= samplesPerChunk) {
            const chunk = audioBuffer.splice(0, samplesPerChunk);

            if (isVADEnabled && vadProcessor) {
                // Process with VAD (VAD will check its own pause state)
                await vadProcessor.processAudio(chunk);
            } else {
                // Process without VAD
                const pcmData16 = convertFloat32ToInt16(chunk);
                const base64Data = arrayBufferToBase64(pcmData16.buffer);

                if (useGroqForSTT) {
                    // Interview mode: Send to Groq for transcription
                    await ipcRenderer.invoke('groq-add-audio', { data: base64Data });
                } else {
                    // Exam mode: Send to Gemini
                    await ipcRenderer.invoke('send-audio-content', {
                        data: base64Data,
                        mimeType: 'audio/pcm;rate=24000',
                    });
                }
            }
        }
    };

    source.connect(audioProcessor);
    audioProcessor.connect(audioContext.destination);
}

function setupWindowsLoopbackProcessing() {
    // Setup audio processing for Windows loopback audio only
    audioContext = new AudioContext({ sampleRate: SAMPLE_RATE });
    const source = audioContext.createMediaStreamSource(mediaStream);
    audioProcessor = audioContext.createScriptProcessor(BUFFER_SIZE, 1, 1);

    // Check if we're in interview mode (uses Groq) or exam mode (uses Gemini)
    const selectedMode = localStorage.getItem('selectedMode') || 'interview';
    const useGroqForSTT = selectedMode === 'interview';

    console.log(`[AUDIO] Mode: ${selectedMode}, Using Groq for STT: ${useGroqForSTT}`);

    // Initialize VAD if enabled and available
    let isVADEnabled = false;
    if (VADProcessor) {
        try {
            const vadEnabled = localStorage.getItem('vadEnabled') === 'true';
            if (vadEnabled) {
                // Get VAD mode from localStorage (default: 'automatic')
                const vadMode = localStorage.getItem('vadMode') || 'automatic';
                console.log(`Initializing VAD in ${vadMode.toUpperCase()} mode`);

                // Create VAD processor with onCommit callback and mode
                vadProcessor = new VADProcessor(
                    async (audioSegment, metadata) => {
                        try {
                            // Convert Float32Array to Int16 PCM
                            const pcmData16 = convertFloat32ToInt16(audioSegment);
                            const base64Data = arrayBufferToBase64(pcmData16.buffer);

                            if (useGroqForSTT) {
                                // Interview mode: Send to Groq for transcription
                                // Automatic mode emits streaming frames; only a
                                // completed VAD/manual segment should force flush.
                                const committed = shouldFlushAudioSegment(metadata);
                                await ipcRenderer.invoke('groq-add-audio', { data: base64Data, committed });
                                console.log('[GROQ] VAD segment added, duration:', metadata?.duration || 'unknown');
                            } else {
                                // Exam mode: Send to Gemini
                                await ipcRenderer.invoke('send-audio-content', {
                                    data: base64Data,
                                    mimeType: 'audio/pcm;rate=24000',
                                });
                                console.log('VAD audio segment sent:', metadata);
                            }
                        } catch (error) {
                            console.error('Failed to send VAD audio segment:', error);
                        }
                    },
                    null, // onStateChange callback
                    vadMode // VAD mode
                );
                isVADEnabled = true;
                console.log('VAD enabled for Windows loopback processing');

                // In AUTOMATIC mode: enable microphone by default
                if (vadMode === 'automatic') {
                    microphoneEnabled = true;
                    console.log('🎤 Automatic mode - microphone enabled by default');
                }
            }
        } catch (error) {
            console.error('Failed to initialize VAD:', error);
        }
    }

    let audioBuffer = [];
    const samplesPerChunk = SAMPLE_RATE * AUDIO_CHUNK_DURATION;
    let audioFrameCount = 0;
    let droppedFrameCount = 0;

    audioProcessor.onaudioprocess = async e => {
        audioFrameCount++;

        // Debug: Log first few frames
        if (audioFrameCount <= 3) {
            console.log(
                `🔊 [AUDIO] Frame ${audioFrameCount}: microphoneEnabled=${microphoneEnabled}, isVADEnabled=${isVADEnabled}, useGroq=${useGroqForSTT}`
            );
        }

        // Skip audio processing if microphone is not enabled
        if (!microphoneEnabled) {
            droppedFrameCount++;
            if (droppedFrameCount === 1 || droppedFrameCount % 100 === 0) {
                console.warn(
                    `⚠️ [Windows] Audio being dropped - microphone is OFF. Press Cmd+Shift+M to enable. (${droppedFrameCount} frames dropped)`
                );
            }
            return;
        }

        const inputData = e.inputBuffer.getChannelData(0);
        audioBuffer.push(...inputData);

        // Process audio in chunks
        while (audioBuffer.length >= samplesPerChunk) {
            const chunk = audioBuffer.splice(0, samplesPerChunk);

            if (isVADEnabled && vadProcessor) {
                // Process with VAD (VAD will check its own pause state)
                await vadProcessor.processAudio(chunk);
            } else {
                // Process without VAD
                const pcmData16 = convertFloat32ToInt16(chunk);
                const base64Data = arrayBufferToBase64(pcmData16.buffer);

                if (useGroqForSTT) {
                    // Interview mode: Send to Groq for transcription
                    await ipcRenderer.invoke('groq-add-audio', { data: base64Data });
                } else {
                    // Exam mode: Send to Gemini
                    await ipcRenderer.invoke('send-audio-content', {
                        data: base64Data,
                        mimeType: 'audio/pcm;rate=24000',
                    });
                }
            }
        }
    };

    source.connect(audioProcessor);
    audioProcessor.connect(audioContext.destination);
}

async function captureScreenshot(imageQuality = 'medium', isManual = false) {
    console.log(`Capturing ${isManual ? 'manual' : 'automated'} screenshot...`);
    if (!mediaStream) return;

    // Store isManual flag for use in the blob callback
    const captureIsManual = isManual;

    // Check rate limiting for automated screenshots only
    if (!isManual && tokenTracker.shouldThrottle()) {
        console.log('⚠️ Automated screenshot skipped due to rate limiting');
        return;
    }

    // Lazy init of video element
    if (!hiddenVideo) {
        hiddenVideo = document.createElement('video');
        hiddenVideo.srcObject = mediaStream;
        hiddenVideo.muted = true;
        hiddenVideo.playsInline = true;
        await hiddenVideo.play();

        await new Promise(resolve => {
            if (hiddenVideo.readyState >= 2) return resolve();
            hiddenVideo.onloadedmetadata = () => resolve();
        });

        // Lazy init of canvas based on video dimensions
        offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = hiddenVideo.videoWidth;
        offscreenCanvas.height = hiddenVideo.videoHeight;
        offscreenContext = offscreenCanvas.getContext('2d');
    }

    // Check if video is ready
    if (hiddenVideo.readyState < 2) {
        console.warn('Video not ready yet, skipping screenshot');
        return;
    }

    offscreenContext.drawImage(hiddenVideo, 0, 0, offscreenCanvas.width, offscreenCanvas.height);

    // Check if image was drawn properly by sampling a pixel
    const imageData = offscreenContext.getImageData(0, 0, 1, 1);
    const isBlank = imageData.data.every((value, index) => {
        // Check if all pixels are black (0,0,0) or transparent
        return index === 3 ? true : value === 0;
    });

    if (isBlank) {
        console.warn('Screenshot appears to be blank/black');
    }

    let qualityValue;
    switch (imageQuality) {
        case 'high':
            qualityValue = 0.9;
            break;
        case 'medium':
            qualityValue = 0.7;
            break;
        case 'low':
            qualityValue = 0.5;
            break;
        default:
            qualityValue = 0.7; // Default to medium
    }

    offscreenCanvas.toBlob(
        async blob => {
            if (!blob) {
                console.error('Failed to create blob from canvas');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64data = reader.result.split(',')[1];

                // Validate base64 data
                if (!base64data || base64data.length < 100) {
                    console.error('Invalid base64 data generated');
                    return;
                }

                const result = await ipcRenderer.invoke('send-image-content', {
                    data: base64data,
                    isManual: captureIsManual,
                });

                if (result.success) {
                    // Track image tokens after successful send
                    const imageTokens = tokenTracker.calculateImageTokens(offscreenCanvas.width, offscreenCanvas.height);
                    tokenTracker.addTokens(imageTokens, 'image');
                    console.log(`📊 Image sent successfully - ${imageTokens} tokens used (${offscreenCanvas.width}x${offscreenCanvas.height})`);
                } else {
                    console.error('Failed to send image:', result.error);
                }
            };
            reader.readAsDataURL(blob);
        },
        'image/jpeg',
        qualityValue
    );
}

async function captureManualScreenshot(imageQuality = null) {
    console.log('Manual screenshot triggered');
    const quality = imageQuality || currentImageQuality;

    // Check if we're in interview or coding mode
    const selectedMode = localStorage.getItem('selectedMode') || 'interview';

    if (selectedMode === 'coding') {
        // For coding/exam mode, send screenshot to Gemini
        await captureScreenshot(quality, true);
    } else {
        // For interview mode, capture screenshot and send to Groq Llama
        await captureScreenshotForGroq(quality);
    }
}

let lastGroqImageData = null;

function hasImageChanged(oldData, newData, threshold = 0.02) {
    if (!oldData) return true;
    if (oldData.width !== newData.width || oldData.height !== newData.height) return true;
    let diffCount = 0;
    const len = newData.data.length;
    // Sample pixels for performance (check every 4th pixel = step of 16 in ImageData)
    for (let i = 0; i < len; i += 16) {
        // Compare RGB values, ignore alpha
        if (
            Math.abs(newData.data[i] - oldData.data[i]) > 15 ||
            Math.abs(newData.data[i + 1] - oldData.data[i + 1]) > 15 ||
            Math.abs(newData.data[i + 2] - oldData.data[i + 2]) > 15
        ) {
            diffCount++;
        }
    }
    const diffRatio = diffCount / (len / 16);
    return diffRatio > threshold;
}

// Capture screenshot and send to Groq Llama for interview mode
async function captureScreenshotForGroq(imageQuality = 'medium') {
    if (screenAnalysisPromise) return screenAnalysisPromise;
    screenAnalysisPromise = captureScreenshotForGroqInternal(imageQuality)
        .catch(error => {
            console.error('[GROQ] Screenshot capture failed:', error);
            cheddar.setStatus('Error: ' + error.message);
            return { success: false, error: error.message };
        })
        .finally(() => {
            screenAnalysisPromise = null;
        });
    return screenAnalysisPromise;
}

async function captureScreenshotForGroqInternal(imageQuality = 'medium') {
    cheddar.setStatus('Capturing screen...');
    console.log('[GROQ] Capturing screenshot for Llama analysis...');
    if (!mediaStream) {
        console.error('No media stream available');
        cheddar.setStatus('Error: No screen capture');
        return { success: false, error: 'No screen capture' };
    }

    await ensureCaptureVideoReady();

    const dimensions = captureDimensions(hiddenVideo.videoWidth, hiddenVideo.videoHeight, imageQuality);
    offscreenCanvas.width = dimensions.width;
    offscreenCanvas.height = dimensions.height;
    offscreenContext.drawImage(hiddenVideo, 0, 0, dimensions.width, dimensions.height);

    // Check if we're in auto-capture mode (exam-groq)
    const isAutoCapture = localStorage.getItem('examGroqAutoCapture') === 'true';
    const selectedMode = localStorage.getItem('selectedMode');

    // If it's an auto-captured frame and the image hasn't meaningfully changed, skip it
    if (isAutoCapture && selectedMode === 'interview') {
        const currentImageData = offscreenContext.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
        const previousImageData = lastGroqImageData;
        lastGroqImageData = currentImageData;
        if (!hasImageChanged(previousImageData, currentImageData, 0.015)) {
            console.log('[GROQ] Screen has not changed significantly. Skipping auto-analysis to prevent hallucinations.');
            cheddar.setStatus('Ready');
            return { success: true, skipped: true };
        } else {
            // Screen HAS changed significantly (new question/page)!
            // Clear the LLM history so it analyzes the new question with a fresh, unpolluted context.
            console.log('[GROQ] Screen changed! Clearing history for fresh analysis.');
            ipcRenderer.invoke('groq-clear-history').catch(e => console.error(e));
        }
    }

    // Get quality value
    let qualityValue;
    switch (imageQuality) {
        case 'high':
            qualityValue = 0.9;
            break;
        case 'medium':
            qualityValue = 0.7;
            break;
        case 'low':
            qualityValue = 0.5;
            break;
        default:
            qualityValue = 0.7;
    }

    try {
        const base64data = await canvasBase64(offscreenCanvas, qualityValue);
        console.log('[GROQ] Sending screenshot to Llama for analysis...');
        cheddar.setStatus('Analyzing screenshot...');
        const result = await ipcRenderer.invoke('groq-generate-response', {
            message:
                'Analyze this screenshot and accurately answer the question/problem shown. CRITICAL ACCURACY RULE: You must read the question and every single option very carefully. Think step-by-step to arrive at the absolutely correct answer. NEVER guess. Double-check your logic. CRITICAL CHAT RULE: If the screenshot shows a chat window (Google Meet, Zoom, Teams), focus ONLY on the LATEST message visible at the BOTTOM. CRITICAL CODING RULE: If it shows code, DETECT THE EXACT PROGRAMMING LANGUAGE visible in the editor and provide your solution ONLY in that language. Preserve the exact function signature.',
            imageBase64: base64data,
        });
        if (!result.success) throw new Error(result.error || 'Screen analysis failed.');
        return result;
    } catch (error) {
        console.error('[GROQ] Screenshot analysis error:', error);
        cheddar.setStatus('Error: ' + error.message);
        return { success: false, error: error.message };
    }
}

// Expose functions to global scope for external access
window.captureManualScreenshot = captureManualScreenshot;

function stopCapture() {
    if (screenshotInterval) {
        clearInterval(screenshotInterval);
        screenshotInterval = null;
    }

    if (audioProcessor) {
        audioProcessor.disconnect();
        audioProcessor = null;
    }

    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }

    // Destroy VAD processor if active
    if (vadProcessor) {
        vadProcessor.destroy();
        vadProcessor = null;
        console.log('VAD processor destroyed');
    }

    // Reset microphone state
    microphoneEnabled = false;

    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }

    // Stop macOS audio capture if running
    if (isMacOS) {
        ipcRenderer.invoke('stop-macos-audio').catch(err => {
            console.error('Error stopping macOS audio:', err);
        });
    }

    // Clean up hidden elements
    if (hiddenVideo) {
        hiddenVideo.pause();
        hiddenVideo.srcObject = null;
        hiddenVideo = null;
    }
    offscreenCanvas = null;
    offscreenContext = null;
}

// Send text message with automatic screenshot (supports both Gemini and Groq modes)
async function sendTextMessage(text) {
    if (!text || text.trim().length === 0) {
        console.warn('Cannot send empty text message');
        return { success: false, error: 'Empty message' };
    }

    // Check which mode we're in
    const selectedMode = localStorage.getItem('selectedMode') || 'interview';
    const useGroq = selectedMode === 'interview';

    try {
        // Plain typed questions should use the selected text model. Screen
        // analysis remains available through the button or an explicit request.
        if (useGroq && !requiresScreenContext(text)) {
            cheddar.setStatus('Thinking...');
            return await ipcRenderer.invoke('groq-generate-response', { message: text.trim(), imageBase64: null });
        }
        cheddar.setStatus('Capturing screen...');
        // Capture screenshot and get base64 data
        console.log(`Capturing screenshot with text message (${useGroq ? 'Groq' : 'Gemini'} mode)...`);

        if (!mediaStream) {
            console.error('No media stream available');
            return { success: false, error: 'No media stream' };
        }

        await ensureCaptureVideoReady();

        if (useGroq) {
            const dimensions = captureDimensions(hiddenVideo.videoWidth, hiddenVideo.videoHeight, currentImageQuality);
            offscreenCanvas.width = dimensions.width;
            offscreenCanvas.height = dimensions.height;
        }
        offscreenContext.drawImage(hiddenVideo, 0, 0, offscreenCanvas.width, offscreenCanvas.height);

        // Get quality setting
        let qualityValue;
        switch (currentImageQuality) {
            case 'high':
                qualityValue = 0.9;
                break;
            case 'medium':
                qualityValue = 0.7;
                break;
            case 'low':
                qualityValue = 0.5;
                break;
            default:
                qualityValue = 0.7;
        }

        const base64data = await canvasBase64(offscreenCanvas, qualityValue);

        let result;

        if (useGroq) {
            // Interview mode: Use Groq Llama
            console.log('[GROQ] Sending text message to Llama...');
            cheddar.setStatus('Generating response...');

            result = await ipcRenderer.invoke('groq-generate-response', {
                message: text.trim(),
                imageBase64: base64data,
            });

            if (result.success) {
                console.log('Text + screenshot sent successfully to Groq Llama');
            } else {
                console.error('Failed to send to Groq Llama:', result.error);
            }
        } else {
            // Exam/Coding mode: Use Gemini
            result = await ipcRenderer.invoke('send-screenshot-with-text', {
                imageData: base64data,
                text: text.trim(),
            });

            if (result.success) {
                // Track image tokens
                const imageTokens = tokenTracker.calculateImageTokens(offscreenCanvas.width, offscreenCanvas.height);
                tokenTracker.addTokens(imageTokens, 'image');
                console.log('Screenshot + text sent successfully to Gemini');
            } else {
                console.error('Failed to send to Gemini:', result.error);
            }
        }

        return result;
    } catch (error) {
        console.error('Error sending text message with screenshot:', error);
        return { success: false, error: error.message };
    }
}

// Listen for emergency erase command from main process
ipcRenderer.on('clear-sensitive-data', () => {
    console.log('Clearing renderer-side sensitive data...');
    localStorage.removeItem('apiKey');
    localStorage.removeItem('customPrompt');
    // Consider clearing IndexedDB as well for full erasure
});

// Handle shortcuts based on current view
function handleShortcut(shortcutKey) {
    const currentView = cheddar.getCurrentView();

    if (shortcutKey === 'ctrl+enter' || shortcutKey === 'cmd+enter') {
        if (currentView === 'main') {
            cheddar.element().handleStart();
        } else {
            captureManualScreenshot();
        }
    }
}

// Microphone toggle function
async function toggleMicrophone(enabled) {
    microphoneEnabled = enabled;

    // Handle macOS separately (VAD runs in main process)
    if (isMacOS) {
        try {
            const result = await ipcRenderer.invoke('toggle-macos-microphone', enabled);
            console.log('🍎 [macOS] Microphone toggle result:', result);
            return result;
        } catch (error) {
            console.error('❌ [macOS] Failed to toggle microphone:', error);
            return { success: false, error: error.message };
        }
    }

    // Handle Windows/Linux (VAD runs in renderer process)
    if (vadProcessor) {
        if (enabled) {
            // Resume VAD processor
            vadProcessor.resume();
            console.log('✅ Microphone enabled - VAD resumed');
        } else {
            // In MANUAL mode: commit audio when mic is toggled OFF
            // In AUTOMATIC mode: just pause normally
            if (vadProcessor.mode === 'manual') {
                // Check if we have recorded audio to commit
                if (vadProcessor.audioBuffer && vadProcessor.audioBuffer.length > 0) {
                    console.log('🎤 [MANUAL MODE] Mic toggled OFF - committing recorded audio');
                    vadProcessor.commit();
                } else {
                    vadProcessor.pause();
                    console.log('❌ Microphone disabled - no audio to commit');
                }
            } else {
                vadProcessor.pause();
                console.log('❌ Microphone disabled - VAD paused');
            }
        }
    } else {
        console.log(`Microphone ${enabled ? 'enabled' : 'disabled'} (no VAD processor active)`);
    }

    return { success: true, enabled: microphoneEnabled };
}

// Create reference to the main app element
const cheatingDaddyApp = document.querySelector('cheating-daddy-app');

// Consolidated cheddar object - all functions in one place
const cheddar = {
    // Element access
    element: () => cheatingDaddyApp,
    e: () => cheatingDaddyApp,

    // App reference for global shortcuts (to be set after DOMContentLoaded)
    app: null,

    // App state functions - access properties directly from the app element
    getCurrentView: () => cheatingDaddyApp.currentView,
    getLayoutMode: () => cheatingDaddyApp.layoutMode,

    // Status and response functions
    setStatus: text => cheatingDaddyApp.setStatus(text),
    setResponse: response => cheatingDaddyApp.setResponse(response),

    // Core functionality
    initializeGemini,
    initializeGroq,
    startCapture,
    stopCapture,
    sendTextMessage,
    handleShortcut,
    toggleMicrophone,

    // Content protection function
    getContentProtection: () => {
        const contentProtection = localStorage.getItem('contentProtection');
        return contentProtection !== null ? contentProtection === 'true' : true;
    },

    // Platform detection
    isLinux: isLinux,
    isMacOS: isMacOS,
};

// Make it globally available
window.cheddar = cheddar;

// Set app reference after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for the custom element to be fully initialized
    setTimeout(() => {
        const appElement = document.querySelector('cheating-daddy-app');
        if (appElement) {
            cheddar.app = appElement;
            console.log('App reference set for global shortcuts');
        }
    }, 100);
});
