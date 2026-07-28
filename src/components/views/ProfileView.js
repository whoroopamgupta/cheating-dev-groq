import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import { resizeLayout } from '../../utils/windowResize.js';
import '../common/CustomDropdown.js';

export class ProfileView extends LitElement {
    static styles = css`
        * {
            font-family:
                'Inter',
                -apple-system,
                BlinkMacSystemFont,
                sans-serif;
            cursor: default;
            user-select: none;
        }

        :host {
            display: block;
            padding: 8px;
            margin: 0 auto;
            max-width: 750px;
            overflow: visible;
        }

        .settings-container {
            display: grid;
            gap: 8px;
            padding-bottom: 10px;
        }

        .settings-section {
            background: var(--card-background, rgba(255, 255, 255, 0.04));
            border: 1px solid var(--card-border, rgba(255, 255, 255, 0.1));
            border-radius: 6px;
            padding: 12px;
            position: relative;
            overflow: visible;
        }

        .section-title {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: 600;
            color: var(--text-color);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .section-title::before {
            content: '';
            width: 3px;
            height: 14px;
            background: var(--accent-color, #007aff);
            border-radius: 1.5px;
        }

        .form-grid {
            display: grid;
            gap: 8px;
            overflow: visible;
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            align-items: start;
            overflow: visible;
        }

        @media (max-width: 600px) {
            .form-row {
                grid-template-columns: 1fr;
            }
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 4px;
            overflow: visible;
            position: relative;
        }

        .form-group.full-width {
            grid-column: 1 / -1;
        }

        .form-label {
            font-weight: 500;
            font-size: 12px;
            color: var(--label-color, rgba(255, 255, 255, 0.9));
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .form-description {
            font-size: 11px;
            color: var(--description-color, rgba(255, 255, 255, 0.5));
            line-height: 1.3;
            margin-top: 1px;
        }

        .form-control {
            background: var(--input-background, rgba(0, 0, 0, 0.3));
            color: var(--text-color);
            border: 1px solid var(--input-border, rgba(255, 255, 255, 0.15));
            padding: 8px 10px;
            border-radius: 4px;
            font-size: 12px;
            transition: all 0.15s ease;
            min-height: 16px;
            font-weight: 400;
        }

        .form-control:focus {
            outline: none;
            border-color: var(--focus-border-color, #007aff);
            box-shadow: 0 0 0 2px var(--focus-shadow, rgba(0, 122, 255, 0.1));
            background: var(--input-focus-background, rgba(0, 0, 0, 0.4));
        }

        .form-control:hover:not(:focus) {
            border-color: var(--input-hover-border, rgba(255, 255, 255, 0.2));
            background: var(--input-hover-background, rgba(0, 0, 0, 0.35));
        }

        /* Custom dropdown styling removed - now using custom-dropdown component */

        textarea.form-control {
            resize: vertical;
            min-height: 60px;
            line-height: 1.4;
            font-family: inherit;
        }

        textarea.form-control::placeholder {
            color: var(--placeholder-color, rgba(255, 255, 255, 0.4));
        }

        .profile-option {
            display: flex;
            flex-direction: column;
            gap: 3px;
        }

        .current-selection {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 10px;
            color: var(--success-color, #34d399);
            background: var(--success-background, rgba(52, 211, 153, 0.1));
            padding: 2px 6px;
            border-radius: 3px;
            font-weight: 500;
            border: 1px solid var(--success-border, rgba(52, 211, 153, 0.2));
        }

        .current-selection::before {
            content: '✓';
            font-weight: 600;
        }

        .keybind-input {
            cursor: default;
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
            text-align: center;
            letter-spacing: 0.5px;
            font-weight: 500;
        }

        .keybind-input:focus {
            cursor: default;
            background: var(--input-focus-background, rgba(0, 122, 255, 0.1));
        }

        .keybind-input::placeholder {
            color: var(--placeholder-color, rgba(255, 255, 255, 0.4));
            font-style: italic;
        }

        .reset-keybinds-button {
            background: var(--button-background, rgba(255, 255, 255, 0.1));
            color: var(--text-color);
            border: 1px solid var(--button-border, rgba(255, 255, 255, 0.15));
            padding: 6px 10px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 500;
            cursor: default;
            transition: all 0.15s ease;
        }

        .reset-keybinds-button:hover {
            background: var(--button-hover-background, rgba(255, 255, 255, 0.15));
            border-color: var(--button-hover-border, rgba(255, 255, 255, 0.25));
        }

        .reset-keybinds-button:active {
            transform: translateY(1px);
        }

        .keybinds-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            border-radius: 4px;
            overflow: hidden;
        }

        .keybinds-table th,
        .keybinds-table td {
            padding: 8px 10px;
            text-align: left;
            border-bottom: 1px solid var(--table-border, rgba(255, 255, 255, 0.08));
        }

        .keybinds-table th {
            background: var(--table-header-background, rgba(255, 255, 255, 0.04));
            font-weight: 600;
            font-size: 11px;
            color: var(--label-color, rgba(255, 255, 255, 0.8));
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .keybinds-table td {
            vertical-align: middle;
        }

        .keybinds-table .action-name {
            font-weight: 500;
            color: var(--text-color);
            font-size: 12px;
        }

        .keybinds-table .action-description {
            font-size: 10px;
            color: var(--description-color, rgba(255, 255, 255, 0.5));
            margin-top: 1px;
        }

        .keybinds-table .keybind-input {
            min-width: 100px;
            padding: 4px 8px;
            margin: 0;
            font-size: 11px;
        }

        .keybinds-table tr:hover {
            background: var(--table-row-hover, rgba(255, 255, 255, 0.02));
        }

        .keybinds-table tr:last-child td {
            border-bottom: none;
        }

        .table-reset-row {
            border-top: 1px solid var(--table-border, rgba(255, 255, 255, 0.08));
        }

        .table-reset-row td {
            padding-top: 10px;
            padding-bottom: 8px;
            border-bottom: none;
        }

        .settings-note {
            font-size: 10px;
            color: var(--note-color, rgba(255, 255, 255, 0.4));
            font-style: italic;
            text-align: center;
            margin-top: 6px;
            padding: 6px;
            background: var(--note-background, rgba(255, 255, 255, 0.02));
            border-radius: 4px;
            border: 1px solid var(--note-border, rgba(255, 255, 255, 0.08));
        }

        .checkbox-group {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 6px;
            padding: 6px;
            background: var(--checkbox-background, rgba(255, 255, 255, 0.02));
            border-radius: 4px;
            border: 1px solid var(--checkbox-border, rgba(255, 255, 255, 0.06));
        }

        .checkbox-input {
            width: 14px;
            height: 14px;
            accent-color: var(--focus-border-color, #007aff);
            cursor: default;
        }

        .checkbox-label {
            font-weight: 500;
            font-size: 12px;
            color: var(--label-color, rgba(255, 255, 255, 0.9));
            cursor: default;
            user-select: none;
        }

        /* Better focus indicators */
        .form-control:focus-visible {
            outline: none;
            border-color: var(--focus-border-color, #007aff);
            box-shadow: 0 0 0 2px var(--focus-shadow, rgba(0, 122, 255, 0.1));
        }

        /* Improved button states */
        .reset-keybinds-button:focus-visible {
            outline: none;
            border-color: var(--focus-border-color, #007aff);
            box-shadow: 0 0 0 2px var(--focus-shadow, rgba(0, 122, 255, 0.1));
        }

        /* Slider styles */
        .slider-container {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .slider-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .slider-value {
            font-size: 11px;
            color: var(--success-color, #34d399);
            background: var(--success-background, rgba(52, 211, 153, 0.1));
            padding: 2px 6px;
            border-radius: 3px;
            font-weight: 500;
            border: 1px solid var(--success-border, rgba(52, 211, 153, 0.2));
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
        }

        .slider-input {
            -webkit-appearance: none;
            appearance: none;
            width: 100%;
            height: 4px;
            border-radius: 2px;
            background: var(--input-background, rgba(0, 0, 0, 0.3));
            outline: none;
            border: 1px solid var(--input-border, rgba(255, 255, 255, 0.15));
            cursor: default;
        }

        .slider-input::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: var(--focus-border-color, #007aff);
            cursor: default;
            border: 2px solid var(--text-color, white);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider-input::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: var(--focus-border-color, #007aff);
            cursor: default;
            border: 2px solid var(--text-color, white);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider-input:hover::-webkit-slider-thumb {
            background: var(--text-input-button-hover, #0056b3);
        }

        .slider-input:hover::-moz-range-thumb {
            background: var(--text-input-button-hover, #0056b3);
        }

        .slider-labels {
            display: flex;
            justify-content: space-between;
            margin-top: 4px;
            font-size: 10px;
            color: var(--description-color, rgba(255, 255, 255, 0.5));
        }

        .mode-display-box {
            background: var(--input-background, rgba(0, 0, 0, 0.3));
            border: 1px solid var(--input-border, rgba(255, 255, 255, 0.15));
            border-radius: 4px;
            padding: 8px 12px;
            font-size: 12px;
            color: var(--text-color);
            cursor: default;
        }

        .warning-box {
            background: var(--warning-background, rgba(251, 191, 36, 0.08));
            border: 1px solid var(--warning-border, rgba(251, 191, 36, 0.2));
            border-radius: 4px;
            padding: 12px;
            font-size: 11px;
            color: var(--warning-color, #fbbf24);
            display: flex;
            align-items: flex-start;
            gap: 8px;
            line-height: 1.4;
        }

        .warning-icon {
            flex-shrink: 0;
            font-size: 12px;
            margin-top: 1px;
        }

        .resume-upload-box {
            background: var(--upload-box-bg, rgba(255, 255, 255, 0.03));
            border: 2px dashed var(--upload-box-border, rgba(255, 255, 255, 0.15));
            border-radius: 8px;
            padding: 24px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }

        .resume-upload-box:hover {
            background: var(--upload-box-hover-bg, rgba(255, 255, 255, 0.08));
            border-color: var(--upload-box-hover-border, var(--accent-color, #007aff));
        }

        .resume-upload-box.disabled {
            opacity: 0.6;
            cursor: not-allowed;
            pointer-events: none;
        }

        .resume-upload-icon {
            width: 32px;
            height: 32px;
            color: var(--upload-icon-color, rgba(255, 255, 255, 0.6));
        }

        .resume-upload-text {
            font-size: 13px;
            font-weight: 500;
            color: var(--text-color);
        }
        
        .resume-upload-subtext {
            font-size: 11px;
            color: var(--description-color, rgba(255, 255, 255, 0.5));
        }

        .resume-status {
            font-size: 11px;
            margin-top: 6px;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .resume-status.success { color: var(--success-color, #34d399); }
        .resume-status.error { color: var(--error-color, #ef4444); }
        .resume-status.loading { color: var(--warning-color, #fbbf24); }
    `;

