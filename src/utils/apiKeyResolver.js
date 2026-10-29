/**
 * API Key Resolver Utility
 *
 * Provides a single source of truth for resolving active API keys across all views.
 * Handles database-included keys vs manual keys with proper precedence,
 * avoiding stale cached keys across logout/login cycles.
 */

/**
 * Checks if the user plan includes an API key provided by the database.
 * @param {object|null} user - The loggedInUser object from localStorage
 * @returns {boolean}
 */
export function isApiKeyIncluded(user) {
    if (!user) return false;
    return user.api_key_included === true || String(user.api_key_included).toLowerCase() === 'yes';
}

/**
 * Resolves the active API key for a given profile or mode.
 *
 * Precedence rules:
 * - Exam mode (Gemini):
 *   Prefers 'geminiApiKey', falls back to legacy 'apiKey' if present.
 * - Non-exam modes (Groq - interview, exam-groq, etc.):
 *   1. If user is logged in AND has an included API key with a non-empty key, returns user.api_key.
 *   2. Otherwise returns the manually entered 'groqApiKey' from localStorage.
 *
 * @param {string} profileOrMode - 'exam', 'interview', 'exam-groq', or 'groq'/'gemini'
 * @param {object|null} [userOverride=null] - Optional user object to use instead of reading localStorage
 * @returns {string} The resolved API key trimmed, or an empty string.
 */
export function getActiveApiKey(profileOrMode = 'interview', userOverride = null) {
    const isGemini = profileOrMode === 'exam' || profileOrMode === 'gemini';

    if (isGemini) {
        return (localStorage.getItem('geminiApiKey') || '').trim();
    }

    // Groq mode
    let user = userOverride;
    if (!user) {
        try {
            const loggedInUserStr = localStorage.getItem('loggedInUser');
            if (loggedInUserStr) {
                user = JSON.parse(loggedInUserStr);
            }
        } catch (e) {
            console.error('[apiKeyResolver] Error parsing loggedInUser from localStorage:', e);
        }
    }

    if (isApiKeyIncluded(user) && user.api_key && typeof user.api_key === 'string' && user.api_key.trim()) {
        return user.api_key.trim();
    }

    return (localStorage.getItem('groqApiKey') || '').trim();
}

/**
 * Clears all cached API keys from localStorage.
 * Should be called upon logout or plan expiration.
 */
export function clearCachedApiKeys() {
    localStorage.removeItem('apiKey');
    localStorage.removeItem('groqApiKey');
    localStorage.removeItem('geminiApiKey');
}
