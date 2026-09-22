import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';

export class AppHeader extends LitElement {
    static styles = css`
        * {
            font-family: 'Inter', sans-serif;
            cursor: default;
            user-select: none;
        }

        .header {
            -webkit-app-region: drag;
            display: flex;
            align-items: center;
            padding: var(--header-padding);
            border: 1px solid var(--border-color);
            background: var(--header-background);
            border-radius: var(--border-radius);
        }

        .header-title {
            flex: 1;
            font-size: var(--header-font-size);
            font-weight: 600;
            -webkit-app-region: drag;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .model-badge {
            font-size: 10px;
            font-weight: 600;
            padding: 3px 8px;
            border-radius: 4px;
            background: var(--accent-background, rgba(0, 122, 255, 0.15));
            color: var(--accent-color, #007aff);
            border: 1px solid var(--accent-border, rgba(0, 122, 255, 0.3));
            text-transform: uppercase;
            letter-spacing: 0.5px;
            white-space: nowrap;
        }

        .model-badge.interview {
            background: rgba(52, 211, 153, 0.15);
            color: var(--model-badge-interview-color, #34d399);
            border-color: rgba(52, 211, 153, 0.3);
        }

        .model-badge.coding {
            background: rgba(251, 146, 60, 0.15);
            color: var(--model-badge-coding-color, #fb923c);
            border-color: rgba(251, 146, 60, 0.3);
        }

        .rate-limit-badge {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 11px;
            font-weight: 600;
            padding: 4px 10px;
            border-radius: 4px;
            background: rgba(239, 68, 68, 0.15);
            color: #ef4444;
            border: 1px solid rgba(239, 68, 68, 0.3);
            animation: pulse-warning 1.5s ease-in-out infinite;
        }

        .rate-limit-badge .timer-icon {
            width: 14px;
            height: 14px;
        }

        .rate-limit-link {
            font-size: 10px;
            color: #ef4444;
            text-decoration: underline;
            cursor: default;
            opacity: 0.8;
            transition: opacity 0.2s ease;
            margin-top: 4px;
            display: block;
        }

        .rate-limit-link:hover {
            opacity: 1;
        }

        .rate-limit-container {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
        }

        @keyframes pulse-warning {
            0%,
            100% {
                opacity: 1;
            }
            50% {
                opacity: 0.7;
            }
        }

        .header-actions {
            display: flex;
            gap: var(--header-gap);
            align-items: center;
            -webkit-app-region: no-drag;
        }

        .status-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.15);
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
            color: var(--text-color, #fff);
            box-shadow: 0 0 8px rgba(255, 255, 255, 0.05);
        }

        .status-spinner {
            width: 10px;
            height: 10px;
            border: 1.5px solid rgba(255, 255, 255, 0.3);
            border-top-color: var(--text-color, #fff);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .header-actions span {
            font-size: var(--header-font-size-small);
            color: var(--header-actions-color);
        }

        .button {
            background: var(--button-background);
            color: var(--text-color);
            border: 1px solid var(--button-border);
            padding: var(--header-button-padding);
            border-radius: 8px;
            font-size: var(--header-font-size-small);
            font-weight: 500;
        }

        .icon-button {
            background: none;
            color: var(--icon-button-color);
            border: none;
            padding: var(--header-icon-padding);
            border-radius: 8px;
            font-size: var(--header-font-size-small);
            font-weight: 500;
            display: flex;
            opacity: 0.6;
            transition: opacity 0.2s ease;
        }

        .icon-button svg {
            width: var(--icon-size);
            height: var(--icon-size);
        }

        .icon-button:hover {
            background: var(--hover-background);
            opacity: 1;
        }

        .button:hover {
            background: var(--hover-background);
        }

        :host([isclickthrough]) .button:hover,
        :host([isclickthrough]) .icon-button:hover {
            background: transparent;
        }

        .key {
            background: var(--key-background);
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 12px;
            margin: 0px;
        }

        .back-button {
            -webkit-app-region: no-drag;
            background: none;
            color: var(--icon-button-color, rgba(255, 255, 255, 0.6));
            border: none;
            padding: 4px 10px 4px 6px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            font-weight: 500;
            cursor: default;
            transition: all 0.2s ease;
        }

        .back-button svg {
            width: 16px;
            height: 16px;
        }

        .back-button:hover {
            background: var(--hover-background, rgba(255, 255, 255, 0.08));
            color: var(--text-color, #e5e5e7);
        }
    `;

    static properties = {
        currentView: { type: String },
        statusText: { type: String },
        startTime: { type: Number },
        currentMode: { type: String },
        currentModel: { type: String },
        onCustomizeClick: { type: Function },
        onHelpClick: { type: Function },
        onHistoryClick: { type: Function },
        onCloseClick: { type: Function },
        onBackClick: { type: Function },
        onHideToggleClick: { type: Function },
        onRestartClick: { type: Function },
        isClickThrough: { type: Boolean, reflect: true },
        advancedMode: { type: Boolean },
        onAdvancedClick: { type: Function },
        // Rate limiting properties
        rateLimitEndTime: { type: Number },
        rateLimitSource: { type: String },
        onRateLimitExpired: { type: Function },
    };

