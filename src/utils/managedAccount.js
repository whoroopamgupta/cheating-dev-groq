const { ipcMain, BrowserWindow } = require('electron');
const BASE = 'https://www.interviewcracked.com/api/account';
let credentials = null,
    session = null,
    heartbeat = null,
    deadline = null;
let generation = 0,
    starting = false,
    refreshPromise = null;
function notify(channel, data) {
    for (const win of BrowserWindow.getAllWindows()) win.webContents.send(channel, data);
}
async function request(path, body, retry = true, identity = credentials) {
    if (!identity || identity !== credentials) throw new Error('Please sign in again');
    const response = await fetch(`${BASE}${path}`, {
        method: body ? 'POST' : 'GET',
        headers: { Authorization: `Bearer ${identity.access_token}`, 'Content-Type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {}),
        signal: AbortSignal.timeout(8000),
    });
    if (identity !== credentials) throw new Error('Account changed. Please try again.');
    if (response.status === 401 && retry) {
        if (!refreshPromise) {
            refreshPromise = (async () => {
                const refreshed = await fetch(`${BASE}/token`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refresh_token: identity.refresh_token }),
                    signal: AbortSignal.timeout(8000),
                });
                const data = await refreshed.json();
                if (!refreshed.ok || !data.session?.access_token) throw new Error('Please sign in again');
                if (identity !== credentials) throw new Error('Account changed. Please try again.');
                Object.assign(identity, data.session);
                notify('managed-credentials', identity);
            })();
        }
        const pendingRefresh = refreshPromise;
        try {
            await pendingRefresh;
        } finally {
            if (refreshPromise === pendingRefresh) refreshPromise = null;
        }
        return request(path, body, false, identity);
    }
    const data = await response.json();
    if (identity !== credentials) throw new Error('Account changed. Please try again.');
    if (!response.ok) throw new Error(data.error || 'Account request failed');
    return data;
}
function arm(data, startedAt) {
    const leaseMs = Number(data.lease_seconds) * 1000;
    if (!Number.isFinite(leaseMs) || leaseMs <= 0) throw new Error('Your interview time is used up. Upgrade at interviewcracked.com/account.');
    // Include request transit time so the local deadline never extends the server lease.
    const remainingMs = leaseMs - (Date.now() - startedAt);
    if (remainingMs <= 0) throw new Error('Session connection expired. Please start again.');
    clearTimeout(deadline);
    session = data;
    deadline = setTimeout(() => expire('Session connection expired. Please start again.'), remainingMs);
    notify('managed-usage', data);
}
async function stop() {
    generation++;
    starting = false;
    clearInterval(heartbeat);
    clearTimeout(deadline);
    heartbeat = null;
    const old = session;
    session = null;
    if (old) {
        try {
            await request('/session', { action: 'stop', sessionId: old.session_id });
        } catch {
            /* server lease bounds disconnect usage */
        }
    }
}
function expire(message) {
    void stop();
    notify('managed-session-ended', message);
}
function proxyOptions() {
    if (!session || !credentials) throw new Error('Start an interview session first');
    return {
        url: `${BASE}/groq`,
        headers: {
            Authorization: `Bearer ${credentials.access_token}`,
            'X-Session-Id': session.session_id,
            ...(session.session_access ? { 'X-Session-Access': session.session_access } : {}),
        },
    };
}
function setup() {
    ipcMain.handle('managed-auth', async (_event, value) => {
        await stop();
        if (value !== null && (typeof value?.access_token !== 'string' || typeof value?.refresh_token !== 'string')) {
            throw new Error('Invalid account session. Please sign in again.');
        }
        credentials = value ? { ...value } : null;
        refreshPromise = null;
        if (!credentials) return null;
        const account = await request('');
        return { ...account, session: { ...credentials } };
    });
    ipcMain.handle('managed-account', () => request(''));
    ipcMain.handle('managed-start', async (_event, profile) => {
        if (session || starting) throw new Error('Session already active');
        if (profile !== 'interview') throw new Error('Select Interview mode to use your account minutes.');
        const current = ++generation,
            identity = credentials,
            startedAt = Date.now();
        starting = true;
        let data;
        try {
            data = await request('/session', { action: 'start', profile });
            if (current !== generation) throw new Error('Session start cancelled.');
            arm(data, startedAt);
        } catch (error) {
            if (data?.session_id) {
                try {
                    await request('/session', { action: 'stop', sessionId: data.session_id }, true, identity);
                } catch {
                    /* lease expires */
                }
            }
            throw error;
        } finally {
            if (current === generation) starting = false;
        }
        let pending = false;
        heartbeat = setInterval(async () => {
            if (pending || !session || current !== generation) return;
            pending = true;
            const startedAt = Date.now(),
                sessionId = session.session_id;
            try {
                const data = await request('/session', { action: 'heartbeat', sessionId });
                if (current === generation && session?.session_id === sessionId) arm(data, startedAt);
            } catch (error) {
                if (current === generation) expire(error.message);
            } finally {
                pending = false;
            }
        }, 10000);
        return data;
    });
    ipcMain.handle('managed-stop', stop);
}
module.exports = { setup, stop, proxyOptions };
