const { requiresScreenContext, captureDimensions } = require('../utils/requestPolicy');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

describe('interactive request routing', () => {
    it('opens the managed session before capture can emit audio', () => {
        const source = fs.readFileSync(path.join(__dirname, '../components/app/CheatingDaddyApp.js'), 'utf8');
        const start = source.indexOf('async startSessionInternal()');
        const end = source.indexOf('\n    async startExamGroqAutoCapture', start);
        const sessionSource = source.slice(start, end);
        const managedStart = sessionSource.indexOf("invoke('managed-start'");
        const captureStart = sessionSource.indexOf('cheddar.startCapture(');
        expect(managedStart).toBeGreaterThanOrEqual(0);
        expect(captureStart).toBeGreaterThanOrEqual(0);
        expect(managedStart).toBeLessThan(captureStart);
    });

    it('sends a plain typed question without requiring capture permission or uploading a screenshot', async () => {
        const source = fs.readFileSync(path.join(__dirname, '../utils/renderer.js'), 'utf8');
        const start = source.indexOf('async function sendTextMessage(text)');
        const end = source.indexOf('\n//', start);
        const invoke = vi.fn(async () => ({ success: true }));
        const context = vm.createContext({
            requiresScreenContext,
            localStorage: { getItem: () => 'interview' },
            cheddar: { setStatus: vi.fn() },
            ipcRenderer: { invoke },
            console,
        });
        vm.runInContext(source.slice(start, end), context);
        await context.sendTextMessage('Explain the difference between a process and a thread');
        expect(invoke).toHaveBeenCalledWith('groq-generate-response', {
            message: 'Explain the difference between a process and a thread',
            imageBase64: null,
        });
    });
    it('retains explicit screen requests', () => {
        expect(requiresScreenContext('Explain what is on my screen')).toBe(true);
        expect(requiresScreenContext('Solve this question')).toBe(true);
        expect(requiresScreenContext('What is SQL?')).toBe(false);
    });
    it('bounds Retina/4K uploads without stretching or upscaling', () => {
        expect(captureDimensions(3840, 2160, 'medium')).toEqual({ width: 1920, height: 1080 });
        expect(captureDimensions(3840, 2160, 'high')).toEqual({ width: 2560, height: 1440 });
        expect(captureDimensions(1280, 720, 'medium')).toEqual({ width: 1280, height: 720 });
    });
});
