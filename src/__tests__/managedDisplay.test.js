import { describe, expect, it } from 'vitest';
import { managedHomeAccess, managedUsageView } from '../utils/managedDisplay.js';

describe('managed account balance flow', () => {
    it('shows the exact free trial balance on Home, including zero remaining', () => {
        const trial = { account_type: 'managed', trial_seconds: 600, free_total_seconds: 600, remaining_seconds: 417, pack_remaining_seconds: 0 };
        expect(managedHomeAccess(trial)).toEqual({
            kind: 'free',
            remainingSeconds: 417,
            title: 'Free trial remaining',
            badge: 'Free Trial · 6m 57s left',
        });
        expect(managedHomeAccess({ ...trial, remaining_seconds: 0 }).badge).toBe('Free Trial · 0m 0s left');
    });

    it('keeps paid and purchased balances out of the free trial display', () => {
        const base = { account_type: 'managed', trial_seconds: 600, free_total_seconds: 600, remaining_seconds: 600 };
        expect(managedHomeAccess({ ...base, pack_remaining_seconds: 10800 })).toEqual({
            kind: 'pack',
            badge: 'Hourly Pack · 3h 0m 0s left',
        });
        expect(managedHomeAccess({ ...base, unlimited: true })).toEqual({ kind: 'unlimited', badge: 'Unlimited Access' });
        expect(managedHomeAccess({ account_type: 'legacy', remaining_seconds: 600 })).toBeNull();
    });

    it('keeps the purchased balance separate from the ten-minute free trial', () => {
        const initial = { account_type: 'managed', trial_seconds: 600, plan_type: 'Free trial' };
        const started = managedUsageView(initial, {
            plan: 'pack',
            plan_type: 'Hourly pack',
            remaining_seconds: 11400,
            pack_remaining_seconds: 10800,
            free_remaining_seconds: 600,
            access_until: null,
        });
        expect(started.user.pack_remaining_seconds).toBe(10800);
        expect(started.user.remaining_seconds).toBe(11400);
        expect(started.status).toContain('3h 0m 0s purchased time left');

        const renewed = managedUsageView(started.user, {
            plan: 'pack',
            plan_type: 'Hourly pack',
            remaining_seconds: 11390,
            pack_remaining_seconds: 10790,
            free_remaining_seconds: 600,
            access_until: null,
        });
        expect(renewed.user.pack_remaining_seconds).toBe(10790);
        expect(renewed.status).toContain('2h 59m 50s purchased time left');
    });

    it('shows unlimited access through its paid period, then returns to saved pack time', () => {
        const period = '2026-12-06T10:00:00.000Z';
        const initial = { account_type: 'managed', plan_type: 'Hourly pack', pack_remaining_seconds: 25200 };
        const subscribed = managedUsageView(initial, {
            plan: 'paid',
            plan_type: 'Monthly',
            remaining_seconds: 2147483647,
            pack_remaining_seconds: 25200,
            access_until: period,
        });
        expect(subscribed.user.unlimited).toBe(true);
        expect(subscribed.user.access_until).toBe(period);
        expect(subscribed.user.pack_remaining_seconds).toBe(25200);

        const expired = managedUsageView(subscribed.user, {
            plan: 'pack',
            plan_type: 'Hourly pack',
            remaining_seconds: 25800,
            pack_remaining_seconds: 25200,
            free_remaining_seconds: 600,
            access_until: null,
        });
        expect(expired.user.unlimited).toBe(false);
        expect(expired.user.access_until).toBe(null);
        expect(expired.user.pack_remaining_seconds).toBe(25200);
        expect(expired.status).toContain('7h 0m 0s purchased time left');
    });

    it('shows only free time after purchased minutes are exhausted', () => {
        const state = managedUsageView(
            { account_type: 'managed', pack_remaining_seconds: 1 },
            {
                plan: 'trial',
                plan_type: 'Free trial',
                remaining_seconds: 600,
                pack_remaining_seconds: 0,
                free_remaining_seconds: 600,
                access_until: null,
            }
        );
        expect(state.user.pack_remaining_seconds).toBe(0);
        expect(state.status).toContain('10m 0s remaining · Free access');
    });
});
