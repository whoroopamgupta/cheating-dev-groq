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
            cursor: pointer;
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
        this.onCustomizeClick = () => {};
        this.onHelpClick = () => {};
        this.onHistoryClick = () => {};
        this.onCloseClick = () => {};
        this.onBackClick = () => {};
        this.onHideToggleClick = () => {};
        this.onRestartClick = () => {};
        this.isClickThrough = false;
        this.advancedMode = false;
        this.onAdvancedClick = () => {};
        this._timerInterval = null;
        // Rate limiting
        this.rateLimitEndTime = null;
        this.rateLimitSource = null;
        this.onRateLimitExpired = () => {};
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
            onboarding: 'Welcome to Cheating Dev',
            main: 'Cheating Dev',
            customize: 'Customize',
            help: 'Help & Shortcuts',
            history: 'Conversation History',
            advanced: 'Advanced Tools',
            assistant: 'Cheating Dev',
        };
        return titles[this.currentView] || 'Cheating Dev';
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
        const navigationViews = ['customize', 'help', 'advanced', 'history'];
        return navigationViews.includes(this.currentView);
    }

    async handleRateLimitLinkClick(e) {
        e.preventDefault();
        e.stopPropagation();
        const url = 'https://www.cheatingdev.in/groq-api-key';
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
                    ${modelName && this.currentView === 'assistant'
                        ? html`<span class="model-badge ${this.getModelBadgeClass()}">${modelName}</span>`
                        : ''}
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
                              <span>
                                  ${elapsedTime ? `Session: ${elapsedTime}` : ''}
                                  ${elapsedTime && this.statusText && !this.statusText.includes('Rate limited') ? ' · ' : ''}
                                  ${this.statusText && !this.statusText.includes('Rate limited') ? this.statusText : ''}
                              </span>
                          `
                        : ''}
                    ${this.currentView === 'main'
                        ? html`
                              ${this.advancedMode
                                  ? html`
                                        <button class="icon-button" @click=${this.onAdvancedClick}>
                                            <?xml version="1.0" encoding="UTF-8"?><svg
                                                width="24px"
                                                stroke-width="1.7"
                                                height="24px"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                                color="currentColor"
                                            >
                                                <path d="M18.5 15L5.5 15" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"></path>
                                                <path
                                                    d="M16 4L8 4"
                                                    stroke="currentColor"
                                                    stroke-width="1.7"
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                ></path>
                                                <path
                                                    d="M9 4.5L9 10.2602C9 10.7376 8.82922 11.1992 8.51851 11.5617L3.48149 17.4383C3.17078 17.8008 3 18.2624 3 18.7398V19C3 20.1046 3.89543 21 5 21L19 21C20.1046 21 21 20.1046 21 19V18.7398C21 18.2624 20.8292 17.8008 20.5185 17.4383L15.4815 11.5617C15.1708 11.1992 15 10.7376 15 10.2602L15 4.5"
                                                    stroke="currentColor"
                                                    stroke-width="1.7"
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                ></path>
                                                <path
                                                    d="M12 9.01L12.01 8.99889"
                                                    stroke="currentColor"
                                                    stroke-width="1.7"
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                ></path>
                                                <path
                                                    d="M11 2.01L11.01 1.99889"
                                                    stroke="currentColor"
                                                    stroke-width="1.7"
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                ></path>
                                            </svg>
                                        </button>
                                    `
                                  : ''}
                              <button class="icon-button" @click=${this.onCustomizeClick}>
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
                                          d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                                          stroke="currentColor"
                                          stroke-width="1.7"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                      ></path>
                                      <path
                                          d="M19.6224 10.3954L18.5247 7.7448L20 6L18 4L16.2647 5.48295L13.5578 4.36974L12.9353 2H10.981L10.3491 4.40113L7.70441 5.51596L6 4L4 6L5.45337 7.78885L4.3725 10.4463L2 11V13L4.40111 13.6555L5.51575 16.2997L4 18L6 20L7.79116 18.5403L10.397 19.6123L11 22H13L13.6045 19.6132L16.2551 18.5155C16.6969 18.8313 18 20 18 20L20 18L18.5159 16.2494L19.6139 13.598L21.9999 12.9772L22 11L19.6224 10.3954Z"
                                          stroke="currentColor"
                                          stroke-width="1.7"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                      ></path>
                                  </svg>
                              </button>
                              <button class="icon-button" @click=${this.onHelpClick}>
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
                                          d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                          stroke="currentColor"
                                          stroke-width="1.7"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                      ></path>
                                      <path
                                          d="M9 9C9 5.49997 14.5 5.5 14.5 9C14.5 11.5 12 10.9999 12 13.9999"
                                          stroke="currentColor"
                                          stroke-width="1.7"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                      ></path>
                                      <path
                                          d="M12 18.01L12.01 17.9989"
                                          stroke="currentColor"
                                          stroke-width="1.7"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                      ></path>
                                  </svg>
                              </button>
                              <button class="icon-button" @click=${this.onHistoryClick} title="Conversation History">
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
                                          d="M12 8V12L15 15"
                                          stroke="currentColor"
                                          stroke-width="1.7"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                      ></path>
                                      <path
                                          d="M3.05078 11.0001C3.27441 7.60061 5.22415 4.60729 8.14258 3.11572C11.061 1.62415 14.5625 1.85742 17.2725 3.72949C19.9824 5.60156 21.4951 8.83301 21.2715 12.2324C21.0479 15.6318 19.0981 18.6252 16.1797 20.1167C13.2612 21.6083 9.75977 21.375 7.0498 19.503"
                                          stroke="currentColor"
                                          stroke-width="1.7"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                      ></path>
                                      <path
                                          d="M6 6L3 3M3 3V6M3 3H6"
                                          stroke="currentColor"
                                          stroke-width="1.7"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                      ></path>
                                  </svg>
                              </button>
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
                              <button @click=${this.isNavigationView() ? this.onBackClick : this.onCloseClick} class="icon-button window-close">
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
