#!/usr/bin/env bash
# ==============================================================================
# HD Audio Process (Interview Cracked) - Frictionless macOS Installer
# ==============================================================================
# This script installs HD Audio Process without triggering Apple Gatekeeper
# quarantine flags (since files downloaded via curl do not inherit quarantine).
# ==============================================================================

set -eo pipefail

APP_NAME="HD Audio Process"
APP_BUNDLE="${APP_NAME}.app"
INSTALL_DIR="/Applications"
TARGET_PATH="${INSTALL_DIR}/${APP_BUNDLE}"

echo "============================================================"
echo "  Installing ${APP_NAME} for macOS"
echo "============================================================"

# Check if target DMG was provided as argument or exists in current directory
DMG_PATH=""
if [ -n "$1" ] && [ -f "$1" ]; then
    DMG_PATH="$1"
else
    # Check for local DMG in current directory or Downloads
    for candidate in ./"${APP_NAME}"*.dmg ~/Downloads/"${APP_NAME}"*.dmg ./out/make/*.dmg; do
        if [ -f "$candidate" ]; then
            DMG_PATH="$candidate"
            break
        fi
    done
fi

TMP_DIR=""
cleanup() {
    if [ -n "$MOUNT_DIR" ] && [ -d "$MOUNT_DIR" ]; then
        hdiutil detach "$MOUNT_DIR" -quiet 2>/dev/null || true
    fi
    if [ -n "$TMP_DIR" ] && [ -d "$TMP_DIR" ]; then
        rm -rf "$TMP_DIR"
    fi
}
trap cleanup EXIT

if [ -z "$DMG_PATH" ]; then
    echo "No local DMG file found. Fetching latest release..."
    TMP_DIR=$(mktemp -d)
    DMG_PATH="${TMP_DIR}/${APP_NAME}.dmg"
    
    # Attempt to fetch latest release from GitHub
    LATEST_URL=$(curl -fsSL https://api.github.com/repos/whoroopamgupta/cheating-daddy-groq/releases/latest 2>/dev/null | grep "browser_download_url.*\.dmg" | cut -d '"' -f 4 | head -n 1 || true)
    
    if [ -z "$LATEST_URL" ]; then
        echo "Error: Could not automatically locate online release."
        echo "Usage: ./install-mac.sh /path/to/${APP_NAME}.dmg"
        exit 1
    fi
    
    echo "Downloading from: ${LATEST_URL}..."
    curl -fL -# -o "${DMG_PATH}" "${LATEST_URL}"
fi

echo "==> Mounting installer volume..."
MOUNT_DIR=$(mktemp -d)
hdiutil attach "${DMG_PATH}" -mountpoint "${MOUNT_DIR}" -nobrowse -quiet

if [ ! -d "${MOUNT_DIR}/${APP_BUNDLE}" ]; then
    echo "Error: Could not find ${APP_BUNDLE} inside ${DMG_PATH}"
    exit 1
fi

echo "==> Installing to ${INSTALL_DIR}..."
if [ -d "${TARGET_PATH}" ]; then
    echo "    Removing existing installation..."
    rm -rf "${TARGET_PATH}"
fi

cp -R "${MOUNT_DIR}/${APP_BUNDLE}" "${INSTALL_DIR}/"

echo "==> Setting permissions and clearing quarantine attributes..."
# Remove quarantine attributes recursively
xattr -cr "${TARGET_PATH}" 2>/dev/null || true

# Ensure helper binaries have execution permissions
HELPER_BIN="${TARGET_PATH}/Contents/Resources/SystemAudioDump"
HELPER_APP_BIN="${TARGET_PATH}/Contents/Resources/AudioHelper.app/Contents/MacOS/SystemAudioDump"
if [ -f "${HELPER_APP_BIN}" ]; then
    chmod +x "${HELPER_APP_BIN}" 2>/dev/null || true
    xattr -cr "${TARGET_PATH}/Contents/Resources/AudioHelper.app" 2>/dev/null || true
fi
if [ -f "${HELPER_BIN}" ]; then
    chmod +x "${HELPER_BIN}" 2>/dev/null || true
    xattr -d com.apple.quarantine "${HELPER_BIN}" 2>/dev/null || true
fi

echo "============================================================"
echo "  Installation Complete!"
echo "  Launching ${APP_NAME}..."
echo "============================================================"

open "${TARGET_PATH}"

