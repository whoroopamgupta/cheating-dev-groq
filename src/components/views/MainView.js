import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import { resizeLayout } from '../../utils/windowResize.js';
import { getActiveApiKey, isApiKeyIncluded } from '../../utils/apiKeyResolver.js';

export class MainView extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: 'Inter', sans-serif;
            cursor: default;
            user-select: none;
        }

        :host {
            display: block;
            width: 100%;
            max-width: 520px;
            height: 100%;
        }

        .home-layout {
            display: flex;
            flex-direction: column;
            height: 100%;
            min-height: 0;
            gap: 14px;
        }

        .session-card {
            position: relative;
            display: flex;
            flex: 1;
            flex-direction: column;
            overflow: hidden;
            min-height: 0;
            padding: 20px 22px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 18px;
            background:
                radial-gradient(circle at 100% 0%, rgba(59, 130, 246, 0.1), transparent 42%),
                linear-gradient(145deg, rgba(255, 255, 255, 0.048), rgba(255, 255, 255, 0.016));
            box-shadow: 0 18px 42px rgba(0, 0, 0, 0.16);
        }

        .card-topline {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 20px;
        }

        .ready-state {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            color: rgba(255, 255, 255, 0.62);
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
        }

        .ready-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #34d399;
            box-shadow: 0 0 0 4px rgba(52, 211, 153, 0.1);
        }

        .plan-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            min-width: 0;
            padding: 4px 7px;
            border: 1px solid rgba(125, 211, 252, 0.16);
            border-radius: 999px;
            background: rgba(14, 165, 233, 0.08);
            color: #bae6fd;
            font-size: 9px;
            font-weight: 600;
        }

        .plan-badge svg {
            width: 12px;
            height: 12px;
            flex-shrink: 0;
        }

        .mode-panel {
            display: flex;
            align-items: center;
            gap: 13px;
            min-height: 70px;
            padding: 14px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 13px;
            background: rgba(2, 8, 23, 0.32);
        }

        .mode-icon {
            display: grid;
            place-items: center;
            width: 38px;
            height: 38px;
            flex-shrink: 0;
            border: 1px solid rgba(96, 165, 250, 0.2);
            border-radius: 11px;
            background: rgba(59, 130, 246, 0.1);
            color: #93c5fd;
        }

        .mode-icon svg {
            width: 20px;
            height: 20px;
        }

        .mode-copy {
            min-width: 0;
            flex: 1;
        }

        .mode-eyebrow {
            display: block;
            margin-bottom: 4px;
            color: rgba(255, 255, 255, 0.42);
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
        }

        .mode-name {
            display: block;
            overflow: hidden;
            color: rgba(255, 255, 255, 0.88);
            font-size: 14px;
            font-weight: 600;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .session-content {
            display: flex;
            flex: 1;
            flex-direction: column;
            min-height: 0;
        }

        .session-guidance {
            margin: 11px 2px 0;
            color: rgba(255, 255, 255, 0.5);
            font-size: 12px;
            line-height: 1.5;
        }

        .session-spacer {
            flex: 1;
            min-height: 18px;
        }

        .action-area {
            padding-top: 16px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .plan-actions {
            display: flex;
            align-items: center;
            gap: 7px;
            min-width: 0;
        }

        .account-upgrade {
            flex-shrink: 0;
            color: rgba(191, 219, 254, 0.72);
            font-size: 9px;
            font-weight: 600;
            text-decoration: none;
        }

        .account-upgrade:hover {
            color: #dbeafe;
        }

        .trial-limit {
            display: flex;
            align-items: flex-start;
            gap: 9px;
            margin-bottom: 0;
            padding: 9px 10px;
            border: 1px solid rgba(251, 146, 60, 0.24);
            border-radius: 9px;
            background: rgba(154, 52, 18, 0.12);
            color: #fed7aa;
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

        .credentials {
            display: grid;
            gap: 7px;
            margin-bottom: 14px;
        }

        .credentials-label {
            color: rgba(255, 255, 255, 0.5);
            font-size: 10px;
            font-weight: 600;
        }

        input {
            width: 100%;
            min-width: 0;
            padding: 10px 12px;
            border: 1px solid var(--button-border);
            border-radius: 8px;
            background: var(--input-background);
            color: var(--text-color);
            font-size: 12px;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        input:focus {
            outline: none;
            border-color: var(--focus-border-color);
            box-shadow: 0 0 0 3px var(--focus-box-shadow);
            background: var(--input-focus-background);
        }

        input::placeholder {
            color: var(--placeholder-color);
        }

        input.api-key-error {
            animation: blink-red 1s ease-in-out;
            border-color: #f87171;
        }

        @keyframes blink-red {
            0%, 100% { border-color: var(--button-border); }
            50% { border-color: #f87171; background: rgba(248, 113, 113, 0.08); }
        }

        .start-button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
            min-height: 46px;
            padding: 11px 18px;
            border: 1px solid rgba(255, 255, 255, 0.14);
            border-radius: 11px;
            background: linear-gradient(135deg, #2563eb 0%, #6366f1 52%, #7c3aed 100%);
            color: white;
            box-shadow: 0 8px 20px rgba(37, 99, 235, 0.2);
            font-size: 14px;
            font-weight: 650;
            white-space: nowrap;
            transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
        }

        .start-button:hover {
            transform: translateY(-1px);
            filter: brightness(1.07);
            box-shadow: 0 10px 24px rgba(37, 99, 235, 0.28);
        }

        .start-button:disabled {
            opacity: 0.6;
            transform: none;
            filter: none;
        }

        .below-action {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-top: 8px;
            min-height: 13px;
        }

        .shortcut-hint,
        .api-help {
            margin: 0;
            color: rgba(255, 255, 255, 0.38);
            font-size: 10px;
            line-height: 1.4;
        }

        .api-help {
            text-align: right;
        }

        .link {
            color: #93c5fd;
            text-decoration: none;
        }

        .account-footer {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: auto;
            padding: 9px 11px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.025);
        }

        .account-avatar {
            display: grid;
            place-items: center;
            width: 28px;
            height: 28px;
            flex-shrink: 0;
            border-radius: 50%;
            background: rgba(96, 165, 250, 0.12);
            color: #bfdbfe;
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
            margin-bottom: 1px;
            color: rgba(255, 255, 255, 0.36);
            font-size: 9px;
        }

        .user-email {
            display: block;
            overflow: hidden;
            color: rgba(255, 255, 255, 0.72);
            font-size: 11px;
            font-weight: 500;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .logout-button {
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.09);
            color: rgba(255, 255, 255, 0.48);
            padding: 6px 9px;
            border-radius: 6px;
            font-size: 10px;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .logout-button:hover {
            background: rgba(239, 68, 68, 0.1);
            border-color: rgba(239, 68, 68, 0.3);
            color: #f87171;
        }

        .logout-button svg {
            width: 12px;
            height: 12px;
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

    getCompactPlanLabel(user) {
        const planName = user?.plan_type || (user?.unlimited ? 'Paid plan' : 'Free Trial');
        if (user?.unlimited) {
            return planName;
        }
        const remainingSeconds = Math.max(0, Number(user?.remaining_seconds) || 0);
        return `${planName} · ${Math.ceil(remainingSeconds / 60)}m left`;
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

        return html`
            <div class="home-layout">
                <section class="session-card">
                    <div class="card-topline">
                        <span class="ready-state"><span class="ready-dot"></span>Ready to assist</span>
                        ${user?.account_type === 'managed' ? html`
                            <span class="plan-actions">
                                <span class="plan-badge">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="9"></circle>
                                        <path d="M12 7v5l3 2"></path>
                                    </svg>
                                    ${this.getCompactPlanLabel(user)}
                                </span>
                                <a class="account-upgrade" href="#" @click=${event => { event.preventDefault(); this.onUpgrade(); }}>Manage →</a>
                            </span>
                        ` : ''}
                    </div>

                    <div class="session-content">
                        <div class="mode-panel">
                            <span class="mode-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M8 10h8M8 14h5"></path>
                                    <path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-4 3v-3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"></path>
                                </svg>
                            </span>
                            <span class="mode-copy">
                                <span class="mode-eyebrow">Selected mode</span>
                                <span class="mode-name">${profileLabel}</span>
                            </span>
                        </div>
                        <p class="session-guidance">Your session opens in a focused window and keeps your interview context ready.</p>
                        <span class="session-spacer"></span>

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

                                <button
                                    @click=${this.handleStartClick}
                                    ?disabled=${this.isInitializing}
                                    class="start-button"
                                >
                                    ${this.isInitializing ? 'Starting Interview Co-Pilot…' : 'Start Interview Co-Pilot'}
                                </button>

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
