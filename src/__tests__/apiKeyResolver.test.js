import { describe, it, expect, beforeEach, vi } from 'vitest';
import { isApiKeyIncluded, getActiveApiKey, clearCachedApiKeys } from '../utils/apiKeyResolver.js';

describe('apiKeyResolver', () => {
    let mockStorage = {};

    beforeEach(() => {
        mockStorage = {};
        vi.stubGlobal('localStorage', {
            getItem: vi.fn(key => mockStorage[key] || null),
            setItem: vi.fn((key, value) => {
                mockStorage[key] = String(value);
            }),
            removeItem: vi.fn(key => {
                delete mockStorage[key];
            }),
            clear: vi.fn(() => {
                mockStorage = {};
            }),
        });
    });

    describe('isApiKeyIncluded', () => {
        it('returns false when user is null or undefined', () => {
            expect(isApiKeyIncluded(null)).toBe(false);
            expect(isApiKeyIncluded(undefined)).toBe(false);
        });

        it('returns true when api_key_included is boolean true', () => {
            expect(isApiKeyIncluded({ api_key_included: true })).toBe(true);
        });

        it('returns true when api_key_included is string "yes" (case-insensitive)', () => {
            expect(isApiKeyIncluded({ api_key_included: 'yes' })).toBe(true);
            expect(isApiKeyIncluded({ api_key_included: 'YES' })).toBe(true);
        });

        it('returns false when api_key_included is false or other string', () => {
            expect(isApiKeyIncluded({ api_key_included: false })).toBe(false);
            expect(isApiKeyIncluded({ api_key_included: 'no' })).toBe(false);
        });
    });

    describe('getActiveApiKey', () => {
        it('returns user.api_key for Groq mode when key is included', () => {
            const user = { api_key_included: true, api_key: 'gsk_db_key_123' };
            localStorage.setItem('loggedInUser', JSON.stringify(user));
            localStorage.setItem('groqApiKey', 'gsk_manual_old_key');

            const key = getActiveApiKey('interview');
            expect(key).toBe('gsk_db_key_123');
        });

        it('falls back to groqApiKey when key is not included in user plan', () => {
            const user = { api_key_included: false, api_key: 'gsk_unused_key' };
            localStorage.setItem('loggedInUser', JSON.stringify(user));
            localStorage.setItem('groqApiKey', 'gsk_manual_active_key');

            const key = getActiveApiKey('interview');
            expect(key).toBe('gsk_manual_active_key');
        });

        it('falls back to groqApiKey when user is not logged in', () => {
            localStorage.setItem('groqApiKey', 'gsk_manual_key');

            const key = getActiveApiKey('interview');
            expect(key).toBe('gsk_manual_key');
        });

        it('returns geminiApiKey for exam mode and ignores groq apiKey', () => {
            localStorage.setItem('geminiApiKey', 'AIzaSy_gemini_test');
            localStorage.setItem('apiKey', 'legacy_groq_key');

            expect(getActiveApiKey('exam')).toBe('AIzaSy_gemini_test');
            expect(getActiveApiKey('gemini')).toBe('AIzaSy_gemini_test');
        });

        it('returns empty string for exam mode when user has not entered a Gemini key', () => {
            localStorage.setItem('apiKey', 'groq_dashboard_key');

            expect(getActiveApiKey('exam')).toBe('');
            expect(getActiveApiKey('gemini')).toBe('');
        });

        it('accepts userOverride parameter directly', () => {
            const overrideUser = { api_key_included: true, api_key: 'gsk_override_key' };
            expect(getActiveApiKey('interview', overrideUser)).toBe('gsk_override_key');
        });
    });

    describe('clearCachedApiKeys', () => {
        it('removes apiKey, groqApiKey, and geminiApiKey from localStorage', () => {
            localStorage.setItem('apiKey', 'key1');
            localStorage.setItem('groqApiKey', 'key2');
            localStorage.setItem('geminiApiKey', 'key3');
            localStorage.setItem('otherKey', 'keep_this');

            clearCachedApiKeys();

            expect(localStorage.getItem('apiKey')).toBeNull();
            expect(localStorage.getItem('groqApiKey')).toBeNull();
            expect(localStorage.getItem('geminiApiKey')).toBeNull();
            expect(localStorage.getItem('otherKey')).toBe('keep_this');
        });
    });
});