    constructor() {
        super();
        this.currentView = 'main';
        this.statusText = '';
        this.startTime = null;
        this.currentMode = 'interview';
        this.currentModel = '';
        this.onCustomizeClick = () => { };
        this.onHelpClick = () => { };
        this.onHistoryClick = () => { };
        this.onCloseClick = () => { };
        this.onBackClick = () => { };
        this.onHideToggleClick = () => { };
        this.onRestartClick = () => { };
        this.isClickThrough = false;
        this.advancedMode = false;
        this.onAdvancedClick = () => { };
        this._timerInterval = null;
        // Rate limiting
        this.rateLimitEndTime = null;
        this.rateLimitSource = null;
        this.onRateLimitExpired = () => { };
        this._rateLimitInterval = null;
    }

    connectedCallback() {
        super.connectedCallback();
        this._startTimer();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this._stopTimer();
        this._stopRateLimitTimer();
    }

    updated(changedProperties) {
        super.updated(changedProperties);

        // Start/stop timer based on view change
        if (changedProperties.has('currentView')) {
            if (this.currentView === 'assistant' && this.startTime) {
                this._startTimer();
            } else {
                this._stopTimer();
            }
        }

        // Start timer when startTime is set
        if (changedProperties.has('startTime')) {
            if (this.startTime && this.currentView === 'assistant') {
                this._startTimer();
            } else if (!this.startTime) {
                this._stopTimer();
            }
        }

        // Start/stop rate limit timer
        if (changedProperties.has('rateLimitEndTime')) {
            console.log('[AppHeader] rateLimitEndTime changed:', this.rateLimitEndTime);
            if (this.rateLimitEndTime && this.rateLimitEndTime > Date.now()) {
                this._startRateLimitTimer();
            } else {
                this._stopRateLimitTimer();
            }
        }
    }

    _startTimer() {
        // Clear any existing timer
        this._stopTimer();

        // Only start timer if we're in assistant view and have a start time
        if (this.currentView === 'assistant' && this.startTime) {
            this._timerInterval = setInterval(() => {
                // Trigger a re-render by requesting an update
                this.requestUpdate();
            }, 1000); // Update every second
        }
    }

    _stopTimer() {
        if (this._timerInterval) {
            clearInterval(this._timerInterval);
            this._timerInterval = null;
        }
    }

    _startRateLimitTimer() {
        // Clear any existing rate limit timer
        this._stopRateLimitTimer();

        // Start rate limit countdown timer
        if (this.rateLimitEndTime && this.rateLimitEndTime > Date.now()) {
            const remaining = Math.ceil((this.rateLimitEndTime - Date.now()) / 1000);
            console.log(`[AppHeader] Starting rate limit timer for ${remaining}s`);

            this._rateLimitInterval = setInterval(() => {
                const now = Date.now();
                if (!this.rateLimitEndTime || this.rateLimitEndTime <= now) {
                    // Rate limit expired
                    console.log('[AppHeader] Rate limit expired, calling onRateLimitExpired');
                    this._stopRateLimitTimer();
                    if (this.onRateLimitExpired) {
                        this.onRateLimitExpired();
                    }
                } else {
                    // Trigger re-render to update countdown
                    this.requestUpdate();
                }
            }, 1000);
        }
    }

    _stopRateLimitTimer() {
        if (this._rateLimitInterval) {
            clearInterval(this._rateLimitInterval);
            this._rateLimitInterval = null;
        }
    }

