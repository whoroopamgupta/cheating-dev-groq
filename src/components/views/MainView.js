import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import { resizeLayout } from '../../utils/windowResize.js';
import { getActiveApiKey, isApiKeyIncluded } from '../../utils/apiKeyResolver.js';

export class MainView extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            cursor: default;
            user-select: none;
        }

        :host {
            display: block;
            width: 100%;
            height: 100%;
            color: #f5f6fa;
        }

        .home-layout {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            min-height: 0;
            padding: 20px 22px 16px;
            background:
                radial-gradient(520px 280px at 86% 4%, rgba(91, 99, 219, 0.11), transparent 68%),
                #0b0d12;
        }

        .session-card {
            display: flex;
            flex: 1;
            flex-direction: column;
            min-height: 0;
        }

        .card-topline {
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-height: 30px;
            gap: 14px;
            padding-bottom: 15px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.075);
        }

        .ready-state {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: #a1a8b8;
            font-size: 10px;
            font-weight: 650;
            letter-spacing: 0.095em;
            text-transform: uppercase;
        }

        .ready-dot {
            width: 6px;
            height: 6px;
            flex-shrink: 0;
            border-radius: 50%;
            background: #34d399;
            box-shadow: 0 0 0 4px rgba(52, 211, 153, 0.09);
        }

        .plan-actions {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 9px;
            min-width: 0;
        }

        .plan-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            min-width: 0;
            padding: 5px 8px;
            overflow: hidden;
            border: 1px solid rgba(124, 131, 255, 0.21);
            border-radius: 999px;
            background: rgba(124, 131, 255, 0.08);
            color: #c6caff;
            font-size: 10px;
            font-weight: 600;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .plan-badge svg {
            width: 12px;
            height: 12px;
            flex-shrink: 0;
        }

        .account-upgrade {
            flex-shrink: 0;
            color: #aeb5c5;
            font-size: 10px;
            font-weight: 600;
            text-decoration: none;
            transition: color 180ms ease;
        }

        .account-upgrade:hover {
            color: #f5f6fa;
        }

        .session-content {
            display: flex;
            flex: 1;
            flex-direction: column;
            justify-content: center;
            width: 100%;
            max-width: 450px;
            min-height: 0;
            margin: 0 auto;
            padding: 24px 0 20px;
        }

        .session-primary-row {
            display: flex;
            align-items: flex-end;
            gap: 18px;
            width: 100%;
        }

        .mode-panel {
            display: flex;
            align-items: center;
            min-width: 0;
            flex: 1;
        }

        .mode-copy {
            min-width: 0;
            flex: 1;
        }

        .mode-eyebrow {
            display: block;
            margin-bottom: 4px;
            color: #707889;
            font-size: 10px;
            font-weight: 650;
            letter-spacing: 0.08em;
            text-transform: uppercase;
        }

        .mode-name {
            display: block;
            overflow: hidden;
            color: #f5f6fa;
            font-size: 17px;
            font-weight: 650;
            letter-spacing: -0.02em;
            line-height: 1.2;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .session-guidance {
            max-width: 370px;
            margin: 13px 0 0;
            color: #a1a8b8;
            font-size: 13px;
            line-height: 1.55;
        }

        .action-area {
            width: 100%;
            margin-top: 13px;
        }

        .credentials {
            display: grid;
            gap: 7px;
            margin: 0 0 16px;
        }

        .credentials-label {
            color: #a1a8b8;
            font-size: 11px;
            font-weight: 600;
        }

        input {
            width: 100%;
            min-width: 0;
            padding: 11px 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            background: #11141b;
            color: #f5f6fa;
            font-size: 12px;
            transition: border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
        }

        input:focus {
            outline: none;
            border-color: rgba(124, 131, 255, 0.7);
            box-shadow: 0 0 0 3px rgba(124, 131, 255, 0.12);
            background: #171b24;
        }

        input::placeholder {
            color: #707889;
        }

        input.api-key-error {
            animation: blink-red 1s ease-in-out;
            border-color: #f87171;
        }

        @keyframes blink-red {
            0%, 100% { border-color: rgba(255, 255, 255, 0.1); }
            50% { border-color: #f87171; background: rgba(248, 113, 113, 0.08); }
        }

        .start-button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            min-width: 232px;
            min-height: 44px;
            max-width: 100%;
            margin-left: auto;
            padding: 11px 18px;
            border: 1px solid rgba(185, 191, 255, 0.35);
            border-radius: 11px;
            background: linear-gradient(115deg, #6366f1 0%, #7c83ff 55%, #8b5cf6 100%);
            color: #ffffff;
            box-shadow: 0 10px 22px rgba(79, 70, 229, 0.18);
            font-size: 13px;
            font-weight: 650;
            letter-spacing: -0.01em;
            white-space: nowrap;
            transition: transform 180ms ease, box-shadow 180ms ease, filter 180ms ease;
        }

        .start-button:hover:not(:disabled) {
            transform: translateY(-1px);
            filter: brightness(1.06);
            box-shadow: 0 14px 28px rgba(79, 70, 229, 0.26);
        }

        .start-button:focus-visible,
        .logout-button:focus-visible,
        .trial-limit button:focus-visible,
        .account-upgrade:focus-visible,
        .link:focus-visible {
            outline: 2px solid #a5b4fc;
            outline-offset: 3px;
        }

        .start-button:disabled {
            cursor: default;
            opacity: 0.58;
            box-shadow: none;
        }

        .below-action {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            gap: 12px;
            min-height: 16px;
            margin-top: 9px;
        }

        .shortcut-hint,
        .api-help {
            margin: 0;
            color: #707889;
            font-size: 10px;
            line-height: 1.4;
        }

        .api-help {
            text-align: right;
        }

        .link {
            color: #aeb5ff;
            text-decoration: none;
        }

        .trial-limit {
            display: flex;
            align-items: flex-start;
            gap: 9px;
            padding: 10px 0;
            border-top: 1px solid rgba(251, 146, 60, 0.22);
            border-bottom: 1px solid rgba(251, 146, 60, 0.16);
            color: #fdba74;
            font-size: 11px;
            line-height: 1.45;
        }

        .trial-limit svg {
            width: 15px;
            height: 15px;
            margin-top: 1px;
            flex-shrink: 0;
        }

        .trial-limit-copy {
            flex: 1;
        }

        .trial-limit strong {
            display: block;
            margin-bottom: 1px;
            color: #ffedd5;
        }

        .trial-limit button {
            flex-shrink: 0;
            border: 0;
            background: transparent;
            color: #fdba74;
            padding: 1px 0;
            font-size: 10px;
            font-weight: 700;
        }

        .trial-limit button:hover {
            color: #fff7ed;
        }

        .account-footer {
            display: flex;
            align-items: center;
            gap: 10px;
            min-height: 47px;
            padding-top: 13px;
            border-top: 1px solid rgba(255, 255, 255, 0.075);
        }

        .account-avatar {
            display: grid;
            place-items: center;
            width: 28px;
            height: 28px;
            flex-shrink: 0;
            border: 1px solid rgba(124, 131, 255, 0.18);
            border-radius: 9px;
            background: #171b24;
            color: #c6caff;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
        }

        .account-copy {
            min-width: 0;
            flex: 1;
        }

        .account-label {
            display: block;
            margin-bottom: 2px;
            color: #707889;
            font-size: 9px;
        }

        .user-email {
            display: block;
            overflow: hidden;
            color: #c5cad5;
            font-size: 11px;
            font-weight: 500;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .logout-button {
            display: flex;
            align-items: center;
            gap: 5px;
            flex-shrink: 0;
            border: 1px solid transparent;
            border-radius: 7px;
            background: transparent;
            color: #9098a8;
            padding: 6px 7px;
            font-size: 10px;
            transition: background 180ms ease, border-color 180ms ease, color 180ms ease;
        }

        .logout-button:hover {
            border-color: rgba(239, 68, 68, 0.24);
            background: rgba(239, 68, 68, 0.08);
            color: #fca5a5;
        }

        .logout-button svg {
            width: 12px;
            height: 12px;
        }

        @media (max-height: 470px) {
            .home-layout {
                padding-top: 14px;
            }

            .card-topline {
                padding-bottom: 10px;
            }

            .session-content {
                padding: 15px 0;
            }

            .session-guidance {
                margin-top: 12px;
            }

            .session-primary-row {
                gap: 12px;
            }
        }

        @media (max-width: 365px) {
            .session-primary-row {
                align-items: flex-start;
                flex-direction: column;
                gap: 14px;
            }

            .start-button {
                width: 100%;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                transition-duration: 0.01ms !important;
            }
        }
    `;

    static properties = {
        onStart: { type: Function },
        onAPIKeyHelp: { type: Function },
        isInitializing: { type: Boolean },
        onLayoutModeChange: { type: Function },
        onLogout: { type: Function },
        showApiKeyError: { type: Boolean },
        onClearAndRestart: { type: Function },
        selectedProfile: { type: String },
        sessionError: { type: String },
        onUpgrade: { type: Function },
    };

    constructor() {
        super();
        this.onStart = () => {};
        this.onAPIKeyHelp = () => {};
        this.isInitializing = false;
        this.onLayoutModeChange = () => {};
        this.onLogout = () => {};
        this.showApiKeyError = false;
        this.onClearAndRestart = () => {};
        this.sessionError = '';
        this.onUpgrade = () => {};
        this.boundKeydownHandler = this.handleKeydown.bind(this);
        // Load selected profile from localStorage (default to interview on first run)
        this.selectedProfile = localStorage.getItem('selectedProfile') || 'interview';
    }

    connectedCallback() {
        super.connectedCallback();
        window.electron?.ipcRenderer?.on('session-initializing', (event, isInitializing) => {
            this.isInitializing = isInitializing;
        });

        // Add keyboard event listener for Ctrl+Enter (or Cmd+Enter on Mac)
        document.addEventListener('keydown', this.boundKeydownHandler);

        // Load and apply layout mode on startup
        this.loadLayoutMode();
        // Resize window for this view
        resizeLayout();

        // Listen for profile changes from settings
        this.profileChangeHandler = () => {
            const newProfile = localStorage.getItem('selectedProfile') || 'interview';
            if (newProfile !== this.selectedProfile) {
                this.selectedProfile = newProfile;
                this.requestUpdate();
            }
        };
        window.addEventListener('storage', this.profileChangeHandler);

        // Also check periodically for profile changes (in case storage event doesn't fire)
        this.profileCheckInterval = setInterval(() => {
            const newProfile = localStorage.getItem('selectedProfile') || 'interview';
            if (newProfile !== this.selectedProfile) {
                this.selectedProfile = newProfile;
                this.requestUpdate();
            }
        }, 500);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.electron?.ipcRenderer?.removeAllListeners('session-initializing');
        // Remove keyboard event listener
        document.removeEventListener('keydown', this.boundKeydownHandler);
        // Clean up profile change listener
        if (this.profileChangeHandler) {
            window.removeEventListener('storage', this.profileChangeHandler);
        }
        if (this.profileCheckInterval) {
            clearInterval(this.profileCheckInterval);
        }
    }

    handleKeydown(e) {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const isStartShortcut = isMac ? e.metaKey && e.key === 'Enter' : e.ctrlKey && e.key === 'Enter';

        if (isStartShortcut) {
            e.preventDefault();
            this.handleStartClick();
        }
    }

    handleInput(e) {
        // Store API key based on current profile
        const apiKeyName = this.isExamMode() ? 'geminiApiKey' : 'groqApiKey';
        localStorage.setItem(apiKeyName, e.target.value);
        // Also store in legacy 'apiKey' for backward compatibility
        localStorage.setItem('apiKey', e.target.value);
        // Clear error state when user starts typing
        if (this.showApiKeyError) {
            this.showApiKeyError = false;
        }
    }

    // Check if current profile is exam mode (uses Gemini API)
    isExamMode() {
        return this.selectedProfile === 'exam';
    }

    // Get the current API key based on profile
    getCurrentApiKey() {
        if (this.isExamMode()) {
            return getActiveApiKey('exam');
        } else {
            const user = this.getLoggedInUser();
            if (user?.account_type === 'managed' || (isApiKeyIncluded(user) && user.api_key)) {
                return ''; // Return empty so the 'API Key included in plan' placeholder is visible
            }
            return (localStorage.getItem('groqApiKey') || '').trim();
        }
    }

    // Get the API key placeholder text
    getApiKeyPlaceholder() {
        return 'Enter your API key';
    }

    // Get the help link text
    getApiKeyHelpText() {
        return 'Get an API key';
    }

    async handleStartClick() {
        if (this.isInitializing) {
            return;
        }
        this.isInitializing = true;
        try {
            await this.onStart();
        } finally {
            this.isInitializing = false;
        }
    }

    handleAPIKeyHelpClick() {
        this.onAPIKeyHelp();
    }

    handleClearAndRestart() {
        this.onClearAndRestart();
    }

    handleResetOnboarding() {
        localStorage.removeItem('onboardingCompleted');
        // Refresh the page to trigger onboarding
        window.location.reload();
    }

    handleLogout() {
        this.onLogout();
    }

    getLoggedInUser() {
        try {
            const userInfo = localStorage.getItem('loggedInUser');
            if (userInfo) {
                return JSON.parse(userInfo);
            }
        } catch (e) {
            console.error('Error getting logged in user:', e);
        }
        return null;
    }

    getLoggedInEmail() {
        const user = this.getLoggedInUser();
        return user ? user.email || '' : '';
    }

    getAccountInitial() {
        const email = this.getLoggedInEmail();
        return email ? email.charAt(0) : 'U';
    }

    isPaidAccount(user) {
        if (!user) return false;
        if (user.unlimited === true || user.paid === true) return true;

        // Legacy subscribers do not have managed-account fields, but an active
        // named plan still represents the same paid, unlimited entitlement.
        const planName = String(user.plan_type || '').trim().toLowerCase();
        return Boolean(planName) && !/(free|trial)/.test(planName);
    }

    getCompactPlanLabel(user) {
        if (this.isPaidAccount(user)) {
            return 'Unlimited Access';
        }
        const remainingSeconds = Math.max(0, Number(user?.remaining_seconds) || 0);
        return `Free Trial · ${Math.ceil(remainingSeconds / 60)}m left`;
    }

    loadLayoutMode() {
        const savedLayoutMode = localStorage.getItem('layoutMode');
        if (savedLayoutMode && savedLayoutMode !== 'normal') {
            // Notify parent component to apply the saved layout mode
            this.onLayoutModeChange(savedLayoutMode);
        }
    }

    // Method to trigger the red blink animation
    triggerApiKeyError() {
        this.showApiKeyError = true;
        // Remove the error class after 1 second
        setTimeout(() => {
            this.showApiKeyError = false;
        }, 1000);
    }

    render() {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const user = this.getLoggedInUser();
        // API key included applies ONLY to Groq API (non-exam mode)
        const apiKeyIncluded = user?.account_type === 'managed' || (!this.isExamMode() && isApiKeyIncluded(user) && Boolean(user?.api_key));

        const profileNames = {
            interview: 'Job Interview',
            'exam-groq': 'Exam Assistant',
            sales: 'Sales Call',
            meeting: 'Business Meeting',
            presentation: 'Presentation',
            negotiation: 'Negotiation',
            exam: 'Exam Assistant',
        };
        const profileLabel = profileNames[this.selectedProfile] || 'Job Interview';
        const hasPaidAccess = this.isPaidAccount(user);

        return html`
            <div class="home-layout">
                <section class="session-card">
                    <div class="card-topline">
                        <span class="ready-state"><span class="ready-dot"></span>Ready to assist</span>
                        ${hasPaidAccess ? html`
                            <span class="plan-actions">
                                <span class="plan-badge">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="9"></circle>
                                        <path d="M12 7v5l3 2"></path>
                                    </svg>
                                    ${this.getCompactPlanLabel(user)}
                                </span>
                                ${user?.account_type === 'managed' ? html`
                                    <a class="account-upgrade" href="#" @click=${event => { event.preventDefault(); this.onUpgrade(); }}>Manage →</a>
                                ` : ''}
                            </span>
                        ` : ''}
                    </div>

                    <div class="session-content">
                        <div class="session-primary-row">
                            <div class="mode-panel">
                                <span class="mode-copy">
                                    <span class="mode-eyebrow">Selected mode</span>
                                    <span class="mode-name">${profileLabel}</span>
                                </span>
                            </div>
                            ${!this.sessionError ? html`
                                <button
                                    @click=${this.handleStartClick}
                                    ?disabled=${this.isInitializing}
                                    class="start-button"
                                >
                                    ${this.isInitializing ? 'Starting Interview Co-Pilot…' : 'Start Interview Co-Pilot'}
                                </button>
                            ` : ''}
                        </div>
                        <p class="session-guidance">Your session opens in a focused window and keeps your interview context ready.</p>

                        ${this.sessionError ? html`
                            <div class="trial-limit" role="alert">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="9"></circle>
                                    <path d="M12 8v5M12 16h.01"></path>
                                </svg>
                                <span class="trial-limit-copy"><strong>Free trial complete</strong>${this.sessionError}</span>
                                <button @click=${this.onUpgrade}>Explore plans →</button>
                            </div>
                        ` : html`
                            <div class="action-area">
                                ${user?.account_type !== 'managed' ? html`
                                    <label class="credentials">
                                        <span class="credentials-label">${apiKeyIncluded ? 'AI access' : 'API key'}</span>
                                        <input
                                            type="password"
                                            placeholder="${apiKeyIncluded ? 'Included with your Interview Cracked account' : this.getApiKeyPlaceholder()}"
                                            .value=${this.getCurrentApiKey()}
                                            @input=${this.handleInput}
                                            class="${this.showApiKeyError ? 'api-key-error' : ''}"
                                            ?disabled=${apiKeyIncluded}
                                        />
                                    </label>
                                ` : ''}

                                <div class="below-action">
                                    <p class="shortcut-hint">${isMac ? '⌘ + Enter' : 'Ctrl + Enter'} to start</p>
                                    ${!apiKeyIncluded ? html`
                                        <p class="api-help">Need a key? <span @click=${this.handleAPIKeyHelpClick} class="link">${this.getApiKeyHelpText()}</span></p>
                                    ` : ''}
                                </div>
                            </div>
                        `}
                    </div>
                </section>

                <footer class="account-footer">
                    <span class="account-avatar">${this.getAccountInitial()}</span>
                    <span class="account-copy">
                        <span class="account-label">Signed in as</span>
                        <span class="user-email">${this.getLoggedInEmail()}</span>
                    </span>
                    <button class="logout-button" @click=${this.handleLogout}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Sign out
                    </button>
                </footer>
            </div>
        `;
    }
}

customElements.define('main-view', MainView);
