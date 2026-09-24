import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import { resizeLayout } from '../../utils/windowResize.js';

export class HistoryView extends LitElement {
    static styles = css`
        :host {
            height: 100%;
            display: flex;
            flex-direction: column;
        }

        * {
            font-family: 'Inter', sans-serif;
            cursor: default;
        }

        .history-container {
            height: 100%;
            overflow-y: auto;
            padding: 16px;
        }

        .warning-banner {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 10px;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.2);
            border-radius: 8px;
            color: #fca5a5;
            font-size: 10px;
            margin-bottom: 12px;
        }

        .warning-banner svg {
            width: 12px;
            height: 12px;
            flex-shrink: 0;
        }

        .filter-bar {
            display: flex;
            gap: 8px;
            margin-bottom: 16px;
            background: rgba(0, 0, 0, 0.2);
            padding: 8px;
            border-radius: 12px;
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
        }

        .search-input-wrapper {
            flex: 1;
            position: relative;
            display: flex;
            align-items: center;
        }

        .search-icon {
            position: absolute;
            left: 10px;
            width: 14px;
            height: 14px;
            color: var(--description-color, rgba(255, 255, 255, 0.6));
        }

        .search-input {
            width: 100%;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
            border-radius: 8px;
            padding: 6px 10px 6px 30px;
            color: var(--text-color, #e5e5e7);
            font-size: 12px;
            outline: none;
            transition: all 0.2s ease;
        }

        .search-input:focus {
            background: rgba(255, 255, 255, 0.1);
            border-color: var(--focus-border-color, #007aff);
        }

        .custom-select {
            position: relative;
            user-select: none;
        }

        .custom-select-trigger {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
            border-radius: 8px;
            padding: 6px 10px;
            color: var(--text-color, #e5e5e7);
            font-size: 12px;
            cursor: default;
            min-width: 120px;
            transition: all 0.2s ease;
        }

        .custom-select-trigger:hover,
        .custom-select.open .custom-select-trigger {
            background: rgba(255, 255, 255, 0.1);
            border-color: var(--focus-border-color, #007aff);
        }

        .custom-select-trigger svg {
            width: 16px;
            height: 16px;
            opacity: 0.7;
            transition: transform 0.2s ease;
        }

        .custom-select.open .custom-select-trigger svg {
            transform: rotate(180deg);
        }

        .custom-select-dropdown {
            position: absolute;
            top: calc(100% + 4px);
            right: 0;
            background: #1e1e1e;
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
            border-radius: 8px;
            padding: 4px;
            min-width: 160px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
            z-index: 100;
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .custom-select-option {
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 13px;
            color: var(--text-color, #e5e5e7);
            cursor: default;
            transition: background 0.2s ease;
        }

        .custom-select-option:hover {
            background: rgba(255, 255, 255, 0.1);
        }

        .custom-select-option.selected {
            background: rgba(0, 122, 255, 0.2);
            color: #60a5fa;
        }

        .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: var(--description-color, rgba(255, 255, 255, 0.6));
            text-align: center;
            gap: 12px;
        }

        .empty-state svg {
            width: 48px;
            height: 48px;
            opacity: 0.5;
        }

        .empty-state h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: var(--text-color, #e5e5e7);
        }

        .empty-state p {
            margin: 0;
            font-size: 13px;
        }

        .conversation-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .conversation-item {
            background: var(--input-background, rgba(0, 0, 0, 0.3));
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
            border-left: 4px solid var(--border-color, rgba(255, 255, 255, 0.2));
            border-radius: 8px;
            padding: 12px 16px;
            cursor: default;
            transition: all 0.2s ease;
        }

        /* Profile specific borders */
        .conversation-item.profile-interview {
            border-left-color: #10b981;
        }
        .conversation-item.profile-product {
            border-left-color: #3b82f6;
        }
        .conversation-item.profile-sales {
            border-left-color: #f59e0b;
        }
        .conversation-item.profile-meeting {
            border-left-color: #8b5cf6;
        }
        .conversation-item.profile-presentation {
            border-left-color: #ec4899;
        }
        .conversation-item.profile-negotiation {
            border-left-color: #6366f1;
        }
        .conversation-item.profile-exam,
        .conversation-item.profile-exam-groq {
            border-left-color: #f97316;
        }

        .conversation-item:hover {
            background: var(--hover-background, rgba(255, 255, 255, 0.1));
            border-color: var(--focus-border-color, #007aff);
        }

        .conversation-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;
        }

        .conversation-date {
            font-size: 11px;
            color: var(--description-color, rgba(255, 255, 255, 0.6));
            white-space: nowrap;
        }

        .conversation-preview {
            font-size: 14px;
            color: var(--text-color, #e5e5e7);
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .conversation-meta {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-top: 8px;
            font-size: 11px;
            color: var(--description-color, rgba(255, 255, 255, 0.6));
        }

        .conversation-meta span {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .delete-btn {
            background: none;
            border: none;
            padding: 4px;
            cursor: default;
            opacity: 0.5;
            transition: opacity 0.2s ease;
            color: var(--text-color, #e5e5e7);
        }

        .delete-btn:hover {
            opacity: 1;
            color: #ef4444;
        }

        .delete-btn svg {
            width: 16px;
            height: 16px;
        }

        /* Conversation Detail View */
        .detail-container {
            height: 100%;
            display: flex;
            flex-direction: column;
        }

        .detail-header {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
        }

        .back-btn {
            background: none;
            border: none;
            padding: 8px;
            cursor: default;
            color: var(--text-color, #e5e5e7);
            opacity: 0.7;
            transition: opacity 0.2s ease;
            display: flex;
            align-items: center;
        }

        .back-btn:hover {
            opacity: 1;
        }

        .back-btn svg {
            width: 20px;
            height: 20px;
        }

        .detail-title {
            flex: 1;
        }

        .detail-title h3 {
            margin: 0;
            font-size: 14px;
            font-weight: 600;
            color: var(--text-color, #e5e5e7);
        }

        .edit-title-btn {
            background: none;
            border: none;
            color: var(--description-color, rgba(255, 255, 255, 0.6));
            cursor: default;
            padding: 4px;
            opacity: 0.5;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .edit-title-btn:hover {
            opacity: 1;
            color: var(--text-color, #e5e5e7);
        }

        .edit-title-btn svg {
            width: 14px;
            height: 14px;
        }

        .edit-title-input {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--focus-border-color, #007aff);
            border-radius: 4px;
            color: var(--text-color, #e5e5e7);
            font-size: 14px;
            font-weight: 600;
            padding: 2px 6px;
            outline: none;
            width: 100%;
            max-width: 300px;
            font-family: inherit;
        }

        .detail-title span {
            font-size: 11px;
            color: var(--description-color, rgba(255, 255, 255, 0.6));
        }

        .detail-content {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
        }

        /* Summary Section */
        .summary-section {
            margin-bottom: 16px;
        }

        .summary-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
            padding: 12px 16px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 500;
            cursor: default;
            transition: all 0.2s ease;
            border: none;
        }

        .summary-btn svg {
            width: 16px;
            height: 16px;
        }

        .summary-btn-generate {
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            color: white;
            box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
        }

        .summary-btn-generate:hover {
            background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
        }

        .summary-btn-generate:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
        }

        .summary-btn-view {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }

        .summary-btn-view:hover {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .summary-card {
            background: var(--input-background, rgba(0, 0, 0, 0.3));
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 10px;
            overflow: hidden;
        }

        .summary-card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            background: rgba(139, 92, 246, 0.1);
            border-bottom: 1px solid rgba(139, 92, 246, 0.2);
        }

        .summary-card-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            font-weight: 600;
            color: #a78bfa;
        }

        .summary-card-title svg {
            width: 16px;
            height: 16px;
        }

        .summary-card-actions {
            display: flex;
            gap: 8px;
        }

        .summary-action-btn {
            background: none;
            border: none;
            padding: 4px;
            cursor: default;
            color: var(--description-color, rgba(255, 255, 255, 0.5));
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
        }

        .summary-action-btn:hover {
            color: var(--text-color, #e5e5e7);
        }

        .summary-action-btn.delete:hover {
            color: #ef4444;
        }

        .summary-action-btn svg {
            width: 16px;
            height: 16px;
        }

        .summary-card-content {
            padding: 16px;
            font-size: 13px;
            line-height: 1.6;
            color: var(--text-color, #e5e5e7);
        }

        .summary-card-content h1,
        .summary-card-content h2,
        .summary-card-content h3 {
            margin: 0.8em 0 0.4em 0;
            color: var(--text-color);
        }

        .summary-card-content h1 {
            font-size: 1.3em;
        }
        .summary-card-content h2 {
            font-size: 1.15em;
        }
        .summary-card-content h3 {
            font-size: 1.05em;
        }

        .summary-card-content p {
            margin: 0.5em 0;
        }

        .summary-card-content ul,
        .summary-card-content ol {
            margin: 0.5em 0;
            padding-left: 1.5em;
        }

        .summary-card-content li {
            margin: 0.3em 0;
        }

        .generating-indicator {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 16px;
            color: var(--description-color, rgba(255, 255, 255, 0.6));
            font-size: 13px;
        }

        .spinner {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-top-color: #8b5cf6;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }

        .qa-item {
            margin-bottom: 12px;
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
            border-radius: 8px;
            overflow: hidden;
        }

        .qa-question {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            background: var(--input-background, rgba(0, 0, 0, 0.3));
            cursor: default;
            transition: background 0.2s ease;
        }

        .qa-question:hover {
            background: var(--hover-background, rgba(255, 255, 255, 0.1));
        }

        .qa-number {
            flex-shrink: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--focus-border-color, #007aff);
            color: white;
            border-radius: 50%;
            font-size: 12px;
            font-weight: 600;
        }

        .qa-question-text {
            flex: 1;
            font-size: 13px;
            color: var(--text-color, #e5e5e7);
            line-height: 1.4;
        }

        .qa-expand-icon {
            flex-shrink: 0;
            width: 20px;
            height: 20px;
            color: var(--description-color, rgba(255, 255, 255, 0.6));
            transition: transform 0.2s ease;
        }

        .qa-item.expanded .qa-expand-icon {
            transform: rotate(180deg);
        }

        .qa-answer {
            display: none;
            padding: 16px;
            background: var(--main-content-background, rgba(0, 0, 0, 0.8));
            font-size: 14px;
            line-height: 1.6;
            color: var(--text-color, #e5e5e7);
            border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
        }

        .qa-item.expanded .qa-answer {
            display: block;
        }

        /* Markdown styling for answers */
        .qa-answer h1,
        .qa-answer h2,
        .qa-answer h3 {
            margin: 0.8em 0 0.4em 0;
            color: var(--text-color);
        }

        .qa-answer h1 {
            font-size: 1.4em;
        }
        .qa-answer h2 {
            font-size: 1.2em;
        }
        .qa-answer h3 {
            font-size: 1.1em;
        }

        .qa-answer p {
            margin: 0.6em 0;
        }

        .qa-answer ul,
        .qa-answer ol {
            margin: 0.6em 0;
            padding-left: 1.5em;
        }

        .qa-answer code {
            background: rgba(255, 255, 255, 0.1);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
            font-size: 0.9em;
        }

        .qa-answer pre {
            background: rgba(0, 0, 0, 0.4);
            padding: 12px;
            border-radius: 6px;
            overflow-x: auto;
        }

        .qa-answer pre code {
            background: none;
            padding: 0;
        }

        .read-only-badge {
            font-size: 10px;
            padding: 2px 8px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            color: var(--description-color, rgba(255, 255, 255, 0.6));
        }
    `;

