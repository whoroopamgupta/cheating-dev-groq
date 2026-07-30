import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';

export class LoginView extends LitElement {
    static styles = css`
        * {
            font-family:
                'Inter',
                -apple-system,
                BlinkMacSystemFont,
                sans-serif;
            cursor: default;
            user-select: none;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :host {
            display: block;
            height: 100%;
            width: 100%;
        }

        .login-container {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            background: var(--main-content-background);
            overflow-y: auto;
            overflow-x: hidden;
            -webkit-app-region: drag;
        }

        .header {
            height: var(--header-height, 44px);
            background: var(--header-background);
            border-bottom: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 16px;
            -webkit-app-region: drag;
        }

        .header-left {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .header-title {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-color);
        }

        .header-right {
            display: flex;
            align-items: center;
            gap: 12px;
            -webkit-app-region: no-drag;
        }

        .shortcut-hint {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 11px;
            color: var(--text-muted);
        }

        .shortcut-key {
            background: var(--input-background);
            border: 1px solid var(--button-border);
            border-radius: 4px;
            padding: 2px 6px;
            font-size: 10px;
            font-weight: 500;
            color: var(--text-muted);
            font-family: 'SF Mono', 'Menlo', 'Monaco', monospace;
        }

        .close-button {
            width: 28px;
            height: 28px;
            border: none;
            background: var(--input-background);
            border-radius: 6px;
            cursor: default;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-muted);
            transition: all 0.2s ease;
        }

        .close-button:hover {
            background: rgba(239, 68, 68, 0.2);
            color: #f87171;
        }

        .close-button svg {
            width: 14px;
            height: 14px;
        }

        .content {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
        }

        .login-form {
            width: 100%;
            max-width: 320px;
            -webkit-app-region: no-drag;
        }

        .logo-container {
            text-align: center;
            margin-bottom: 32px;
        }

        .logo-image {
            width: 72px;
            height: 72px;
            margin-bottom: 16px;
            border-radius: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .logo {
            font-size: 24px;
            font-weight: 600;
            color: var(--text-color);
        }

        .logo-subtitle {
            font-size: 13px;
            color: var(--text-muted);
            margin-top: 8px;
        }

        .form-group {
            margin-bottom: 16px;
        }

        .form-label {
            display: block;
            font-size: 12px;
            font-weight: 500;
            color: var(--text-muted);
            margin-bottom: 8px;
        }

        .form-input {
            width: 100%;
            padding: 10px 14px;
            background: var(--input-background);
            border: 1px solid var(--button-border);
            border-radius: 8px;
            color: var(--text-color);
            font-size: 14px;
            font-family: inherit;
            transition: all 0.2s ease;
            outline: none;
        }

        .form-input::placeholder {
            color: var(--placeholder-color);
        }

        .form-input:focus {
            border-color: var(--focus-border-color);
            box-shadow: 0 0 0 3px var(--focus-box-shadow);
            background: var(--input-focus-background);
        }

        .form-input.error {
            border-color: #ff4444;
            animation: shake 0.5s ease-in-out;
        }

        .password-input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
        }

        .password-toggle {
            position: absolute;
            right: 12px;
            background: transparent;
            border: none;
            color: var(--placeholder-color, rgba(255, 255, 255, 0.4));
            cursor: default;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 4px;
        }
        
        .password-toggle:hover {
            color: var(--text-color, rgba(255, 255, 255, 0.9));
        }

        @keyframes shake {
            0%,
            100% {
                transform: translateX(0);
            }
            20%,
            60% {
                transform: translateX(-6px);
            }
            40%,
            80% {
                transform: translateX(6px);
            }
        }

        .login-button {
            width: 100%;
            padding: 10px 16px;
            background: var(--start-button-background);
            border: 1px solid var(--start-button-border);
            border-radius: 8px;
            color: var(--start-button-color);
            font-size: 14px;
            font-weight: 500;
            font-family: inherit;
            cursor: default;
            transition: all 0.2s ease;
            margin-top: 8px;
            position: relative;
        }

        .login-button:hover:not(:disabled) {
            background: var(--start-button-hover-background);
            border-color: var(--start-button-hover-border);
        }

        .login-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .login-button.loading {
            color: transparent;
        }

        .login-button.loading::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 16px;
            height: 16px;
            margin: -8px 0 0 -8px;
            border: 2px solid var(--text-muted);
            border-top-color: var(--text-color);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }

        .error-message {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 8px;
            padding: 10px 12px;
            margin-bottom: 16px;
            font-size: 12px;
            color: #f87171;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .error-message svg {
            width: 16px;
            height: 16px;
            flex-shrink: 0;
        }

        .logout-message {
            background: rgba(251, 191, 36, 0.1);
            border: 1px solid rgba(251, 191, 36, 0.3);
            border-radius: 8px;
            padding: 12px 14px;
            margin-bottom: 16px;
            font-size: 12px;
            color: #fbbf24;
            position: relative;
        }

        .logout-message-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            font-weight: 600;
        }

        .logout-message-header svg {
            width: 18px;
            height: 18px;
            flex-shrink: 0;
        }

        .logout-message-content {
            line-height: 1.5;
            color: #d4a017;
        }

        .logout-message-content a {
            color: #fbbf24;
            text-decoration: underline;
            cursor: default;
        }

        .logout-message-close {
            position: absolute;
            top: 8px;
            right: 8px;
            background: none;
            border: none;
            color: #fbbf24;
            cursor: default;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            transition: background 0.2s ease;
        }

        .logout-message-close:hover {
            background: rgba(251, 191, 36, 0.2);
        }

        .logout-message-close svg {
            width: 14px;
            height: 14px;
        }

        .footer-text {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: var(--text-muted);
        }

        .footer-link {
            color: var(--focus-border-color);
            text-decoration: none;
            cursor: default;
            transition: color 0.2s ease;
        }

        .footer-link:hover {
            text-decoration: underline;
        }
    `;

