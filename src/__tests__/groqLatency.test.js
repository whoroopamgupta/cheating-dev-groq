const { EventEmitter } = require('events');
const https = require('https');
const electronPath = require.resolve('electron');
require.cache[electronPath] = { exports: { BrowserWindow: { getAllWindows: () => [] }, ipcMain: { handle() {} } } };
const groq = require('../utils/groq');

describe('speech response latency', () => {
    let requests;
    beforeEach(() => {
        vi.useFakeTimers();
        requests = [];
        vi.spyOn(https, 'request').mockImplementation((_options, callback) => {
            const req = new EventEmitter();
            req.write = vi.fn();
            req.end = vi.fn();
            requests.push(() => {
                const res = new EventEmitter();
                res.statusCode = 200;
                callback(res);
                res.emit('data', JSON.stringify({ text: 'What is SQL?' }));
                res.emit('end');
            });
            return req;
        });
        groq.initializeGroq('test-key');
        groq.clearAudioBuffer();
    });
    afterEach(() => {
        groq.clearAudioBuffer();
        vi.restoreAllMocks();
        vi.useRealTimers();
    });
    function speech(seconds) {
        const buffer = Buffer.alloc(seconds * 24000 * 2);
        for (let i = 0; i < buffer.length; i += 2) buffer.writeInt16LE(1000, i);
        groq.addAudioChunk(buffer);
    }
    it('transcribes a short question within one second after speech stops', async () => {
        speech(0.6);
        await vi.advanceTimersByTimeAsync(1000);
        expect(requests).toHaveLength(1);
        requests[0]();
        await vi.advanceTimersByTimeAsync(0);
    });
    it('preserves new speech timing while a previous transcription finishes', async () => {
        speech(0.6);
        await vi.advanceTimersByTimeAsync(1000);
        speech(0.6);
        requests[0]();
        await vi.advanceTimersByTimeAsync(100);
        expect(requests).toHaveLength(1);
        await vi.advanceTimersByTimeAsync(900);
        expect(requests).toHaveLength(2);
        requests[1]();
        await vi.advanceTimersByTimeAsync(0);
    });
});
