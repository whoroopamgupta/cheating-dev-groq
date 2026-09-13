const { getSupabaseAdmin } = require('./supabaseClient');

/**
 * Device session management for login limit enforcement.
 *
 * Uses the Supabase admin client (service_role key) to manage
 * the `device_sessions` table directly from the main process.
 */

/**
 * Checks whether the device is allowed to login and registers it if so.
 *
 * Logic:
 *   1. Query active sessions for the subscriber
 *   2. If this device already has an active session → update last_active_at → allow
 *   3. If active session count >= screens_allowed → block
 *   4. If under the limit → insert new session → allow
 *
 * @param {string} subscriberId - UUID of the subscriber
 * @param {string} deviceId - Hashed device fingerprint
 * @param {string} deviceName - Human-readable device name
 * @param {number} screensAllowed - Max devices allowed (from subscribers table)
 * @returns {Promise<{allowed: boolean, activeDevices?: number, maxDevices?: number, error?: string}>}
 */
async function checkAndRegisterDevice(subscriberId, deviceId, deviceName, screensAllowed) {
    try {
        const supabase = getSupabaseAdmin();

        // Step 1: Get all active device sessions for this subscriber
        const { data: activeSessions, error: fetchError } = await supabase
            .from('device_sessions')
            .select('*')
            .eq('subscriber_id', subscriberId)
            .eq('is_active', true);

        if (fetchError) {
            console.error('[DeviceSession] Error fetching active sessions:', fetchError);
            return {
                allowed: false,
                error: `Database error: ${fetchError.message}`,
            };
        }

        const sessions = activeSessions || [];

        // Step 2: Check if this device already has an active session
        const existingSession = sessions.find(s => s.device_id === deviceId);

        if (existingSession) {
            // Device is already registered — update last_active_at and allow login
            const { error: updateError } = await supabase
                .from('device_sessions')
                .update({
                    last_active_at: new Date().toISOString(),
                    device_name: deviceName, // Update name in case it changed
                })
                .eq('id', existingSession.id);

            if (updateError) {
                console.error('[DeviceSession] Error updating session:', updateError);
            }

            console.log('[DeviceSession] Existing device session found, login allowed');
            return { allowed: true };
        }

        // Step 3: Device is NOT registered — check the limit
        const activeCount = sessions.length;
        const maxAllowed = screensAllowed || 1;

        if (activeCount >= maxAllowed) {
            // Over the limit — BLOCK
            console.log(`[DeviceSession] Device limit exceeded: ${activeCount} active >= ${maxAllowed} allowed`);
            return {
                allowed: false,
                activeDevices: activeCount,
                maxDevices: maxAllowed,
                error: 'DEVICE_LIMIT_EXCEEDED',
            };
        }

        // Step 4: Under the limit — register new device session
        const { error: insertError } = await supabase.from('device_sessions').upsert(
            {
                subscriber_id: subscriberId,
                device_id: deviceId,
                device_name: deviceName,
                is_active: true,
                logged_in_at: new Date().toISOString(),
                last_active_at: new Date().toISOString(),
            },
            {
                onConflict: 'subscriber_id,device_id',
            }
        );

        if (insertError) {
            console.error('[DeviceSession] Error inserting session:', insertError);
            return {
                allowed: false,
                error: `Database error: ${insertError.message}`,
            };
        }

        console.log('[DeviceSession] New device registered, login allowed');
        return { allowed: true };
    } catch (error) {
        console.error('[DeviceSession] Unexpected error:', error);
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
        const supabase = getSupabaseAdmin();

        const { error } = await supabase
            .from('device_sessions')
            .update({ is_active: false })
            .eq('subscriber_id', subscriberId)
            .eq('device_id', deviceId);

        if (error) {
            console.error('[DeviceSession] Error deactivating session:', error);
            return { success: false, error: error.message };
        }

        console.log('[DeviceSession] Device session deactivated');
        return { success: true };
    } catch (error) {
        console.error('[DeviceSession] Unexpected error during deactivation:', error);
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
        const supabase = getSupabaseAdmin();

        const { error } = await supabase
            .from('device_sessions')
            .update({ last_active_at: new Date().toISOString() })
            .eq('subscriber_id', subscriberId)
            .eq('device_id', deviceId)
            .eq('is_active', true);

        if (error) {
            console.error('[DeviceSession] Error updating last_active_at:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('[DeviceSession] Unexpected error updating last active:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    checkAndRegisterDevice,
    deactivateDeviceSession,
    updateLastActive,
};