    static properties = {
        selectedProfile: { type: String },
        onProfileChange: { type: Function },
        selectedMode: { type: String },
        isUploadingResume: { type: Boolean },
        resumeUploadError: { type: String },
        resumeUploadSuccess: { type: Boolean },
    };

    constructor() {
        super();
        this.selectedProfile = 'exam';
        this.selectedMode = 'interview';
        this.isUploadingResume = false;
        this.resumeUploadError = '';
        this.resumeUploadSuccess = false;
        this.onProfileChange = () => { };
    }

    connectedCallback() {
        super.connectedCallback();
        resizeLayout();
    }

    getProfiles() {
        return [
            {
                value: 'interview',
                name: 'Job Interview',
                description: 'Get help with answering interview questions',
            },
            {
                value: 'product',
                name: 'Job Interview - Product Based',
                description: 'Product sense, estimation, strategy & metrics for PM interviews at top companies',
            },
            {
                value: 'sales',
                name: 'Sales Call',
                description: 'Assist with sales conversations and objection handling',
            },
            {
                value: 'meeting',
                name: 'Business Meeting',
                description: 'Support for professional meetings and discussions',
            },
            {
                value: 'presentation',
                name: 'Presentation',
                description: 'Help with presentations and public speaking',
            },
            {
                value: 'negotiation',
                name: 'Negotiation',
                description: 'Guidance for business negotiations and deals',
            },
            {
                value: 'exam-groq',
                name: 'Exam Assistant (Groq)',
                description: 'NEW & RECOMMENDED: Exam assistance powered by Groq API - faster responses',
            },
            {
                value: 'exam',
                name: 'Exam Assistant (Gemini)',
                description: 'Academic assistance using Gemini API for test-taking and exam questions',
            },
        ];
    }

