// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import '../components/views/MainView.js';

afterEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
});

describe('Home account controls', () => {
    it('shows free trial time and opens plans or the account dashboard from separate buttons', async () => {
        localStorage.setItem('loggedInUser', JSON.stringify({
            account_type: 'managed',
            email: 'trial@example.com',
            trial_seconds: 600,
            free_total_seconds: 600,
            remaining_seconds: 417,
            pack_remaining_seconds: 0,
        }));
        const view = document.createElement('main-view');
        const upgrade = vi.fn();
        const manage = vi.fn();
        view.onUpgrade = upgrade;
        view.onManageAccount = manage;
        document.body.append(view);
        await view.updateComplete;

        expect(view.shadowRoot.textContent).toContain('Free trial remaining');
        expect(view.shadowRoot.textContent).toContain('6m 57s');
        expect(view.shadowRoot.textContent).toContain('trial@example.com');

        view.shadowRoot.querySelector('.trial-balance button').click();
        view.shadowRoot.querySelector('.manage-account-button').click();
        expect(upgrade).toHaveBeenCalledOnce();
        expect(manage).toHaveBeenCalledOnce();

        view.accountUser = { ...JSON.parse(localStorage.getItem('loggedInUser')), remaining_seconds: 180 };
        await view.updateComplete;
        expect(view.shadowRoot.querySelector('.trial-balance-time').textContent).toBe('3m 0s');

        view.accountUser = { ...view.accountUser, unlimited: true };
        await view.updateComplete;
        expect(view.shadowRoot.querySelector('.trial-balance')).toBeNull();
        expect(view.shadowRoot.textContent).toContain('Unlimited Access');
    });

    it('does not send legacy accounts to the managed-account dashboard', async () => {
        localStorage.setItem('loggedInUser', JSON.stringify({ account_type: 'legacy', email: 'legacy@example.com', paid: true }));
        const view = document.createElement('main-view');
        document.body.append(view);
        await view.updateComplete;
        expect(view.shadowRoot.querySelector('.manage-account-button')).toBeNull();
    });
});