    static properties = {
        email: { type: String },
        password: { type: String },
        isLoading: { type: Boolean },
        errorMessage: { type: String },
        showError: { type: Boolean },
        onLoginSuccess: { type: Function },
        logoutMessage: { type: String },
        onClearLogoutMessage: { type: Function },
        showPassword: { type: Boolean },
    };

    constructor() {
        super();
        this.email = '';
        this.password = '';
        this.isLoading = false;
        this.errorMessage = '';
        this.showError = false;
        this.onLoginSuccess = () => {};
        this.logoutMessage = '';
        this.onClearLogoutMessage = () => {};
        this.showPassword = false;
    }

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    handleEmailInput(e) {
        this.email = e.target.value;
        this.showError = false;
    }

    handlePasswordInput(e) {
        this.password = e.target.value;
        this.showError = false;
    }

    handleKeydown(e) {
        if (e.key === 'Enter') {
            this.handleLogin();
        }
    }

    async handleLogin() {
        if (this.isLoading) return;

        // Validate inputs
        if (!this.email.trim()) {
            this.errorMessage = 'Please enter your email address';
            this.showError = true;
            return;
        }

        if (!this.password.trim()) {
            this.errorMessage = 'Please enter your password';
            this.showError = true;
            return;
        }

        this.isLoading = true;
        this.showError = false;

        try {
            // Fetch credentials from remote JSON
            const response = await fetch('https://raw.githubusercontent.com/catwithbatman-del/codeindev-emails/refs/heads/main/emails.json');

            if (!response.ok) {
                throw new Error('Failed to fetch authentication data');
            }

            const text = await response.text();

            // Parse the JSON (handle non-standard JSON with unquoted keys and trailing commas)
            let users;
            try {
                // Try standard JSON parse first
                users = JSON.parse(text);
            } catch (parseError) {
                // If that fails, try to fix the JSON format
                let fixedJson = text
                    // Add quotes around unquoted keys
                    .replace(/(\s*)(\w+)(\s*:\s*)/g, '$1"$2"$3')
                    // Replace "null" string with null
                    .replace(/:\s*"null"/g, ': null')
                    // Remove trailing commas before ] or }
                    .replace(/,(\s*[\]}])/g, '$1');
                users = JSON.parse(fixedJson);
            }

            // Find matching user
            const user = users.find(u => u.userEmail.toLowerCase() === this.email.toLowerCase().trim() && u.userPassword === this.password);

