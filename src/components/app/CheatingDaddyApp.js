import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import { AppHeader } from './AppHeader.js';
import { MainView } from '../views/MainView.js';
import { CustomizeView } from '../views/CustomizeView.js';
import { HelpView } from '../views/HelpView.js';
import { AssistantView } from '../views/AssistantView.js';
import { OnboardingView } from '../views/OnboardingView.js';
import { AdvancedView } from '../views/AdvancedView.js';
import { LoginView } from '../views/LoginView.js';

export class CheatingDaddyApp extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family:
                'Inter',
                -apple-system,
                BlinkMacSystemFont,
                sans-serif;
            margin: 0px;
            padding: 0px;
            cursor: default;
            user-select: none;
        }

        :host {
            display: block;
            width: 100%;
            height: 100vh;
            background-color: var(--background-transparent);
            color: var(--text-color);
        }

        .window-container {
            height: 100vh;
            border-radius: 7px;
            overflow: hidden;
        }

        .container {
            display: flex;
            flex-direction: column;
            height: 100%;
        }

        .main-content {
            flex: 1;
            padding: var(--main-content-padding);
            overflow-y: auto;
            margin-top: var(--main-content-margin-top);
            border-radius: var(--content-border-radius);
            transition: all 0.15s ease-out;
            background: var(--main-content-background);
        }

        .main-content.with-border {
            border: 1px solid var(--border-color);
        }

        .main-content.assistant-view {
            padding: 10px;
            border: none;
        }

        .main-content.onboarding-view {
            padding: 0;
            border: none;
            background: transparent;
        }

        .main-content.login-view {
            padding: 0;
            border: none;
            background: transparent;
        }

        .view-container {
            opacity: 1;
            transform: translateY(0);
            transition:
                opacity 0.15s ease-out,
                transform 0.15s ease-out;
            height: 100%;
        }

        .view-container.entering {
            opacity: 0;
            transform: translateY(10px);
        }

        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }

        ::-webkit-scrollbar-track {
            background: var(--scrollbar-background);
            border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb {
            background: var(--scrollbar-thumb);
            border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: var(--scrollbar-thumb-hover);
        }
    `;

    static properties = {
        currentView: { type: String },
        statusText: { type: String },
        startTime: { type: Number },
        isRecording: { type: Boolean },
        sessionActive: { type: Boolean },
        selectedProfile: { type: String },
        selectedLanguage: { type: String },
        responses: { type: Array },
        currentResponseIndex: { type: Number },
        selectedScreenshotInterval: { type: String },
        selectedImageQuality: { type: String },
        layoutMode: { type: String },
        advancedMode: { type: Boolean },
        currentMode: { type: String },
        currentModel: { type: String },
        _viewInstances: { type: Object, state: true },
        _isClickThrough: { state: true },
        _awaitingNewResponse: { state: true },
        shouldAnimateResponse: { type: Boolean },
        // Rate limiting properties
        rateLimitEndTime: { type: Number },
        rateLimitSource: { type: String },
        // Auth validation message (shown when user is logged out due to plan expiration)
        logoutMessage: { type: String },
    };

    constructor() {
        super();

        // Check if user is logged in first
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

        if (!isLoggedIn) {
            // Not logged in - show login view
            this.currentView = 'login';
        } else if (!localStorage.getItem('onboardingCompleted')) {
            // Logged in but not onboarded
            this.currentView = 'onboarding';
        } else {
            // Logged in and onboarded
            this.currentView = 'main';
        }

        this.statusText = '';
        this.startTime = null;
        this.isRecording = false;
        this.sessionActive = false;
        this.selectedProfile = localStorage.getItem('selectedProfile') || 'exam';
        this.selectedLanguage = localStorage.getItem('selectedLanguage') || 'en-US';
        this.selectedScreenshotInterval = localStorage.getItem('selectedScreenshotInterval') || '5';
        this.selectedImageQuality = localStorage.getItem('selectedImageQuality') || 'high';
        this.layoutMode = localStorage.getItem('layoutMode') || 'compact';
        this.advancedMode = localStorage.getItem('advancedMode') === 'true';
        this.currentMode = localStorage.getItem('selectedMode') || 'interview';
        this.currentModel = '';
        this.responses = [];
        this.currentResponseIndex = -1;
        this._viewInstances = new Map();
        this._isClickThrough = false;
        this._awaitingNewResponse = false;
        this._currentResponseIsComplete = true;
        this.shouldAnimateResponse = false;

        // Rate limiting state
        this.rateLimitEndTime = null;
        this.rateLimitSource = null;
        this._pendingRetryRequest = null; // Store the failed request to retry

        // Auth validation message (for plan expiration)
        this.logoutMessage = '';

        // Apply layout mode to document root
        this.updateLayoutMode();

        // If user is logged in, validate their account in the background
        if (this.currentView !== 'login') {
            this.validateUserInBackground();
        }

        // Validation interval reference (will be set in connectedCallback)
        this._validationIntervalId = null;
    }

    connectedCallback() {
        super.connectedCallback();

        // Set up IPC listeners if needed
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.on('update-response', (_, response) => {
                this.setResponse(response);
            });
            ipcRenderer.on('update-status', (_, status) => {
                this.setStatus(status);
            });
            ipcRenderer.on('click-through-toggled', (_, isEnabled) => {
                this._isClickThrough = isEnabled;
            });
            // Rate limit event listener
            ipcRenderer.on('rate-limit-hit', (_, data) => {
                console.log('[CheatingDaddyApp] Received rate-limit-hit event:', data);
                const { retryAfterSeconds, source, pendingRequest } = data;
                this.handleRateLimitHit(retryAfterSeconds, source, pendingRequest);
            });
        }

        // Add global keyboard event listener for Ctrl+G
        this.boundKeydownHandler = this.handleGlobalKeydown.bind(this);
        document.addEventListener('keydown', this.boundKeydownHandler);

        // Set up periodic background validation (every 30 seconds)
        // This ensures users are logged out promptly if their plan expires while app is running
        this._validationIntervalId = setInterval(
            () => {
                if (this.currentView !== 'login') {
                    this.validateUserInBackground();
                }
            },
            30 * 1000
        ); // 30 seconds
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.removeAllListeners('update-response');
            ipcRenderer.removeAllListeners('update-status');
            ipcRenderer.removeAllListeners('click-through-toggled');
            ipcRenderer.removeAllListeners('rate-limit-hit');
        }

        // Remove global keyboard event listener
        if (this.boundKeydownHandler) {
            document.removeEventListener('keydown', this.boundKeydownHandler);
        }

        // Clear the validation interval
        if (this._validationIntervalId) {
            clearInterval(this._validationIntervalId);
            this._validationIntervalId = null;
        }
    }

    setStatus(text) {
        this.statusText = text;

        // Mark response as complete when we get certain status messages
        if (text.includes('Ready') || text.includes('Listening') || text.includes('Error')) {
            this._currentResponseIsComplete = true;
            console.log('[setStatus] Marked current response as complete');
        }
    }

    handleRateLimitHit(retryAfterSeconds, source, pendingRequest = null) {
        // Calculate the new end time
        const newEndTime = Date.now() + retryAfterSeconds * 1000;

        // Only update if this extends the cooldown or we don't have one yet
        if (!this.rateLimitEndTime || newEndTime > this.rateLimitEndTime) {
            this.rateLimitEndTime = newEndTime;
        }

        this.rateLimitSource = source || 'API';

        // Store the pending request to retry later (use the latest one)
        if (pendingRequest) {
            this._pendingRetryRequest = pendingRequest;
            console.log(
                `[RateLimit] ${source} rate limited for ${retryAfterSeconds}s - will retry: "${pendingRequest.message?.substring(0, 50) || pendingRequest.text?.substring(0, 50) || 'request'}..."`
            );
        } else {
            console.log(`[RateLimit] ${source} rate limited for ${retryAfterSeconds}s`);
        }

        this.requestUpdate();
    }

    async clearRateLimit() {
        const pendingRequest = this._pendingRetryRequest;

        console.log('[RateLimit] Cooldown expired, checking for pending request...');
        console.log('[RateLimit] Pending request:', pendingRequest ? pendingRequest.type : 'none');

        this.rateLimitEndTime = null;
        this.rateLimitSource = null;
        this._pendingRetryRequest = null;
        this.requestUpdate();

        // Auto-retry the pending request if there was one
        if (pendingRequest) {
            console.log(`[RateLimit] Retrying pending ${pendingRequest.type} request...`);
            this.setStatus('Retrying...');
            this._awaitingNewResponse = true;

            try {
                if (window.require) {
                    const { ipcRenderer } = window.require('electron');
                    let result;

                    if (pendingRequest.type === 'gemini-screenshot') {
                        // Retry Gemini screenshot request
                        console.log('[RateLimit] Invoking send-screenshot-with-text');
                        result = await ipcRenderer.invoke('send-screenshot-with-text', {
                            imageData: pendingRequest.imageData,
                            text: pendingRequest.text,
                        });
                    } else if (pendingRequest.type === 'gemini-text') {
                        // Retry Gemini text-only request
                        console.log('[RateLimit] Invoking send-text-content');
                        result = await ipcRenderer.invoke('send-text-content', pendingRequest.text);
                    } else if (pendingRequest.type === 'groq-generate') {
                        // Retry Groq Llama generation
                        console.log('[RateLimit] Invoking groq-generate-response for:', pendingRequest.message?.substring(0, 50));
                        result = await ipcRenderer.invoke('groq-generate-response', {
                            message: pendingRequest.message,
                            imageBase64: pendingRequest.imageBase64,
                        });
                    }

                    console.log('[RateLimit] Retry invoke result:', result);
                }
            } catch (error) {
                console.error('[RateLimit] Retry failed:', error);
                this.setStatus('Retry failed');
            }
        } else {
            console.log('[RateLimit] No pending request to retry');
        }
    }

    setResponse(response) {
        // Check if this looks like a filler response (very short responses to hmm, ok, etc)
        const isFillerResponse =
            response.length < 30 &&
            (response.toLowerCase().includes('hmm') ||
                response.toLowerCase().includes('okay') ||
                response.toLowerCase().includes('next') ||
                response.toLowerCase().includes('go on') ||
                response.toLowerCase().includes('continue'));

        if (this._awaitingNewResponse || this.responses.length === 0) {
            // Always add as new response when explicitly waiting for one
            this.responses = [...this.responses, response];
            this.currentResponseIndex = this.responses.length - 1;
            this._awaitingNewResponse = false;
            this._currentResponseIsComplete = false;
            console.log('[setResponse] Pushed new response:', response);
        } else if (!this._currentResponseIsComplete && !isFillerResponse && this.responses.length > 0) {
            // For substantial responses, update the last one (streaming behavior)
            // Only update if the current response is not marked as complete
            this.responses = [...this.responses.slice(0, this.responses.length - 1), response];
            console.log('[setResponse] Updated last response:', response);
        } else {
            // For filler responses or when current response is complete, add as new
            this.responses = [...this.responses, response];
            this.currentResponseIndex = this.responses.length - 1;
            this._currentResponseIsComplete = false;
            console.log('[setResponse] Added response as new:', response);
        }
        this.shouldAnimateResponse = true;
        this.requestUpdate();
    }

    // Header event handlers
    handleCustomizeClick() {
        this.currentView = 'customize';
        this.requestUpdate();
    }

    handleHelpClick() {
        this.currentView = 'help';
        this.requestUpdate();
    }

    handleAdvancedClick() {
        this.currentView = 'advanced';
        this.requestUpdate();
    }

    async handleClose() {
        if (this.currentView === 'customize' || this.currentView === 'help' || this.currentView === 'advanced') {
            this.currentView = 'main';
        } else if (this.currentView === 'assistant') {
            cheddar.stopCapture();

            // Close the session
            if (window.require) {
                const { ipcRenderer } = window.require('electron');
                await ipcRenderer.invoke('close-session');
            }
            this.sessionActive = false;
            this.currentView = 'main';
            console.log('Session closed');
        } else {
            // Quit the entire application
            if (window.require) {
                const { ipcRenderer } = window.require('electron');
                await ipcRenderer.invoke('quit-application');
            }
        }
    }

    async handleHideToggle() {
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            await ipcRenderer.invoke('toggle-window-visibility');
        }
    }

    // Main view event handlers
    async handleStart() {
        // Auto-set mode based on profile
        let selectedMode;
        if (this.selectedProfile === 'exam') {
            // Exam Assistant -> Coding/OA mode (forced) - uses Gemini API
            selectedMode = 'coding';
            localStorage.setItem('selectedMode', 'coding');
        } else {
            // All other profiles -> Interview mode (forced) - uses Groq API
            selectedMode = 'interview';
            localStorage.setItem('selectedMode', 'interview');
        }

        // Check for the correct API key based on profile
        const isExamMode = this.selectedProfile === 'exam';
        const apiKey = isExamMode
            ? (localStorage.getItem('geminiApiKey') || localStorage.getItem('apiKey'))?.trim()
            : localStorage.getItem('groqApiKey')?.trim();

        if (!apiKey || apiKey === '') {
            // Trigger the red blink animation on the API key input
            const mainView = this.shadowRoot.querySelector('main-view');
            if (mainView && mainView.triggerApiKeyError) {
                mainView.triggerApiKeyError();
            }
            return;
        }

        // Store the appropriate API key for the session
        localStorage.setItem('apiKey', apiKey);

        // Get model from localStorage (only matters for coding mode)
        const selectedModel = localStorage.getItem('selectedModel') || 'gemini-2.5-pro';

        // Initialize the appropriate API based on mode
        if (isExamMode) {
            // Exam mode: Use Gemini API
            await cheddar.initializeGemini(this.selectedProfile, this.selectedLanguage, selectedMode, selectedModel);
        } else {
            // Interview mode: Use Groq API for STT + Llama for response generation
            await cheddar.initializeGroq(apiKey);

            // Get the selected Groq model (default to maverick)
            const selectedGroqModel = localStorage.getItem('selectedGroqModel') || 'llama-4-maverick';

            // Set up Llama config with system prompt from prompts.js
            const { ipcRenderer } = window.require('electron');
            const customPrompt = localStorage.getItem(`customPrompt_${this.selectedProfile}`) || '';

            // Import prompts module to get system prompt
            const { getSystemPrompt } = window.require('./utils/prompts.js');
            const systemPrompt = getSystemPrompt(this.selectedProfile, customPrompt, true);

            await ipcRenderer.invoke('groq-set-llama-config', {
                profile: this.selectedProfile,
                systemPrompt: systemPrompt,
                model: selectedGroqModel,
            });
            console.log(`[GROQ] Llama config set - Profile: ${this.selectedProfile}, Model: ${selectedGroqModel}`);
        }

        // Set current mode and model for header display
        this.currentMode = selectedMode;
        if (selectedMode === 'interview') {
            const selectedGroqModel = localStorage.getItem('selectedGroqModel') || 'llama-4-maverick';
            this.currentModel = selectedGroqModel;
        } else {
            this.currentModel = selectedModel;
        }

        // ALWAYS use manual mode for both interview and coding modes to avoid rate limits
        // User must press Ctrl+Enter to capture screenshots
        const screenshotMode = 'manual';

        if (selectedMode === 'coding') {
            console.log('💻 Coding/OA mode (Exam Assistant): Manual capture only - Press Ctrl+Enter to analyze screenshot');
        } else {
            console.log('🎤 Interview mode: Manual capture only - Press Ctrl+Enter if needed. Voice questions are auto-detected.');
        }

        cheddar.startCapture(screenshotMode, this.selectedImageQuality);
        this.responses = [];
        this.currentResponseIndex = -1;
        this.startTime = Date.now();
        this.currentView = 'assistant';
    }

    async handleAPIKeyHelp() {
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            // Open different URLs based on current profile
            const isExamMode = this.selectedProfile === 'exam';
            const url = isExamMode ? 'https://www.cheatingdev.in/gemini-api-key' : 'https://www.cheatingdev.in/groq-api-key';
            await ipcRenderer.invoke('open-external', url);
        }
    }

    handleClearAndRestart() {
        // Clear the current session and responses
        this.responses = [];
        this.currentResponseIndex = -1;
        this.startTime = null;

        // Stop any ongoing capture if in assistant view
        if (this.currentView === 'assistant' && window.cheddar) {
            window.cheddar.stopCapture();
        }

        // Return to main view
        this.currentView = 'main';
        this.setStatus('Session cleared. Starting new session...');

        // Request update to refresh the UI
        this.requestUpdate();

        // Automatically start a new session after a brief delay
        setTimeout(() => {
            this.handleStart();
        }, 100);
    }

    handleGlobalKeydown(e) {
        // Handle Ctrl+Alt+R (or Cmd+Option+R on Mac) for clearing and restarting session
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const isClearShortcut = isMac ? e.metaKey && e.altKey && e.key === 'r' : e.ctrlKey && e.altKey && e.key === 'r';

        if (isClearShortcut) {
            e.preventDefault();
            e.stopPropagation();
            this.handleClearAndRestart();
        }
    }

    // Customize view event handlers
    handleProfileChange(profile) {
        this.selectedProfile = profile;
    }

    handleLanguageChange(language) {
        this.selectedLanguage = language;
    }

    handleScreenshotIntervalChange(interval) {
        this.selectedScreenshotInterval = interval;
    }

    handleImageQualityChange(quality) {
        this.selectedImageQuality = quality;
        localStorage.setItem('selectedImageQuality', quality);
    }

    handleAdvancedModeChange(advancedMode) {
        this.advancedMode = advancedMode;
        localStorage.setItem('advancedMode', advancedMode.toString());
    }

    handleBackClick() {
        this.currentView = 'main';
        this.requestUpdate();
    }

    // Help view event handlers
    async handleExternalLinkClick(url) {
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            await ipcRenderer.invoke('open-external', url);
        }
    }

    // Assistant view event handlers
    async handleSendText(message) {
        const result = await window.cheddar.sendTextMessage(message);

        if (!result.success) {
            console.error('Failed to send message:', result.error);
            this.setStatus('Error sending message: ' + result.error);
        } else {
            // Don't set "Message sent..." here - status is already managed by sendRealtimeInput
            // which sends: "Analyzing..." → "Ready" (success) or "Server overloaded" (error)
            this._awaitingNewResponse = true;
        }
    }

    handleResponseIndexChanged(e) {
        this.currentResponseIndex = e.detail.index;
        this.shouldAnimateResponse = false;
        this.requestUpdate();
    }

    // Login event handlers
    handleLoginSuccess(user) {
        console.log('[CheatingDaddyApp] Login successful for:', user.user);
        // Check if onboarding is completed
        if (localStorage.getItem('onboardingCompleted')) {
            this.currentView = 'main';
        } else {
            this.currentView = 'onboarding';
        }
        this.requestUpdate();
    }

    handleLogout() {
        console.log('[CheatingDaddyApp] User logging out');
        // Clear login state
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loggedInUser');
        // Navigate to login view
        this.currentView = 'login';
        this.requestUpdate();
    }

    // Background validation of user account
    async validateUserInBackground() {
        try {
            const loggedInUserStr = localStorage.getItem('loggedInUser');
            if (!loggedInUserStr) {
                console.log('[Auth] No logged in user found, skipping validation');
                return;
            }

            const loggedInUser = JSON.parse(loggedInUserStr);
            const userEmail = loggedInUser.email;

            if (!userEmail) {
                console.log('[Auth] No email found for logged in user, skipping validation');
                return;
            }

            console.log('[Auth] Validating user in background:', userEmail);

            // Fetch the current user list from remote
            const response = await fetch('https://raw.githubusercontent.com/catwithbatman-del/codeindev-emails/refs/heads/main/emails.json');

            if (!response.ok) {
                console.warn('[Auth] Failed to fetch user list for validation, allowing user to continue');
                return; // Don't log out user if we can't reach the server
            }

            const text = await response.text();

            // Parse the JSON (handle non-standard JSON with unquoted keys and trailing commas)
            let users;
            try {
                users = JSON.parse(text);
            } catch (parseError) {
                let fixedJson = text
                    // Add quotes around unquoted keys
                    .replace(/(\s*)(\w+)(\s*:\s*)/g, '$1"$2"$3')
                    // Replace "null" string with null
                    .replace(/:\s*"null"/g, ': null')
                    // Remove trailing commas before ] or }
                    .replace(/,(\s*[\]}])/g, '$1');
                users = JSON.parse(fixedJson);
            }

            // Check if user still exists in the list
            const userExists = users.some(u => u.userEmail.toLowerCase() === userEmail.toLowerCase());

            if (!userExists) {
                console.log('[Auth] User no longer exists in database, logging out:', userEmail);

                // Set the logout message before navigating to login
                this.logoutMessage =
                    'Your plan has ended. If this is a mistake, please contact webdevarmyhq@gmail.com. To extend your plan, visit our website.';

                // Clear login state
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('loggedInUser');

                // Navigate to login view
                this.currentView = 'login';
                this.requestUpdate();
            } else {
                console.log('[Auth] User validation successful:', userEmail);
            }
        } catch (error) {
            console.error('[Auth] Error validating user:', error);
            // Don't log out user on network errors - allow them to continue
        }
    }

    // Onboarding event handlers
    handleOnboardingComplete() {
        this.currentView = 'main';
    }

    updated(changedProperties) {
        super.updated(changedProperties);

        // Only notify main process of view change if the view actually changed
        if (changedProperties.has('currentView') && window.require) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.send('view-changed', this.currentView);

            // Add a small delay to smooth out the transition
            const viewContainer = this.shadowRoot?.querySelector('.view-container');
            if (viewContainer) {
                viewContainer.classList.add('entering');
                requestAnimationFrame(() => {
                    viewContainer.classList.remove('entering');
                });
            }
        }

        // Only update localStorage when these specific properties change
        if (changedProperties.has('selectedProfile')) {
            localStorage.setItem('selectedProfile', this.selectedProfile);
        }
        if (changedProperties.has('selectedLanguage')) {
            localStorage.setItem('selectedLanguage', this.selectedLanguage);
        }
        if (changedProperties.has('selectedScreenshotInterval')) {
            localStorage.setItem('selectedScreenshotInterval', this.selectedScreenshotInterval);
        }
        if (changedProperties.has('selectedImageQuality')) {
            localStorage.setItem('selectedImageQuality', this.selectedImageQuality);
        }
        if (changedProperties.has('layoutMode')) {
            this.updateLayoutMode();
        }
        if (changedProperties.has('advancedMode')) {
            localStorage.setItem('advancedMode', this.advancedMode.toString());
        }
    }

    renderCurrentView() {
        // Only re-render the view if it hasn't been cached or if critical properties changed
        const viewKey = `${this.currentView}-${this.selectedProfile}-${this.selectedLanguage}`;

        switch (this.currentView) {
            case 'login':
                return html`
                    <login-view
                        .onLoginSuccess=${user => this.handleLoginSuccess(user)}
                        .logoutMessage=${this.logoutMessage}
                        .onClearLogoutMessage=${() => {
                            this.logoutMessage = '';
                            this.requestUpdate();
                        }}
                    ></login-view>
                `;

            case 'onboarding':
                return html`
                    <onboarding-view .onComplete=${() => this.handleOnboardingComplete()} .onClose=${() => this.handleClose()}></onboarding-view>
                `;

            case 'main':
                return html`
                    <main-view
                        .onStart=${() => this.handleStart()}
                        .onAPIKeyHelp=${() => this.handleAPIKeyHelp()}
                        .onLayoutModeChange=${layoutMode => this.handleLayoutModeChange(layoutMode)}
                        .onClearAndRestart=${() => this.handleClearAndRestart()}
                        .onLogout=${() => this.handleLogout()}
                    ></main-view>
                `;

            case 'customize':
                return html`
                    <customize-view
                        .selectedProfile=${this.selectedProfile}
                        .selectedLanguage=${this.selectedLanguage}
                        .selectedScreenshotInterval=${this.selectedScreenshotInterval}
                        .selectedImageQuality=${this.selectedImageQuality}
                        .layoutMode=${this.layoutMode}
                        .advancedMode=${this.advancedMode}
                        .onProfileChange=${profile => this.handleProfileChange(profile)}
                        .onLanguageChange=${language => this.handleLanguageChange(language)}
                        .onScreenshotIntervalChange=${interval => this.handleScreenshotIntervalChange(interval)}
                        .onImageQualityChange=${quality => this.handleImageQualityChange(quality)}
                        .onLayoutModeChange=${layoutMode => this.handleLayoutModeChange(layoutMode)}
                        .onAdvancedModeChange=${advancedMode => this.handleAdvancedModeChange(advancedMode)}
                    ></customize-view>
                `;

            case 'help':
                return html` <help-view .onExternalLinkClick=${url => this.handleExternalLinkClick(url)}></help-view> `;

            case 'advanced':
                return html` <advanced-view></advanced-view> `;

            case 'assistant':
                return html`
                    <assistant-view
                        .responses=${this.responses}
                        .currentResponseIndex=${this.currentResponseIndex}
                        .selectedProfile=${this.selectedProfile}
                        .selectedLanguage=${this.selectedLanguage}
                        .onSendText=${message => this.handleSendText(message)}
                        .shouldAnimateResponse=${this.shouldAnimateResponse}
                        @response-index-changed=${this.handleResponseIndexChanged}
                        @response-animation-complete=${() => {
                            this.shouldAnimateResponse = false;
                            this._currentResponseIsComplete = true;
                            console.log('[response-animation-complete] Marked current response as complete');
                            this.requestUpdate();
                        }}
                    ></assistant-view>
                `;

            default:
                return html`<div>Unknown view: ${this.currentView}</div>`;
        }
    }

    render() {
        const mainContentClass = `main-content ${
            this.currentView === 'assistant'
                ? 'assistant-view'
                : this.currentView === 'onboarding'
                  ? 'onboarding-view'
                  : this.currentView === 'login'
                    ? 'login-view'
                    : 'with-border'
        }`;

        // Hide header on login view
        const showHeader = this.currentView !== 'login';

        return html`
            <div class="window-container">
                <div class="container">
                    ${showHeader
                        ? html`
                              <app-header
                                  .currentView=${this.currentView}
                                  .statusText=${this.statusText}
                                  .startTime=${this.startTime}
                                  .currentMode=${this.currentMode}
                                  .currentModel=${this.currentModel}
                                  .advancedMode=${this.advancedMode}
                                  .rateLimitEndTime=${this.rateLimitEndTime}
                                  .rateLimitSource=${this.rateLimitSource}
                                  .onCustomizeClick=${() => this.handleCustomizeClick()}
                                  .onHelpClick=${() => this.handleHelpClick()}
                                  .onAdvancedClick=${() => this.handleAdvancedClick()}
                                  .onCloseClick=${() => this.handleClose()}
                                  .onBackClick=${() => this.handleBackClick()}
                                  .onHideToggleClick=${() => this.handleHideToggle()}
                                  .onRestartClick=${() => this.handleClearAndRestart()}
                                  .onRateLimitExpired=${() => this.clearRateLimit()}
                                  ?isClickThrough=${this._isClickThrough}
                              ></app-header>
                          `
                        : ''}
                    <div class="${mainContentClass}">
                        <div class="view-container">${this.renderCurrentView()}</div>
                    </div>
                </div>
            </div>
        `;
    }

    updateLayoutMode() {
        // Apply or remove compact layout class to document root
        if (this.layoutMode === 'compact') {
            document.documentElement.classList.add('compact-layout');
        } else {
            document.documentElement.classList.remove('compact-layout');
        }
    }

    async handleLayoutModeChange(layoutMode) {
        this.layoutMode = layoutMode;
        localStorage.setItem('layoutMode', layoutMode);
        this.updateLayoutMode();

        // Notify main process about layout change for window resizing
        if (window.require) {
            try {
                const { ipcRenderer } = window.require('electron');
                await ipcRenderer.invoke('update-sizes');
            } catch (error) {
                console.error('Failed to update sizes in main process:', error);
            }
        }

        this.requestUpdate();
    }
}

customElements.define('cheating-daddy-app', CheatingDaddyApp);