    static properties = {
        conversations: { type: Array },
        selectedConversation: { type: Object },
        expandedItems: { type: Array },
        onExternalLinkClick: { type: Function },
        _isGeneratingSummary: { state: true },
        _showSummary: { state: true },
        _searchQuery: { state: true },
        _profileFilter: { state: true },
        _isEditingTitle: { state: true },
        _editTitleValue: { state: true },
        _isFilterOpen: { state: true },
    };

    constructor() {
        super();
        this.conversations = [];
        this.selectedConversation = null;
        this.expandedItems = [];
        this.onExternalLinkClick = () => {};
        this._isGeneratingSummary = false;
        this._showSummary = false;
        this._searchQuery = '';
        this._profileFilter = 'all';
        this._isEditingTitle = false;
        this._editTitleValue = '';
        this._isFilterOpen = false;
        this.loadConversations();
    }

    connectedCallback() {
        super.connectedCallback();
        resizeLayout();
        this.loadConversations();
    }

    loadConversations() {
        try {
            const saved = localStorage.getItem('conversationHistory');
            if (saved) {
                this.conversations = JSON.parse(saved);
                // Sort by date, newest first
                this.conversations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            }
        } catch (error) {
            console.error('Error loading conversation history:', error);
            this.conversations = [];
        }
    }