            if (user) {
                // Login successful
                console.log('[Login] Success for user:', user.user);

                // Store login info in localStorage
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem(
                    'loggedInUser',
                    JSON.stringify({
                        name: user.user,
                        email: user.userEmail,
                        plan: user.usePlan,
                        device: user.device,
                        startDate: user.startDate,
                        trialEndDate: user.trialEndDate,
                    })
                );

                // Call success callback
                this.onLoginSuccess(user);
            } else {
                // Login failed
                this.errorMessage = 'Invalid email or password';
                this.showError = true;
            }
        } catch (error) {
            console.error('[Login] Error:', error);
            this.errorMessage = 'Unable to connect. Please check your internet connection.';
            this.showError = true;
        } finally {
            this.isLoading = false;
        }
    }

    async handleGetAccess() {
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            await ipcRenderer.invoke('open-external', 'https://www.cheatingdev.in');
        }
    }

    handleDismissLogoutMessage() {
        this.logoutMessage = '';
        if (this.onClearLogoutMessage) {
            this.onClearLogoutMessage();
        }
        this.requestUpdate();
    }

    copyEmail(email) {
        navigator.clipboard
            .writeText(email)
            .then(() => {
                console.log('[Login] Email copied to clipboard:', email);
                window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Copied to clipboard' }));
            })
            .catch(err => {
                console.error('[Login] Failed to copy email:', err);
                window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Failed to copy' }));
            });
    }

    async handleClose() {
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            await ipcRenderer.invoke('quit-application');
        }
    }

    render() {
        return html`
            <div class="login-container">
                <div class="header">
                    <div class="header-left">
                        <span class="header-title">Cheating Dev</span>
                    </div>
                    <div class="header-right">
                        <div class="shortcut-hint">
                            <span class="shortcut-key">⌘</span>
                            <span class="shortcut-key">\\</span>
                            <span>to hide</span>
                        </div>
                        <button class="close-button" @click=${this.handleClose} title="Close">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="content">
                    <div class="login-form">
                        <div class="logo-container">
                            <img src="assets/logo.png" class="logo-image" alt="App Logo" />
                            <div class="logo">Sign In</div>
                            <div class="logo-subtitle">Enter your credentials to continue</div>
                        </div>

                        ${this.logoutMessage
                            ? html`
                                  <div class="logout-message">
                                      <button class="logout-message-close" @click=${this.handleDismissLogoutMessage} title="Dismiss">
                                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                              <line x1="18" y1="6" x2="6" y2="18"></line>
                                              <line x1="6" y1="6" x2="18" y2="18"></line>
                                          </svg>
                                      </button>
                                      <div class="logout-message-header">
                                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                              <path
                                                  d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                                              ></path>
                                              <line x1="12" y1="9" x2="12" y2="13"></line>
                                              <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                          </svg>
                                          <span>Plan Expired</span>
                                      </div>
                                      <div class="logout-message-content">
                                          Your plan has ended. If this is a mistake, please contact
                                          <a @click=${() => this.copyEmail('webdevarmyhq@gmail.com')}>webdevarmyhq@gmail.com</a>. To extend your plan,
                                          <a @click=${this.handleGetAccess}>visit our website</a>.
                                      </div>
                                  </div>
                              `
                            : ''}
                        ${this.showError
                            ? html`
                                  <div class="error-message">
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                          <circle cx="12" cy="12" r="10"></circle>
                                          <line x1="12" y1="8" x2="12" y2="12"></line>
                                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                      </svg>
                                      <span>${this.errorMessage}</span>
                                  </div>
                              `
                            : ''}

                        <div class="form-group">
                            <label class="form-label">Email Address</label>
                            <input
                                type="email"
                                class="form-input ${this.showError ? 'error' : ''}"
                                placeholder="Enter your email"
                                .value=${this.email}
                                @input=${this.handleEmailInput}
                                @keydown=${this.handleKeydown}
                                ?disabled=${this.isLoading}
                            />
                        </div>

                        <div class="form-group">
                            <label class="form-label">Password</label>
                            <div class="password-input-wrapper">
                                <input
                                    type="${this.showPassword ? 'text' : 'password'}"
                                    class="form-input ${this.showError ? 'error' : ''}"
                                    placeholder="Enter your password"
                                    .value=${this.password}
                                    @input=${this.handlePasswordInput}
                                    @keydown=${this.handleKeydown}
                                    ?disabled=${this.isLoading}
                                    style="padding-right: 40px;"
                                />
                                <button class="password-toggle" @click=${this.togglePasswordVisibility} type="button" tabindex="-1">
                                    ${this.showPassword ? html`
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </svg>
                                    ` : html`
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    `}
                                </button>
                            </div>
                        </div>

                        <button class="login-button ${this.isLoading ? 'loading' : ''}" @click=${this.handleLogin} ?disabled=${this.isLoading}>
                            ${this.isLoading ? '' : 'Sign In'}
                        </button>

                        <div class="footer-text">
                            Don't have access?
                            <span class="footer-link" @click=${this.handleGetAccess}>Get access here</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('login-view', LoginView);
