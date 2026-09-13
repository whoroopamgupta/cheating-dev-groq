const https = require('https');

/**
 * Device session management for login limit enforcement.
 *
 * Calls the Interview Cracked website API instead of accessing
 * Supabase directly. The service_role key stays server-side.
 */

const API_BASE = 'https://www.interviewcracked.com/api/device-sessions';

/**
 * Makes a POST request to the device-sessions API.
 * @param {string} endpoint - 'check', 'deactivate', or 'heartbeat'
 * @param {object} body - JSON request body
 * @returns {Promise<object>}
 */
function apiPost(endpoint, body) {
    return new Promise((resolve, reject) => {
        const url = new URL(`${API_BASE}/${endpoint}`);
        const payload = JSON.stringify(body);

        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
            },
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed);
                } catch (e) {
                    reject(new Error(`Invalid JSON response from ${endpoint}: ${data.substring(0, 200)}`));
                }
            });
        });

        req.on('error', (err) => {
            reject(new Error(`Network error calling ${endpoint}: ${err.message}`));
        });

        // 10 second timeout
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error(`Timeout calling ${endpoint}`));
        });

        req.write(payload);
        req.end();
    });
}

/**
 * Checks whether the device is allowed to login and registers it if so.
 *
 * @param {string} subscriberId - UUID of the subscriber
 * @param {string} deviceId - Hashed device fingerprint
 * @param {string} deviceName - Human-readable device name
 * @param {number} screensAllowed - Max devices allowed (from subscribers table)
 * @returns {Promise<{allowed: boolean, activeDevices?: number, maxDevices?: number, error?: string}>}
 */
async function checkAndRegisterDevice(subscriberId, deviceId, deviceName, screensAllowed) {
    try {
        const result = await apiPost('check', {
            subscriberId,
            deviceId,
            deviceName,
            screensAllowed,
        });

        if (result.allowed) {
            console.log('[DeviceSession] Device allowed via API');
        } else {
            console.log(`[DeviceSession] Device blocked: ${result.error}`);
        }

        return result;
    } catch (error) {
        console.error('[DeviceSession] API error:', error.message);
        return {
            allowed: false,
            error: error.message,
        };
    }
}

/**
 * Deactivates a device session on logout.
 * This frees up a device slot so the user can login from another device.
 *
 * @param {string} subscriberId - UUID of the subscriber
 * @param {string} deviceId - Hashed device fingerprint
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function deactivateDeviceSession(subscriberId, deviceId) {
    try {
        const result = await apiPost('deactivate', {
            subscriberId,
            deviceId,
        });

        if (result.success) {
            console.log('[DeviceSession] Device session deactivated via API');
        } else {
            console.error('[DeviceSession] Deactivation failed:', result.error);
        }

        return result;
    } catch (error) {
        console.error('[DeviceSession] API error during deactivation:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Updates the last_active_at timestamp for a device session.
 * Can be called periodically as a heartbeat for stale session cleanup.
 *
 * @param {string} subscriberId - UUID of the subscriber
 * @param {string} deviceId - Hashed device fingerprint
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function updateLastActive(subscriberId, deviceId) {
    try {
        const result = await apiPost('heartbeat', {
            subscriberId,
            deviceId,
        });

        return result;
    } catch (error) {
        console.error('[DeviceSession] API error during heartbeat:', error.message);
        return { success: false, error: error.message };
    }
}

module.exports = {
    checkAndRegisterDevice,
    deactivateDeviceSession,
    updateLastActive,
};