    getProfileNames() {
        return {
            interview: 'Job Interview',
            sales: 'Sales Call',
            meeting: 'Business Meeting',
            presentation: 'Presentation',
            negotiation: 'Negotiation',
            'exam-groq': 'Exam Assistant (Groq)',
            exam: 'Exam Assistant (Gemini)',
            product: 'Job Interview - Product Based',
        };
    }

    handleProfileSelect(e) {
        // Save current textarea content to the previous profile before switching
        const currentTextareaValue = this.shadowRoot?.querySelector('textarea')?.value || localStorage.getItem('customPrompt') || '';
        if (this.selectedProfile && currentTextareaValue !== undefined) {
            this.setCustomPromptForProfile(this.selectedProfile, currentTextareaValue);
        }

        // Switch to new profile
        this.selectedProfile = e.target.value;
        localStorage.setItem('selectedProfile', this.selectedProfile);

        // Load instructions for the new profile
        const newProfileInstructions = this.getCustomPromptForProfile(this.selectedProfile);
        localStorage.setItem('customPrompt', newProfileInstructions);

        // Auto-set mode based on profile
        if (this.selectedProfile === 'exam') {
            // Exam Assistant (Gemini) -> Coding/OA mode
            this.selectedMode = 'coding';
            localStorage.setItem('selectedMode', 'coding');
        } else if (this.selectedProfile === 'exam-groq') {
            // Exam Assistant (Groq) -> Interview mode with exam prompts
            this.selectedMode = 'interview';
            localStorage.setItem('selectedMode', 'interview');
        } else {
            // All other profiles -> Interview mode
            this.selectedMode = 'interview';
            localStorage.setItem('selectedMode', 'interview');
        }

        // Update the textarea value
        this.requestUpdate();

        this.onProfileChange(this.selectedProfile);
    }