    saveConversations() {
        try {
            localStorage.setItem('conversationHistory', JSON.stringify(this.conversations));
        } catch (error) {
            console.error('Error saving conversation history:', error);
        }
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else if (diffDays === 1) {
            return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
        }
    }

    formatDuration(durationMs) {
        const seconds = Math.floor(durationMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m`;
        }
        return `${seconds}s`;
    }

    getPreviewText(conversation) {
        if (conversation.title) return conversation.title;
        if (conversation.questions && conversation.questions.length > 0) {
            return conversation.questions[0].question || 'No question recorded';
        }
        return 'Empty conversation';
    }

    handleConversationClick(conversation) {
        this.selectedConversation = conversation;
        this.expandedItems = [];
        this._isEditingTitle = false;
        this._showSummary = false;
        this._showSummary = !!conversation.summary;
        this.requestUpdate();
    }

    handleBackToList() {
        this.selectedConversation = null;
        this._isEditingTitle = false;
        this.requestUpdate();
    }

    startEditingTitle(e) {
        e.stopPropagation();
        this._isEditingTitle = true;
        this._editTitleValue =
            this.selectedConversation.title ||
            (this.selectedConversation.questions?.length > 0 ? this.selectedConversation.questions[0].question : 'Conversation Details');
        // Need to wait for render before focusing
        setTimeout(() => {
            const input = this.shadowRoot.querySelector('.edit-title-input');
            if (input) {
                input.focus();
                input.select();
            }
        }, 0);
    }

    handleTitleKeydown(e) {
        if (e.key === 'Enter') {
            this.saveTitle(e);
        } else if (e.key === 'Escape') {
            this._isEditingTitle = false;
            this.requestUpdate();
        }
    }

    saveTitle(e) {
        if (!this._isEditingTitle) return;

        const newTitle = e.target.value.trim();
        if (newTitle && newTitle !== this.selectedConversation.title) {
            // Update the selected conversation
            this.selectedConversation.title = newTitle;

            // Find and update in the main array to trigger reactivity and save
            const index = this.conversations.findIndex(c => c.id === this.selectedConversation.id);
            if (index !== -1) {
                this.conversations[index].title = newTitle;
                this.conversations = [...this.conversations];
                this.saveConversations();
            }
        }

        this._isEditingTitle = false;
        this.requestUpdate();
    }

    toggleExpand(index) {
        if (this.expandedItems.includes(index)) {
            this.expandedItems = this.expandedItems.filter(i => i !== index);
        } else {
            this.expandedItems = [...this.expandedItems, index];
        }
        this.requestUpdate();
    }

    deleteConversation(e, conversationId) {
        e.stopPropagation();
        if (confirm('Delete this conversation? This cannot be undone.')) {
            this.conversations = this.conversations.filter(c => c.id !== conversationId);
            this.saveConversations();
            this.requestUpdate();
        }
    }

    getSummaryPrompt(mode, profile, questionsText, questions) {
        // Interview mode prompt (default for most profiles)
        if (mode === 'interview' || profile === 'interview' || profile === 'sales') {
            if (profile === 'sales') {
                return `You are an expert sales call analyst. Analyze the following sales conversation and provide a comprehensive summary.

SALES CALL TRANSCRIPT/QUESTIONS:
${questionsText}

Please provide a summary that includes:

1. **Call Objective**: What was the purpose of this sales call?
2. **Key Discussion Points**: Main topics and concerns raised
3. **Customer Pain Points**: What problems or needs did the customer express?
4. **Objections Raised**: Any hesitations or objections from the prospect
5. **Buying Signals**: Positive indicators or interest shown
6. **Next Steps**: Suggested follow-up actions
7. **Deal Probability**: Assessment of likelihood to close

IMPORTANT: Focus on extracting actionable insights from the conversation. Help the salesperson understand what went well and what could be improved.

Keep the summary concise but actionable. Use bullet points where appropriate.`;
            }

            // Default interview prompt
            return `You are an expert interview analyst. Analyze the following interview questions and provide a comprehensive summary.

INTERVIEW QUESTIONS:
${questionsText}

Please provide a summary that includes:

1. **Interview Focus Areas**: What main topics/areas were covered?
2. **Key Questions Asked**: List the most important or challenging questions
3. **Question Patterns**: Were there any patterns (behavioral, technical, situational)?
4. **Difficulty Assessment**: Overall difficulty level and progression
5. **Preparation Tips**: What should someone prepare for similar interviews?

IMPORTANT: Focus primarily on the QUESTIONS that were asked, not the responses. Help the user understand what the interviewer was trying to assess.

Keep the summary concise but insightful. Use bullet points where appropriate.`;
        }

        // Coding/Exam mode prompt (includes both exam and exam-groq profiles)
        if (mode === 'coding' || profile === 'exam' || profile === 'exam-groq') {
            return `You are an expert coding assessment analyst. Analyze the following coding problems/questions and provide a comprehensive summary.

CODING PROBLEMS/QUESTIONS:
${questionsText}

Please provide a summary that includes:

1. **Problem Categories**: What types of problems were asked? (Arrays, Trees, Graphs, DP, etc.)
2. **Key Algorithms Required**: What algorithms/data structures were needed?
3. **Difficulty Breakdown**: Easy/Medium/Hard distribution
4. **Time Complexity Expectations**: What efficiency was expected?
5. **Common Patterns**: Any recurring problem-solving patterns
6. **Topics to Review**: Specific concepts to strengthen based on these problems
7. **Company Style**: Does this match any known company's interview style?

IMPORTANT: Focus on the technical skills and concepts being tested. Help the user understand what they need to practice.

Keep the summary technical and actionable. Use bullet points where appropriate.`;
        }


        // Presentation mode prompt
        if (profile === 'presentation') {
            return `You are an expert presentation coach. Analyze the following presentation Q&A session and provide a comprehensive summary.

AUDIENCE QUESTIONS:
${questionsText}

Please provide a summary that includes:

1. **Audience Interests**: What topics generated the most questions?
2. **Knowledge Gaps**: Areas where the audience needed more clarity
3. **Challenging Questions**: Most difficult questions asked
4. **Engagement Level**: How engaged was the audience based on questions?
5. **Content Improvements**: What could be explained better in the presentation
6. **Common Themes**: Recurring concerns or interests
7. **Follow-up Suggestions**: Topics to address in future presentations

IMPORTANT: Focus on understanding what the audience cared about most. Help improve future presentations.

Keep the summary insightful and actionable. Use bullet points where appropriate.`;
        }

        // Lecture/Class mode prompt
        if (profile === 'lecture' || profile === 'class') {
            return `You are an expert education analyst. Analyze the following lecture/class discussion and provide a comprehensive summary.

CLASS DISCUSSION/QUESTIONS:
${questionsText}

Please provide a summary that includes:

1. **Topics Covered**: Main subjects discussed in the session
2. **Key Concepts**: Important ideas and theories mentioned
3. **Student Questions**: What were students curious about?
4. **Difficult Concepts**: Topics that may need review
5. **Learning Objectives**: What should students take away?
6. **Study Recommendations**: What to focus on for exams/assignments
7. **Additional Resources**: Suggested topics for further reading

IMPORTANT: Focus on the educational content and learning outcomes. Help the student understand what's important.

Keep the summary educational and helpful. Use bullet points where appropriate.`;
        }

        // Meeting mode prompt
        if (profile === 'meeting') {
            return `You are an expert meeting analyst. Analyze the following meeting discussion and provide a comprehensive summary.

MEETING DISCUSSION:
${questionsText}

Please provide a summary that includes:

1. **Meeting Purpose**: What was the main objective?
2. **Key Discussion Points**: Main topics covered
3. **Decisions Made**: Any conclusions or agreements reached
4. **Action Items**: Tasks assigned with owners if mentioned
5. **Open Questions**: Unresolved issues or pending decisions
6. **Stakeholder Concerns**: Important points raised by participants
7. **Next Steps**: Recommended follow-up actions

IMPORTANT: Focus on actionable outcomes and key decisions. Help track what was discussed and what needs to happen next.

Keep the summary clear and actionable. Use bullet points where appropriate.`;
        }

        // Default fallback prompt
        return `Analyze the following conversation and provide a comprehensive summary.

CONVERSATION:
${questionsText}

Please provide a summary that includes:

1. **Main Topics**: What was discussed?
2. **Key Points**: Most important information shared
3. **Questions Asked**: What queries were raised?
4. **Insights**: Notable observations
5. **Action Items**: Any follow-ups needed

Keep the summary concise and helpful. Use bullet points where appropriate.`;
    }

    async generateSummary() {
        if (!this.selectedConversation || this._isGeneratingSummary) return;

        this._isGeneratingSummary = true;
        this.requestUpdate();

        try {
            // Build the prompt based on conversation mode
            const questions = this.selectedConversation.questions || [];
            const mode = this.selectedConversation.mode || 'interview';
            const profile = this.selectedConversation.profile || 'interview';

            // Build questions/problems text
            const questionsText = questions.map((qa, i) => `${i + 1}. ${qa.question}`).join('\n');

            // Generate mode-specific prompt
            const prompt = this.getSummaryPrompt(mode, profile, questionsText, questions);

            // Try to use Groq API first (used by interview mode), then Gemini (used by exam mode)
            let groqApiKey = (localStorage.getItem('groqApiKey') || '').trim();
            const loggedInUserStr = localStorage.getItem('loggedInUser');
            if (loggedInUserStr) {
                try {
                    const user = JSON.parse(loggedInUserStr);
                    if ((user.api_key_included === true || user.api_key_included === 'yes') && user.api_key) {
                        groqApiKey = user.api_key;
                    }
                } catch (e) {}
            }
            const geminiApiKey = (localStorage.getItem('geminiApiKey') || localStorage.getItem('apiKey') || '').trim();

            let summary = '';

            if (groqApiKey) {
                // Use Groq via fetch (preferred - used by interview mode)
                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${groqApiKey}`,
                    },
                    body: JSON.stringify({
                        model: 'openai/gpt-oss-120b',
                        messages: [{ role: 'user', content: prompt }],
                        temperature: 0.7,
                        max_tokens: 1024,
                    }),
                });
                const data = await response.json();
                if (data.choices && data.choices[0]?.message?.content) {
                    summary = data.choices[0].message.content;
                } else if (data.error) {
                    throw new Error(data.error.message || 'Groq API error');
                } else {
                    throw new Error('No summary generated');
                }
            } else if (geminiApiKey) {
                // Use Gemini via fetch (fallback - used by exam mode)
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }],
                            generationConfig: {
                                temperature: 0.7,
                                maxOutputTokens: 1024,
                            },
                        }),
                    }
                );
                const data = await response.json();
                if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                    summary = data.candidates[0].content.parts[0].text;
                } else if (data.error) {
                    throw new Error(data.error.message || 'Gemini API error');
                } else {
                    throw new Error('No summary generated');
                }
            } else {
                throw new Error('No API key available. Please configure a Groq API key in settings.');
            }

            // Save summary to conversation
            this.selectedConversation.summary = summary;
            const convIndex = this.conversations.findIndex(c => c.id === this.selectedConversation.id);
            if (convIndex !== -1) {
                this.conversations[convIndex].summary = summary;
                this.saveConversations();
            }

            this._showSummary = true;
        } catch (error) {
            console.error('Error generating summary:', error);
            alert('Failed to generate summary: ' + error.message);
        } finally {
            this._isGeneratingSummary = false;
            this.requestUpdate();
        }
    }

    toggleSummaryView() {
        this._showSummary = !this._showSummary;
        this.requestUpdate();
    }

    deleteSummary() {
        if (!this.selectedConversation) return;

        if (confirm('Delete this summary? You can regenerate it later.')) {
            delete this.selectedConversation.summary;
            const convIndex = this.conversations.findIndex(c => c.id === this.selectedConversation.id);
            if (convIndex !== -1) {
                delete this.conversations[convIndex].summary;
                this.saveConversations();
            }
            this._showSummary = false;
            this.requestUpdate();
        }
    }

    renderMarkdown(content) {
        if (typeof marked !== 'undefined') {
            try {
                return marked.parse(content);
            } catch (error) {
                return content;
            }
        }
        return content;
    }

    renderEmptyState() {
        return html`
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <h3>No Conversations Yet</h3>
                <p>Your interview conversations will appear here<br />after you complete a session.</p>
            </div>
        `;
    }

    getProfileIcon(profile) {
        if (!profile) return '💬';
        if (profile.includes('interview')) return '💼';
        if (profile.includes('sales')) return '📈';
        if (profile.includes('meeting')) return '🤝';
        if (profile.includes('presentation')) return '📊';
        if (profile.includes('negotiation')) return '⚖️';
        if (profile.includes('exam')) return '📝';
        return '💬';
    }

    handleSearchInput(e) {
        this._searchQuery = e.target.value;
    }

    handleFilterChange(e) {
        this._profileFilter = e.target.value;
    }

    toggleFilterDropdown(e) {
        if (e) e.stopPropagation();
        this._isFilterOpen = !this._isFilterOpen;
    }

    handleCustomFilterSelect(e, value) {
        if (e) e.stopPropagation();
        this._profileFilter = value;
        this._isFilterOpen = false;
    }

    closeFilterDropdown() {
        if (this._isFilterOpen) {
            this._isFilterOpen = false;
        }
    }

    getFilterLabel(val) {
        const labels = {
            all: 'All Profiles',
            interview: 'Interview Mode',
            sales: 'Sales',
            meeting: 'Meeting',
            presentation: 'Presentation',
            negotiation: 'Negotiation',
            exam: 'Exam Assistant',
            'exam-groq': 'Exam (Groq)',
        };
        return labels[val] || 'All Profiles';
    }

    getFilteredConversations() {
        return this.conversations.filter(conv => {
            const matchesSearch =
                this._searchQuery === '' ||
                (conv.summary || '').toLowerCase().includes(this._searchQuery.toLowerCase()) ||
                this.getPreviewText(conv).toLowerCase().includes(this._searchQuery.toLowerCase());
            const matchesProfile =
                this._profileFilter === 'all' || conv.profile === this._profileFilter || (!conv.profile && this._profileFilter === 'interview');
            return matchesSearch && matchesProfile;
        });
    }

    renderConversationList() {
        const filteredConversations = this.getFilteredConversations();

        return html`
            <div class="history-container" @click=${this.closeFilterDropdown}>
                <div class="warning-banner">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                    <span>Warning: Some steps of history deletion might be visible even on screen share.</span>
                </div>

                ${
                    this.conversations.length > 0
                        ? html`
                              <div class="filter-bar">
                                  <div class="search-input-wrapper">
                                      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                          <circle cx="11" cy="11" r="8"></circle>
                                          <path d="M21 21l-4.35-4.35"></path>
                                      </svg>
                                      <input
                                          type="text"
                                          class="search-input"
                                          placeholder="Search in preview or summary..."
                                          .value=${this._searchQuery}
                                          @input=${this.handleSearchInput}
                                      />
                                  </div>
                                  <div class="custom-select ${this._isFilterOpen ? 'open' : ''}" @click=${this.toggleFilterDropdown}>
                                      <div class="custom-select-trigger">
                                          <span>${this.getFilterLabel(this._profileFilter)}</span>
                                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                              <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                                          </svg>
                                      </div>
                                      ${
                            this._isFilterOpen
                                ? html`
                                      <div class="custom-select-dropdown">
                                          <div
                                              class="custom-select-option ${this._profileFilter === 'all' ? 'selected' : ''}"
                                              @click=${e => this.handleCustomFilterSelect(e, 'all')}
                                          >
                                              All Profiles
                                          </div>
                                          <div
                                              class="custom-select-option ${this._profileFilter === 'interview' ? 'selected' : ''}"
                                              @click=${e => this.handleCustomFilterSelect(e, 'interview')}
                                          >
                                              Interview Mode
                                          </div>
                                          <div
                                              class="custom-select-option ${this._profileFilter === 'sales' ? 'selected' : ''}"
                                              @click=${e => this.handleCustomFilterSelect(e, 'sales')}
                                          >
                                              Sales
                                          </div>
                                          <div
                                              class="custom-select-option ${this._profileFilter === 'meeting' ? 'selected' : ''}"
                                              @click=${e => this.handleCustomFilterSelect(e, 'meeting')}
                                          >
                                              Meeting
                                          </div>
                                          <div
                                              class="custom-select-option ${this._profileFilter === 'presentation' ? 'selected' : ''}"
                                              @click=${e => this.handleCustomFilterSelect(e, 'presentation')}
                                          >
                                              Presentation
                                          </div>
                                          <div
                                              class="custom-select-option ${this._profileFilter === 'negotiation' ? 'selected' : ''}"
                                              @click=${e => this.handleCustomFilterSelect(e, 'negotiation')}
                                          >
                                              Negotiation
                                          </div>
                                          <div
                                              class="custom-select-option ${this._profileFilter === 'exam' ? 'selected' : ''}"
                                              @click=${e => this.handleCustomFilterSelect(e, 'exam')}
                                          >
                                              Exam Assistant
                                          </div>
                                          <div
                                              class="custom-select-option ${this._profileFilter === 'exam-groq' ? 'selected' : ''}"
                                              @click=${e => this.handleCustomFilterSelect(e, 'exam-groq')}
                                          >
                                              Exam (Groq)
                                          </div>
                                      </div>
                                  `
                                : ''
                        }
                                  </div>
                              </div>
                          `
                        : ''
                }
                ${
                    filteredConversations.length === 0
                        ? this.conversations.length === 0
                            ? this.renderEmptyState()
                            : html`<div class="empty-state">
                                  <h3>No results found</h3>
                                  <p>Try adjusting your search or filter.</p>
                              </div>`
                        : html`
                              <div class="conversation-list">
                                  ${filteredConversations.map(
                                  conv => html`
                                      <div
                                          class="conversation-item profile-${conv.profile || 'default'}"
                                          @click=${() => this.handleConversationClick(conv)}
                                      >
                                          <div class="conversation-header">
                                              <div style="display: flex; align-items: center; gap: 8px;">
                                                  <span style="font-size: 14px;">${this.getProfileIcon(conv.profile)}</span>
                                                  <span class="conversation-date">${this.formatDate(conv.timestamp)}</span>
                                              </div>
                                              <button
                                                  class="delete-btn"
                                                  @click=${e => this.deleteConversation(e, conv.id)}
                                                  title="Delete conversation"
                                              >
                                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                      <path
                                                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                          stroke-linecap="round"
                                                          stroke-linejoin="round"
                                                      />
                                                  </svg>
                                              </button>
                                          </div>
                                          <div class="conversation-preview">${this.getPreviewText(conv)}</div>
                                          <div class="conversation-meta">
                                              <span>
                                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                      <path
                                                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                                          stroke-linecap="round"
                                                          stroke-linejoin="round"
                                                      />
                                                  </svg>
                                                  ${conv.questions?.length || 0} questions
                                              </span>
                                              ${
                                                  conv.duration
                                                      ? html`
                                                            <span>
                                                                <svg
                                                                    width="14"
                                                                    height="14"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    stroke-width="2"
                                                                >
                                                                    <circle cx="12" cy="12" r="10" />
                                                                    <path d="M12 6v6l4 2" />
                                                                </svg>
                                                                ${this.formatDuration(conv.duration)}
                                                            </span>
                                                        `
                                                      : ''
                                              }
                                              ${
                                                  conv.profile
                                                      ? html`<span style="text-transform: capitalize;">${conv.profile}</span>`
                                                      : conv.mode
                                                        ? html`<span style="text-transform: capitalize;">${conv.mode}</span>`
                                                        : ''
                                              }
                                              ${conv.summary ? html`<span style="color: #a78bfa;">📝 Summary</span>` : ''}
                                          </div>
                                      </div>
                                  `
                              )}
                              </div>
                          `
                }
            </div>
        `;
    }

    renderSummarySection() {
        const conv = this.selectedConversation;
        if (!conv) return '';

        const hasSummary = !!conv.summary;

        if (this._isGeneratingSummary) {
            return html`
                <div class="summary-section">
                    <div class="summary-card">
                        <div class="generating-indicator">
                            <div class="spinner"></div>
                            Generating summary...
                        </div>
                    </div>
                </div>
            `;
        }

        if (hasSummary && this._showSummary) {
            return html`
                <div class="summary-section">
                    <div class="summary-card">
                        <div class="summary-card-header">
                            <div class="summary-card-title">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                </svg>
                                Interview Summary
                            </div>
                            <div class="summary-card-actions">
                                <button class="summary-action-btn" @click=${this.toggleSummaryView} title="Hide summary">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </button>
                                <button class="summary-action-btn delete" @click=${this.deleteSummary} title="Delete summary">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div class="summary-card-content" .innerHTML=${this.renderMarkdown(conv.summary)}></div>
                    </div>
                </div>
            `;
        }

        if (hasSummary && !this._showSummary) {
            return html`
                <div class="summary-section">
                    <button class="summary-btn summary-btn-view" @click=${this.toggleSummaryView}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-linecap="round" stroke-linejoin="round" />
                            <path
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                        See Summary
                    </button>
                </div>
            `;
        }

        // No summary yet
        return html`
            <div class="summary-section">
                <button class="summary-btn summary-btn-generate" @click=${this.generateSummary} ?disabled=${this._isGeneratingSummary}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                    Generate Summary
                </button>
            </div>
        `;
    }

    renderConversationDetail() {
        const conv = this.selectedConversation;
        if (!conv) return '';

        return html`
            <div class="detail-container">
                <div class="detail-header">
                    <button class="back-btn" @click=${this.handleBackToList} title="Back to list">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M15 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                    <div class="detail-title">
                        ${
                            this._isEditingTitle
                                ? html`
                                      <input
                                          class="edit-title-input"
                                          type="text"
                                          .value=${this._editTitleValue}
                                          @keydown=${this.handleTitleKeydown}
                                          @blur=${this.saveTitle}
                                      />
                                  `
                                : html`
                                      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
                                          <h3>${conv.title || (conv.questions?.length > 0 ? conv.questions[0].question : 'Conversation Details')}</h3>
                                          <button class="edit-title-btn" @click=${this.startEditingTitle} title="Edit title">
                                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                  <path
                                                      d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                                                      stroke-linecap="round"
                                                      stroke-linejoin="round"
                                                  />
                                                  <path
                                                      d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                                                      stroke-linecap="round"
                                                      stroke-linejoin="round"
                                                  />
                                              </svg>
                                          </button>
                                      </div>
                                  `
                        }
                        <span>${this.formatDate(conv.timestamp)} • ${conv.questions?.length || 0} questions</span>
                    </div>
                    <span class="read-only-badge">Read Only</span>
                </div>
                <div class="detail-content">
                    ${this.renderSummarySection()}
                    ${
                        conv.questions && conv.questions.length > 0
                            ? conv.questions.map(
                                  (qa, index) => html`
                                      <div class="qa-item ${this.expandedItems.includes(index) ? 'expanded' : ''}">
                                          <div class="qa-question" @click=${() => this.toggleExpand(index)}>
                                              <span class="qa-number">${index + 1}</span>
                                              <span class="qa-question-text">${qa.question || 'Question not recorded'}</span>
                                              <svg class="qa-expand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                  <path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round" />
                                              </svg>
                                          </div>
                                          <div class="qa-answer" .innerHTML=${this.renderMarkdown(qa.response || 'No response recorded')}></div>
                                      </div>
                                  `
                              )
                            : html`<p style="color: var(--description-color); text-align: center;">No questions recorded in this conversation.</p>`
                    }
                </div>
            </div>
        `;
    }

    render() {
        return this.selectedConversation ? this.renderConversationDetail() : this.renderConversationList();
    }
}

customElements.define('history-view', HistoryView);
