const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
    packagerConfig: {
        asar: {
            unpack: '**/{onnxruntime-node,@ricky0123}/**/*',
        },
        extraResource: ['./src/assets/AudioHelper.app', './src/assets/SystemAudioDump'],
        name: 'HD Audio Process',
        icon: 'src/assets/logo',
        // Set executable permissions for audio helper binaries on macOS
        afterCopy: [
            (buildPath, electronVersion, platform, arch, callback) => {
                if (platform === 'darwin') {
                    const fs = require('fs');
                    const path = require('path');
                    const binaries = [
                        path.join(buildPath, '../SystemAudioDump'),
                        path.join(buildPath, '../AudioHelper.app/Contents/MacOS/SystemAudioDump'),
                    ];
                    for (const binaryPath of binaries) {
                        try {
                            if (fs.existsSync(binaryPath)) {
                                fs.chmodSync(binaryPath, 0o755); // rwxr-xr-x
                                console.log(` Set execute permissions for ${binaryPath} in afterCopy`);
                            }
                        } catch (error) {
                            console.warn(` Failed to set permissions for ${binaryPath} in afterCopy:`, error.message);
                        }
                    }
                }
                callback();
            },
        ],
        afterComplete: [
            (buildPath, electronVersion, platform, arch, callback) => {
                if (platform === 'darwin') {
                    const fs = require('fs');
                    const path = require('path');
                    const { execSync } = require('child_process');
                    const possiblePaths = [
                        path.join(buildPath, 'HD Audio Process.app/Contents/Resources/SystemAudioDump'),
                        path.join(buildPath, 'HD Audio Process.app/Contents/Resources/AudioHelper.app/Contents/MacOS/SystemAudioDump'),
                        path.join(buildPath, 'Contents/Resources/SystemAudioDump'),
                        path.join(buildPath, 'Contents/Resources/AudioHelper.app/Contents/MacOS/SystemAudioDump'),
                    ];
                    for (const p of possiblePaths) {
                        if (fs.existsSync(p)) {
                            try {
                                fs.chmodSync(p, 0o755);
                                console.log(` Set execute permissions for SystemAudioDump in afterComplete at ${p}`);
                            } catch (e) {
                                console.warn(` Could not chmod ${p}:`, e.message);
                            }
                        }
                    }

                    // Reseal the entire application bundle with deep ad-hoc signature
                    const possibleAppBundles = [path.join(buildPath, 'HD Audio Process.app'), path.join(buildPath, '../HD Audio Process.app')];
                    for (const appPath of possibleAppBundles) {
                        if (fs.existsSync(appPath)) {
                            try {
                                execSync(`codesign --force --deep --sign - "${appPath}"`);
                                console.log(` Successfully resealed app bundle with ad-hoc signature: ${appPath}`);
                            } catch (signErr) {
                                console.warn(` Ad-hoc signing in afterComplete failed:`, signErr.message);
                            }
                        }
                    }
                }
                callback();
            },
        ],
        // Ad-hoc code signing for macOS (no Apple Developer account required)
        // This seals the modified Electron fuses and resources so Gatekeeper
        // does not flag the app as "damaged", allowing clean opening via GUI.
        osxSign: {
            identity: '-',
            optionsForFile: filePath => {
                return {
                    entitlements: 'entitlements.plist',
                };
            },
        },
        // notarize if off cuz i ran this for 6 hours and it still didnt finish
        // osxNotarize: {
        //    appleId: 'your apple id',
        //    appleIdPassword: 'app specific password',
        //    teamId: 'your team id',
        // },
    },
    rebuildConfig: {},
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            config: {
                name: 'hd-audio-process',
                productName: 'HD Audio Process',
                shortcutName: 'HD Audio Process',
                createDesktopShortcut: false,
                createStartMenuShortcut: true,
            },
        },
        {
            name: '@electron-forge/maker-dmg',
            platforms: ['darwin'],
        },
        {
            name: '@reforged/maker-appimage',
            platforms: ['linux'],
            config: {
                options: {
                    name: 'HD Audio Process',
                    productName: 'HD Audio Process',
                    genericName: 'AI Assistant',
                    description: 'AI assistant for interviews and learning',
                    categories: ['Development', 'Education'],
                    icon: 'src/assets/logo.png',
                    desktopIntegration: false, // Prevent automatic desktop shortcut creation
                },
            },
        },
    ],
    plugins: [
        {
            name: '@electron-forge/plugin-auto-unpack-natives',
            config: {},
        },
        // Fuses are used to enable/disable various Electron functionality
        // at package time, before code signing the application
        new FusesPlugin({
            version: FuseVersion.V1,
            [FuseV1Options.RunAsNode]: false,
            [FuseV1Options.EnableCookieEncryption]: false,
            [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
            [FuseV1Options.EnableNodeCliInspectArguments]: false,
            [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
            [FuseV1Options.OnlyLoadAppFromAsar]: true,
        }),
    ],
};