    handleCustomPromptInput(e) {
        // Store custom prompt for the current profile
        this.setCustomPromptForProfile(this.selectedProfile, e.target.value);
    }

    getCustomPromptForProfile(profile) {
        const key = `customPrompt_${profile}`;
        const saved = localStorage.getItem(key);
        if (saved !== null) {
            return saved;
        }
        // If no custom prompt exists for this profile, return default instructions
        return this.getDefaultInstructions(profile);
    }

    setCustomPromptForProfile(profile, value) {
        const key = `customPrompt_${profile}`;
        localStorage.setItem(key, value);
        // Also update the legacy customPrompt for compatibility
        localStorage.setItem('customPrompt', value);
    }

    getDefaultInstructions(profile) {
        const defaultInstructions = {
            exam: `Help me with MCQ, coding and aptitude questions. Provide clear answers.`,
            interview: `Help me with technical and HR interview questions. Give natural, professional responses.`,
            sales: `Help me with sales calls and client conversations. Provide persuasive, relationship-building responses.`,
            meeting: `Help me in business meetings and discussions. Give professional, collaborative input.`,
            presentation: `Help me with presentations and public speaking. Provide engaging, confident responses.`,
            negotiation: `Help me with business negotiations and deals. Give strategic, win-win focused advice.`,
        };
        return defaultInstructions[profile] || '';
    }

    async handleResumeUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        this.isUploadingResume = true;
        this.resumeUploadError = '';
        this.resumeUploadSuccess = false;

