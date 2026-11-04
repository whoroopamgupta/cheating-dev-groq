const fs = require('fs');
const path = require('path');

const makeDirectory = path.resolve(process.cwd(), 'out', 'make');
const expectedExtensions = {
    win32: ['.exe', '.nupkg'],
    darwin: ['.dmg'],
    linux: ['.AppImage'],
};

function listFiles(directory) {
    if (!fs.existsSync(directory)) return [];

    return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
        const entryPath = path.join(directory, entry.name);
        return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
    });
}

const files = listFiles(makeDirectory);
const allowedExtensions = expectedExtensions[process.platform] || [];
const installers = files.filter(filePath => allowedExtensions.some(extension => filePath.endsWith(extension)));

if (installers.length === 0) {
    const discovered = files.length > 0 ? `\nFiles found:\n${files.map(filePath => `- ${path.relative(process.cwd(), filePath)}`).join('\n')}` : '';
    console.error(
        `Electron Forge did not create a ${process.platform} installer in ${path.relative(process.cwd(), makeDirectory)}.${discovered}`
    );
    process.exit(1);
}

console.log('Verified build artifacts:');
for (const installer of installers) {
    console.log(`- ${path.relative(process.cwd(), installer)}`);
}
