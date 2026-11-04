const { EventEmitter } = require('events');
const https = require('https');
const electronPath = require.resolve('electron');
const events = [];
require.cache[electronPath] = {
    exports: { BrowserWindow: { getAllWindows: () => [{ webContents: { send: (...args) => events.push(args) } }] }, ipcMain: { handle() {} } },
};
const groq = require('../utils/groq');

describe('speech response latency', () => {
    let requests;
    beforeEach(() => {
        vi.useFakeTimers();
        requests = [];
        events.length = 0;
        vi.spyOn(https, 'request').mockImplementation((_options, callback) => {
            const req = new EventEmitter();
            req.write = vi.fn();
            req.end = vi.fn();
            req.setTimeout = vi.fn();
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
    it('sends a committed VAD utterance immediately, without a second silence wait', async () => {
        speech(0.6);
        const pending = groq.flushAudioBuffer();
        expect(requests).toHaveLength(1);
        requests[0]();
        await pending;
    });
    it('keeps a second VAD commit while transcription is busy without overlapping requests', async () => {
        speech(0.6);
        const first = groq.flushAudioBuffer();
        speech(0.6);
        await groq.flushAudioBuffer();
        expect(requests).toHaveLength(1);
        requests[0]();
        await first;
        expect(requests).toHaveLength(2);
        requests[1]();
        await vi.advanceTimersByTimeAsync(0);
    });
    it('uses low effort on the selected text model and displays content before the stream ends', async () => {
        groq.setLlamaConfig('interview', 'Answer concisely.', 'gpt-oss-120b');
        const pending = groq.generateWithLlama('What is SQL?');
        const req = https.request.mock.results[0].value;
        const body = JSON.parse(req.write.mock.calls[0][0]);
        expect(body.model).toBe('openai/gpt-oss-120b');
        expect(body.reasoning_effort).toBe('low');
        const res = new EventEmitter();
        res.statusCode = 200;
        res.setEncoding = vi.fn();
        https.request.mock.calls[0][1](res);
        res.emit('data', 'data: {"choices":[{"delta":{"content":"SQL is "}}]}\n\n');
        expect(events).toContainEqual(['update-response', 'SQL is ']);
        res.emit('data', 'data: {"choices":[{"delta":{"content":"a query language."}}]}\n\ndata: [DONE]\n\n');
        res.emit('end');
        expect(await pending).toBe('SQL is a query language.');
    });
});
