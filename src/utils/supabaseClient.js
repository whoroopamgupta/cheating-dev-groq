const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Supabase's realtime-js checks the global environment for WebSocket on initialization.
// Since Electron's main process runs an older Node version (<22) without native WebSocket,
// and we don't actually use realtime subscriptions here, we inject a dummy constructor
// directly into the global scope to satisfy the strict check.
if (typeof global.WebSocket === 'undefined') {
    global.WebSocket = class MockWebSocket {
        constructor() {}
        send() {}
        close() {}
        addEventListener() {}
        removeEventListener() {}
    };
}

/**
 * Creates a Supabase admin client using the service_role key.
 * This client bypasses Row Level Security (RLS) and should only
 * be used in the main (Node) process — never expose the service
 * role key to the renderer.
 */

function loadEnv() {
    // Try loading from .env in the project root
    const envPaths = [path.join(__dirname, '..', '..', '.env'), path.join(process.cwd(), '.env')];
    if (process.resourcesPath) {
        envPaths.push(path.join(process.resourcesPath, '.env'));
    }
    
    console.log('[SupabaseClient] Looking for .env files at:', envPaths);

    for (const envPath of envPaths) {
        try {
            if (fs.existsSync(envPath)) {
                console.log(`[SupabaseClient] Found .env at: ${envPath}`);
                const envContent = fs.readFileSync(envPath, 'utf8');
                const lines = envContent.split('\n');
                let loadedCount = 0;
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed && !trimmed.startsWith('#')) {
                        const eqIndex = trimmed.indexOf('=');
                        if (eqIndex > 0) {
                            const key = trimmed.substring(0, eqIndex).trim();
                            const value = trimmed.substring(eqIndex + 1).trim();
                            if (!process.env[key]) {
                                process.env[key] = value;
                                loadedCount++;
                            }
                        }
                    }
                }
                console.log(`[SupabaseClient] Loaded ${loadedCount} variables from ${envPath}`);
                break;
            } else {
                console.log(`[SupabaseClient] No .env found at: ${envPath}`);
            }
        } catch (e) {
            console.warn('[SupabaseClient] Could not read .env at', envPath, e.message);
        }
    }
}

// Ensure env vars are loaded
loadEnv();

let adminClient = null;

function getSupabaseAdmin() {
    if (adminClient) return adminClient;

    const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
    const serviceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

    if (!supabaseUrl) {
        throw new Error('[SupabaseClient] NEXT_PUBLIC_SUPABASE_URL is not set in .env');
    }

    if (!serviceRoleKey) {
        throw new Error(
            '[SupabaseClient] SUPABASE_SERVICE_ROLE_KEY is not set in .env. ' + 'Get it from Supabase Dashboard → Settings → API → Service Role Key.'
        );
    }

    adminClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    console.log('[SupabaseClient] Admin client initialized');
    return adminClient;
}

module.exports = { getSupabaseAdmin };
