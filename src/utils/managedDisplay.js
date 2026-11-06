export function formatRemainingSeconds(value) {
    const total = Math.max(0, Math.floor(Number(value) || 0));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    return `${hours ? `${hours}h ` : ''}${minutes}m ${seconds}s`;
}

export function managedHomeAccess(user) {
    if (user?.account_type !== 'managed') return null;
    if (user.unlimited === true) return { kind: 'unlimited', badge: 'Unlimited Access' };

    const packSeconds = Math.max(0, Math.floor(Number(user.pack_remaining_seconds) || 0));
    if (packSeconds > 0) return { kind: 'pack', badge: `Hourly Pack · ${formatRemainingSeconds(packSeconds)} left` };

    const remainingSeconds = Math.max(0, Math.floor(Number(user.remaining_seconds) || 0));
    const trialSeconds = Math.max(0, Math.floor(Number(user.trial_seconds) || 0));
    const freeTotalSeconds = Math.max(0, Math.floor(Number(user.free_total_seconds ?? trialSeconds) || 0));
    const hasAddedAccess = freeTotalSeconds > trialSeconds;
    return {
        kind: 'free',
        remainingSeconds,
        title: hasAddedAccess ? 'Free access remaining' : 'Free trial remaining',
        badge: `${hasAddedAccess ? 'Free Access' : 'Free Trial'} · ${formatRemainingSeconds(remainingSeconds)} left`,
    };
}

export function managedUsageView(user, value) {
    const packSeconds = Math.max(0, Math.floor(Number(value.pack_remaining_seconds) || 0));
    const nextUser =
        user?.account_type === 'managed'
            ? {
                  ...user,
                  remaining_seconds: value.plan === 'paid' ? null : Math.floor(value.remaining_seconds),
                  unlimited: value.plan === 'paid',
                  pack_remaining_seconds: value.pack_remaining_seconds === undefined ? user.pack_remaining_seconds : packSeconds,
                  plan_type: value.plan_type || user.plan_type,
                  access_until: value.access_until || null,
              }
            : user;
    const status =
        value.plan === 'paid'
            ? 'Unlimited paid access'
            : value.plan === 'pack'
              ? `${formatRemainingSeconds(packSeconds)} purchased time left · Hourly pack`
              : `${formatRemainingSeconds(value.free_remaining_seconds ?? value.remaining_seconds)} remaining · Free access`;
    return { user: nextUser, status };
}