    getRateLimitCountdown() {
        if (!this.rateLimitEndTime) return null;

        const remainingMs = this.rateLimitEndTime - Date.now();
        if (remainingMs <= 0) return null;

        const seconds = Math.ceil(remainingMs / 1000);
        if (seconds >= 60) {
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${minutes}:${String(secs).padStart(2, '0')}`;
        }
        return `${seconds}s`;
    }

    getViewTitle() {
        const titles = {
            onboarding: 'Welcome to Interview Cracked',
            main: 'Interview Cracked',
            profile: 'AI Profile & Behavior',
            customize: 'Customize',
            help: 'Help & Shortcuts',
            history: 'Conversation History',
            advanced: 'Advanced Tools',
            assistant: 'Interview Cracked',
        };
        return titles[this.currentView] || 'Interview Cracked';
    }

    getElapsedTime() {
        if (this.currentView === 'assistant' && this.startTime) {
            const totalSeconds = Math.floor((Date.now() - this.startTime) / 1000);

            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            // Format with leading zeros
            const pad = num => String(num).padStart(2, '0');

            if (hours > 0) {
                // Show hours when > 0: "1:23:45"
                return `${hours}:${pad(minutes)}:${pad(seconds)}`;
            } else {
                // Show minutes and seconds: "23:45"
                return `${minutes}:${pad(seconds)}`;
            }
        }
        return '';
    }

    getModelDisplayName() {
        if (!this.currentModel) return '';

        // Format model names for display
        const modelMap = {
            'gpt-oss-120b': 'GPT 120B',
            'gpt-oss-20b': 'GPT 20B',
            'gemini-live-2.5-flash-preview': '2.5 Flash Live',
            'gemini-2.5-flash-native-audio-preview-09-2025': '2.5 Flash Live',
            'gemini-2.5-flash': '2.5 Flash',
            'gemini-2.5-pro': '2.5 Pro',
            'gemini-2.0-flash-exp': '2.0 Flash',
        };

        return modelMap[this.currentModel] || this.currentModel;
    }

    getModelBadgeClass() {
        return this.currentMode === 'interview' ? 'interview' : 'coding';
    }

    isNavigationView() {
        const navigationViews = ['profile', 'customize', 'help', 'advanced', 'history'];
        return navigationViews.includes(this.currentView);
    }

    async handleRateLimitLinkClick(e) {
        e.preventDefault();
        e.stopPropagation();
        const url = 'https://www.interviewcracked.com/groq-api-key';
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            await ipcRenderer.invoke('open-external', url);
        }
    }

    render() {
        const elapsedTime = this.getElapsedTime();
        const modelName = this.getModelDisplayName();
        const rateLimitCountdown = this.getRateLimitCountdown();

        return html`
            <div class="header">
                <div class="header-title">
                    ${this.getViewTitle()}
                </div>
                <div class="header-actions">
                    ${rateLimitCountdown && this.currentView === 'assistant'
                ? html`
                              <div class="rate-limit-container">
                              <div class="rate-limit-badge">
                                      <svg class="timer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
                                          <circle cx="12" cy="12" r="9"></circle>
                                          <path d="M12 7v5l3 3"></path>
                                  </svg>
                                      <span>
                                          ${this.rateLimitSource ? `${this.rateLimitSource} limit` : 'API limit'} · rate limited
                                          (${rateLimitCountdown})
                                      </span>
                                  </div>
                                  <span class="rate-limit-link" @click=${this.handleRateLimitLinkClick}> See point 4 to remove rate limits → </span>
                              </div>
                          `
                : ''}
                    ${this.currentView === 'assistant'
                ? html`
                              <span style="display: flex; align-items: center; gap: 4px;">
                                  ${elapsedTime ? html`
                                      <svg style="width: 14px; height: 14px; opacity: 0.7;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                          <circle cx="12" cy="12" r="9"></circle>
                                          <path d="M12 7v5l2.5 2.5"></path>
                                      </svg>
                                      Session: ${elapsedTime}
                                  ` : ''}
                                  ${elapsedTime && this.statusText && !this.statusText.includes('Rate limited') ? html`<span style="opacity: 0.5;">·</span>` : ''}
                                  ${this.statusText && !this.statusText.includes('Rate limited')
                                      ? this.statusText.endsWith('...')
                                          ? html`
                                              <span class="status-pill">
                                                  <div class="status-spinner"></div>
                                                  ${this.statusText}
                                              </span>
                                            `
                                          : html`<span style="opacity: 0.8;">${this.statusText}</span>`
                                      : ''}
                              </span>
                          `
                : ''}

                    ${this.currentView === 'assistant'
                ? html`
                              <button @click=${this.onCloseClick} class="icon-button window-close">
                                  <?xml version="1.0" encoding="UTF-8"?><svg
                                      width="24px"
                                      height="24px"
                                      stroke-width="1.7"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                      color="currentColor"
                                  >
                                      <path
                                          d="M6.75827 17.2426L12.0009 12M17.2435 6.75736L12.0009 12M12.0009 12L6.75827 6.75736M12.0009 12L17.2435 17.2426"
                                          stroke="currentColor"
                                          stroke-width="1.7"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                      ></path>
                                  </svg>
                              </button>
                          `
                : html`
                              <button @click=${this.onCloseClick} class="icon-button window-close">
                                  <?xml version="1.0" encoding="UTF-8"?><svg
                                      width="24px"
                                      height="24px"
                                      stroke-width="1.7"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                      color="currentColor"
                                  >
                                      <path
                                          d="M6.75827 17.2426L12.0009 12M17.2435 6.75736L12.0009 12M12.0009 12L6.75827 6.75736M12.0009 12L17.2435 17.2426"
                                          stroke="currentColor"
                                          stroke-width="1.7"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                      ></path>
                                  </svg>
                              </button>
                          `}
                </div>
            </div>
        `;
    }
}

customElements.define('app-header', AppHeader);
