const { ipcMain, BrowserWindow } = require('electron');
const BASE = 'https://www.interviewcracked.com/api/account';
let credentials = null, session = null, heartbeat = null, deadline = null;
function notify(channel, data) { for (const win of BrowserWindow.getAllWindows()) win.webContents.send(channel, data); }
async function request(path, body, retry = true) {
    if (!credentials) throw new Error('Please sign in again');
    const response = await fetch(`${BASE}${path}`, {
        method: body ? 'POST' : 'GET', headers: { Authorization: `Bearer ${credentials.access_token}`, 'Content-Type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(8000),
    });
    if (response.status === 401 && retry) {
        const refreshed = await fetch(`${BASE}/token`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: credentials.refresh_token }), signal: AbortSignal.timeout(8000) });
        const data = await refreshed.json();
        if (!refreshed.ok) throw new Error('Please sign in again');
        credentials = data.session;
        notify('managed-credentials', credentials);
        return request(path, body, false);
    }
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Account request failed');
    return data;
}
function arm(data) {
    clearTimeout(deadline);
    if (!data.lease_seconds) throw new Error('Your interview time is used up. Upgrade at interviewcracked.com/account.');
    session = data;
    // Stop locally before the server lease expires, even if the next heartbeat fails.
    deadline = setTimeout(() => expire('Session connection expired. Please start again.'), data.lease_seconds * 1000);
    notify('managed-usage', data);
}
async function stop() {
    clearInterval(heartbeat); clearTimeout(deadline); heartbeat = null;
    const old = session; session = null;
    if (old) { try { await request('/session', { action: 'stop', sessionId: old.session_id }); } catch { /* server lease bounds disconnect usage */ } }
}
function expire(message) { void stop(); notify('managed-session-ended', message); }
function proxyOptions() {
    if (!session || !credentials) throw new Error('Start an interview session first');
    return { url: `${BASE}/groq`, headers: { Authorization: `Bearer ${credentials.access_token}`, 'X-Session-Id': session.session_id } };
}
function setup() {
    ipcMain.handle('managed-auth', async (_event, value) => {
        await stop(); credentials = value;
        return credentials ? request('') : null;
    });
    ipcMain.handle('managed-account', () => request(''));
    ipcMain.handle('managed-start', async (_event, profile) => {
        if (session) throw new Error('Session already active');
        const data = await request('/session', { action: 'start', profile });
        arm(data);
        let pending = false;
        heartbeat = setInterval(async () => {
            if (pending || !session) return;
            pending = true;
            try { const data = await request('/session', { action:'heartbeat',sessionId:session.session_id }); if (session) arm(data); }
            catch (error) { expire(error.message); } finally { pending = false; }
        }, 10000);
        return data;
    });
    ipcMain.handle('managed-stop', stop);
}
module.exports = { setup, stop, proxyOptions };