        try {
            const { ipcRenderer } = window.require('electron');
            
            // 1. Send file path to main process to extract raw text
            const extractResult = await ipcRenderer.invoke('process-resume', file.path);
            
            if (!extractResult.success) {
                throw new Error(extractResult.error || 'Failed to extract text from file');
            }

            // 2. Send raw text to Groq API to normalize it
            const apiKey = localStorage.getItem('apiKey')?.trim();
            if (!apiKey) {
                throw new Error('API key is missing. Please set your API key in the settings first.');
            }
            const normalizeResult = await ipcRenderer.invoke('groq-normalize-resume', { rawText: extractResult.text, apiKey });

            if (!normalizeResult.success) {
                throw new Error(normalizeResult.error || 'Failed to normalize resume text via Groq');
            }

            // 3. Save normalized context
            localStorage.setItem('resumeContext', normalizeResult.text);
            this.resumeUploadSuccess = true;
            
        } catch (err) {
            console.error('Resume upload error:', err);
            this.resumeUploadError = err.message || 'An error occurred during upload';
        } finally {
            this.isUploadingResume = false;
            // Reset input so the same file can be uploaded again if needed
            e.target.value = '';
        }
    }

    renderResumeStatus() {
        if (this.isUploadingResume) {
            return html`<div class="resume-status loading">⏳ Processing via Groq AI... This may take a moment.</div>`;
        }
        if (this.resumeUploadError) {
            return html`<div class="resume-status error">❌ ${this.resumeUploadError}</div>`;
        }
        if (this.resumeUploadSuccess) {
            return html`<div class="resume-status success">✅ Resume knowledge updated successfully!</div>`;
        }
        
        const existingContext = localStorage.getItem('resumeContext');
        if (existingContext) {
            return html`<div class="resume-status success">✅ Resume knowledge is active.</div>`;
        }
        
        return html``;
    }

    render() {
        const profiles = this.getProfiles();
        const profileNames = this.getProfileNames();
        const currentProfile = profiles.find(p => p.value === this.selectedProfile);

        return html`
            <div class="settings-container">
                <!-- Profile & Behavior Section -->
                <div class="settings-section">
                    <div class="section-title">
                        <span>AI Profile & Behavior</span>
                    </div>

                    <div class="form-grid">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">
                                    Profile Type
                                    <span class="current-selection">${currentProfile?.name || 'Unknown'}</span>
                                </label>
                                <custom-dropdown
                                    .value=${this.selectedProfile}
                                    .options=${profiles.map(p => ({ value: p.value, label: p.name }))}
                                    @change=${e => this.handleProfileSelect({ target: { value: e.detail.value } })}
                                ></custom-dropdown>
                            </div>
                        </div>

                        <!-- Resume Upload Section -->
                        <div class="form-group full-width">
                            <label class="form-label">Background Knowledge (Resume)</label>
                            <div>
                                <input type="file" id="resume-upload-input" accept=".pdf,.docx,.txt" style="display: none" @change=${this.handleResumeUpload} />
                                <div class="resume-upload-box ${this.isUploadingResume ? 'disabled' : ''}" @click=${() => !this.isUploadingResume && this.shadowRoot.getElementById('resume-upload-input').click()}>
                                    <svg class="resume-upload-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <div class="resume-upload-text">
                                        ${this.isUploadingResume ? 'Processing...' : 'Click to Upload Resume'}
                                    </div>
                                    <div class="resume-upload-subtext">
                                        Supports PDF, DOCX, TXT
                                    </div>
                                </div>
                                ${this.renderResumeStatus()}
                            </div>
                            <div class="form-description">
                                Upload your resume to give the AI context about your background. The AI will extract key info to use in conversations.
                            </div>
                        </div>

                        <div class="form-group full-width">
                            <label class="form-label">Custom AI Instructions</label>
                            <textarea
                                class="form-control"
                                placeholder="Add specific instructions for how you want the AI to behave during ${profileNames[this.selectedProfile] || 'this interaction'}..."
                                .value=${localStorage.getItem('customPrompt') || ''}
                                rows="4"
                                @input=${this.handleCustomPromptInput}
                            ></textarea>
                            <div class="form-description">
                                Personalize the AI's behavior with specific instructions that will be added to the
                                ${profileNames[this.selectedProfile] || 'selected profile'} base prompts
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}
customElements.define('profile-view', ProfileView);
