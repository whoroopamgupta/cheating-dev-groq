const fs = require('fs');
const path = require('path');

const customizePath = path.join(__dirname, 'src', 'components', 'views', 'CustomizeView.js');
const profilePath = path.join(__dirname, 'src', 'components', 'views', 'ProfileView.js');
const appPath = path.join(__dirname, 'src', 'components', 'app', 'CheatingDaddyApp.js');
const headerPath = path.join(__dirname, 'src', 'components', 'app', 'AppHeader.js');

let customizeContent = fs.readFileSync(customizePath, 'utf8');

// Extract styles from CustomizeView
const stylesMatch = customizeContent.match(/static styles = css`([\s\S]*?)`;/);
const styles = stylesMatch ? stylesMatch[1] : '';

const profileViewCode = `import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import { resizeLayout } from '../../utils/windowResize.js';
import '../common/CustomDropdown.js';

export class ProfileView extends LitElement {
    static styles = css\`${styles}\`;

    static properties = {
        selectedProfile: { type: String },
        onProfileChange: { type: Function },
        selectedMode: { type: String },
    };

    constructor() {
        super();
        this.selectedProfile = 'exam';
        this.selectedMode = 'interview';
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
        const key = \`customPrompt_\${profile}\`;
        const saved = localStorage.getItem(key);
        if (saved !== null) {
            return saved;
        }
        // If no custom prompt exists for this profile, return default instructions
        return this.getDefaultInstructions(profile);
    }

    setCustomPromptForProfile(profile, value) {
        const key = \`customPrompt_\${profile}\`;
        localStorage.setItem(key, value);
        // Also update the legacy customPrompt for compatibility
        localStorage.setItem('customPrompt', value);
    }

    getDefaultInstructions(profile) {
        const defaultInstructions = {
            exam: \`Help me with MCQ, coding and aptitude questions. Provide clear answers.\`,
            interview: \`Help me with technical and HR interview questions. Give natural, professional responses.\`,
            sales: \`Help me with sales calls and client conversations. Provide persuasive, relationship-building responses.\`,
            meeting: \`Help me in business meetings and discussions. Give professional, collaborative input.\`,
            presentation: \`Help me with presentations and public speaking. Provide engaging, confident responses.\`,
            negotiation: \`Help me with business negotiations and deals. Give strategic, win-win focused advice.\`,
        };
        return defaultInstructions[profile] || '';
    }

    render() {
        const profiles = this.getProfiles();
        const profileNames = this.getProfileNames();
        const currentProfile = profiles.find(p => p.value === this.selectedProfile);

        return html\`
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
                                    <span class="current-selection">\${currentProfile?.name || 'Unknown'}</span>
                                </label>
                                <custom-dropdown
                                    .value=\${this.selectedProfile}
                                    .options=\${profiles.map(p => ({ value: p.value, label: p.name }))}
                                    @change=\${e => this.handleProfileSelect({ target: { value: e.detail.value } })}
                                ></custom-dropdown>
                            </div>
                        </div>

                        <div class="form-group full-width">
                            <label class="form-label">Custom AI Instructions</label>
                            <textarea
                                class="form-control"
                                placeholder="Add specific instructions for how you want the AI to behave during \${profileNames[this.selectedProfile] || 'this interaction'}..."
                                .value=\${localStorage.getItem('customPrompt') || ''}
                                rows="4"
                                @input=\${this.handleCustomPromptInput}
                            ></textarea>
                            <div class="form-description">
                                Personalize the AI's behavior with specific instructions that will be added to the
                                \${profileNames[this.selectedProfile] || 'selected profile'} base prompts
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        \`;
    }
}
customElements.define('profile-view', ProfileView);
`;

fs.writeFileSync(profilePath, profileViewCode);

// Remove Profile section from CustomizeView
let newCustomizeContent = customizeContent.replace(/<!-- Profile & Behavior Section -->[\s\S]*?<!-- Mode Selection Section \(Coding vs Interview\) -->/, '<!-- Mode Selection Section (Coding vs Interview) -->');
fs.writeFileSync(customizePath, newCustomizeContent);

// Add profile-view to CheatingDaddyApp
let appContent = fs.readFileSync(appPath, 'utf8');

// Add import
if (!appContent.includes("import './views/ProfileView.js';")) {
    appContent = appContent.replace("import './views/CustomizeView.js';", "import './views/CustomizeView.js';\nimport './views/ProfileView.js';");
}

// Add to sidebar button - Before Customize button
const customizeButtonHtml = `                              <button class="sidebar-icon-button" @click=\${() => this.handleCustomizeClick()}>`;
const profileButtonHtml = `                              <button class="sidebar-icon-button" @click=\${() => this.handleProfileViewClick()}>
                                  <?xml version="1.0" encoding="UTF-8"?><svg width="24px" height="24px" stroke-width="1.7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="currentColor"/></svg>
                              </button>
                              <button class="sidebar-icon-button" @click=\${() => this.handleCustomizeClick()}>`;
appContent = appContent.replace(customizeButtonHtml, profileButtonHtml);

// Add handler for profile click
const handleCustomizeClickFunc = `    handleCustomizeClick() {
        this.currentView = 'customize';
    }`;
const handleProfileClickFunc = `    handleProfileViewClick() {
        this.currentView = 'profile';
    }

    handleCustomizeClick() {
        this.currentView = 'customize';
    }`;
appContent = appContent.replace(handleCustomizeClickFunc, handleProfileClickFunc);

// Add to render cases
const customizeCase = `            case 'customize':`;
const profileCase = `            case 'profile':
                return html\`
                    <profile-view
                        .selectedProfile=\${this.selectedProfile}
                        .onProfileChange=\${profile => this.handleProfileChange(profile)}
                    ></profile-view>
                \`;

            case 'customize':`;
appContent = appContent.replace(customizeCase, profileCase);

fs.writeFileSync(appPath, appContent);

// Update AppHeader
let headerContent = fs.readFileSync(headerPath, 'utf8');
headerContent = headerContent.replace("const navigationViews = ['customize', 'help', 'advanced', 'history'];", "const navigationViews = ['profile', 'customize', 'help', 'advanced', 'history'];");
headerContent = headerContent.replace("customize: 'Customize',", "profile: 'AI Profile & Behavior',\n            customize: 'Customize',");
fs.writeFileSync(headerPath, headerContent);

console.log("Done updates");
