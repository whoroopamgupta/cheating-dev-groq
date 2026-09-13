const os = require('os');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

/**
 * Generates a persistent, unique device identifier.
 *
 * Strategy:
 *   1. Try hardware-based ID (platform-specific)
 *   2. Fall back to a persisted UUID in the config directory
 *
 * The device ID is hashed (SHA-256) for consistency and privacy.
 */

// Use the same config directory as config.js
function getConfigDir() {
    const platform = os.platform();
    if (platform === 'win32') {
        return path.join(os.homedir(), 'AppData', 'Roaming', 'cheating-daddy-config');
    } else if (platform === 'darwin') {
        return path.join(os.homedir(), 'Library', 'Application Support', 'cheating-daddy-config');
    } else {
        return path.join(os.homedir(), '.config', 'cheating-daddy-config');
    }
}

/**
 * Attempts to read a hardware-specific machine identifier.
 * @returns {string|null} Raw hardware ID or null if unavailable
 */
function getHardwareId() {
    const platform = os.platform();

    try {
        if (platform === 'darwin') {
            // macOS: hardware UUID from system_profiler
            const output = execSync('system_profiler SPHardwareDataType | grep "Hardware UUID"', { encoding: 'utf8', timeout: 5000 });
            const match = output.match(/Hardware UUID:\s*(.+)/);
            if (match && match[1]) {
                return match[1].trim();
            }
        } else if (platform === 'win32') {
            // Windows: BIOS UUID via WMIC
            const output = execSync('wmic csproduct get UUID', {
                encoding: 'utf8',
                timeout: 5000,
            });
            const lines = output.trim().split('\n');
            if (lines.length >= 2) {
                const uuid = lines[1].trim();
                if (uuid && uuid !== 'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF') {
                    return uuid;
                }
            }
        } else {
            // Linux: /etc/machine-id
            if (fs.existsSync('/etc/machine-id')) {
                const machineId = fs.readFileSync('/etc/machine-id', 'utf8').trim();
                if (machineId) {
                    return machineId;
                }
            }
            // Fallback: /var/lib/dbus/machine-id
            if (fs.existsSync('/var/lib/dbus/machine-id')) {
                const machineId = fs.readFileSync('/var/lib/dbus/machine-id', 'utf8').trim();
                if (machineId) {
                    return machineId;
                }
            }
        }
    } catch (error) {
        console.warn('[DeviceId] Hardware ID retrieval failed:', error.message);
    }

    return null;
}

/**
 * Gets or creates a persisted fallback device ID (UUID stored on disk).
 * @returns {string} The persisted UUID
 */
function getPersistedDeviceId() {
    const configDir = getConfigDir();
    const deviceIdFile = path.join(configDir, 'device-id');

    try {
        if (fs.existsSync(deviceIdFile)) {
            const storedId = fs.readFileSync(deviceIdFile, 'utf8').trim();
            if (storedId) {
                return storedId;
            }
        }
    } catch (error) {
        console.warn('[DeviceId] Error reading persisted device ID:', error.message);
    }

    // Generate a new UUID and persist it
    const newId = crypto.randomUUID();
    try {
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }
        fs.writeFileSync(deviceIdFile, newId, 'utf8');
        console.log('[DeviceId] Generated and persisted new fallback device ID');
    } catch (error) {
        console.error('[DeviceId] Failed to persist device ID:', error.message);
    }

    return newId;
}

/**
 * Returns a stable, hashed device identifier.
 * Uses hardware ID when available, falls back to a persisted UUID.
 * @returns {string} SHA-256 hash of the device identifier
 */
function getDeviceId() {
    let rawId = getHardwareId();

    if (!rawId) {
        console.log('[DeviceId] Hardware ID unavailable, using persisted fallback');
        rawId = getPersistedDeviceId();
    }

    // Hash for consistency and privacy
    const hash = crypto.createHash('sha256').update(rawId).digest('hex');
    return hash;
}

/**
 * Returns a human-readable device name.
 * @returns {string} e.g. "macOS - Johns-MacBook-Pro"
 */
function getDeviceName() {
    const platform = os.platform();
    const hostname = os.hostname();

    const platformNames = {
        darwin: 'macOS',
        win32: 'Windows',
        linux: 'Linux',
    };

    const platformName = platformNames[platform] || platform;
    return `${platformName} - ${hostname}`;
}

module.exports = { getDeviceId, getDeviceName };
