import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
function harness() {
    const handlers = {}, send = vi.fn();
    const context = { module: {exports:{}}, require: () => ({ipcMain:{handle:(name,fn)=>handlers[name]=fn},BrowserWindow:{getAllWindows:()=>[{webContents:{send}}]}}),
        fetch:vi.fn(), Date, AbortSignal, setInterval,clearInterval,setTimeout,clearTimeout };
    vm.runInNewContext(readFileSync(new URL('../utils/managedAccount.js', import.meta.url),'utf8'),context);
    context.module.exports.setup();
    return {handlers,send,fetch:context.fetch,api:context.module.exports};
}
const response = data => ({ok:true,status:200,json:async()=>data});
afterEach(()=>vi.useRealTimers());
describe('managed account leases',()=>{
    it('rejects shared-key requests outside an active session',()=>{
        const h=harness(); expect(()=>h.api.proxyOptions()).toThrow('Start an interview');
    });
    it('stops access if the server refuses renewal',async()=>{
        vi.useFakeTimers();const h=harness();
        h.fetch.mockResolvedValueOnce(response({user:{}}));
        await h.handlers['managed-auth']({}, {access_token:'token',refresh_token:'refresh'});
        h.fetch.mockResolvedValueOnce(response({session_id:'session',lease_seconds:30,remaining_seconds:600}));
        await h.handlers['managed-start']({},'interview');
        expect(h.api.proxyOptions().headers['X-Session-Id']).toBe('session');
        h.fetch.mockResolvedValueOnce({ok:false,status:503,json:async()=>({error:'Unavailable'})});
        h.fetch.mockResolvedValueOnce(response({stopped:true}));
        await vi.advanceTimersByTimeAsync(10000);
        expect(()=>h.api.proxyOptions()).toThrow();
        expect(h.send).toHaveBeenCalledWith('managed-session-ended','Unavailable');
    });
    it('rejects exhausted quota before configuring a proxy',async()=>{
        const h=harness();h.fetch.mockResolvedValueOnce(response({user:{}}));
        await h.handlers['managed-auth']({}, {access_token:'token',refresh_token:'refresh'});
        h.fetch.mockResolvedValueOnce(response({lease_seconds:0}));
        await expect(h.handlers['managed-start']({},'interview')).rejects.toThrow('used up');
        expect(()=>h.api.proxyOptions()).toThrow();
    });
});

const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return {promise,resolve}; };
const login = async h => {
    h.fetch.mockResolvedValueOnce(response({user:{}}));
    await h.handlers['managed-auth']({}, {access_token:'token',refresh_token:'refresh'});
};
const lease = id => ({session_id:id,lease_seconds:30,remaining_seconds:600,plan:'trial'});
describe('managed session lifecycle races',()=>{
    it('does not let a late renewal replace a restarted session',async()=>{
        vi.useFakeTimers(); const h=harness(); await login(h);
        h.fetch.mockResolvedValueOnce(response(lease('old')));
        await h.handlers['managed-start']({},'interview');
        const delayed=deferred(); h.fetch.mockReturnValueOnce(delayed.promise);
        await vi.advanceTimersByTimeAsync(10000);
        h.fetch.mockResolvedValueOnce(response({stopped:true})); await h.api.stop();
        h.fetch.mockResolvedValueOnce(response(lease('new'))); await h.handlers['managed-start']({},'interview');
        delayed.resolve(response(lease('old'))); await vi.advanceTimersByTimeAsync(0);
        expect(h.api.proxyOptions().headers['X-Session-Id']).toBe('new');
    });
    it('ignores an old renewal failure after restarting',async()=>{
        vi.useFakeTimers(); const h=harness(); await login(h);
        h.fetch.mockResolvedValueOnce(response(lease('old'))); await h.handlers['managed-start']({},'interview');
        const delayed=deferred(); h.fetch.mockReturnValueOnce(delayed.promise); await vi.advanceTimersByTimeAsync(10000);
        h.fetch.mockResolvedValueOnce(response({stopped:true})); await h.api.stop();
        h.fetch.mockResolvedValueOnce(response(lease('new'))); await h.handlers['managed-start']({},'interview');
        delayed.resolve({ok:false,status:503,json:async()=>({error:'old failure'})}); await vi.advanceTimersByTimeAsync(0);
        expect(h.api.proxyOptions().headers['X-Session-Id']).toBe('new');
        expect(h.send).not.toHaveBeenCalledWith('managed-session-ended','old failure');
    });
    it('cancels and releases a delayed start when the user stops',async()=>{
        const h=harness(); await login(h); const delayed=deferred(); h.fetch.mockReturnValueOnce(delayed.promise);
        const starting=h.handlers['managed-start']({},'interview');
        const rejection=expect(starting).rejects.toThrow('cancelled');
        await h.api.stop(); h.fetch.mockResolvedValueOnce(response({stopped:true})); delayed.resolve(response(lease('old')));
        await rejection; expect(()=>h.api.proxyOptions()).toThrow();
        expect(JSON.parse(h.fetch.mock.calls.at(-1)[1].body)).toEqual({action:'stop',sessionId:'old'});
    });
    it('subtracts network latency from the local deadline',async()=>{
        vi.useFakeTimers(); const h=harness(); await login(h); const delayed=deferred(); h.fetch.mockReturnValueOnce(delayed.promise);
        const starting=h.handlers['managed-start']({},'interview'); await vi.advanceTimersByTimeAsync(5000);
        delayed.resolve(response(lease('slow'))); await starting;
        h.fetch.mockReturnValue(new Promise(()=>{})); await vi.advanceTimersByTimeAsync(25000);
        expect(()=>h.api.proxyOptions()).toThrow();
    });
    it('rejects simultaneous starts and unsupported profiles',async()=>{
        const h=harness(); await login(h);
        await expect(h.handlers['managed-start']({},'exam')).rejects.toThrow('Interview');
        const delayed=deferred(); h.fetch.mockReturnValueOnce(delayed.promise); const starting=h.handlers['managed-start']({},'interview');
        const rejection=expect(starting).rejects.toThrow('cancelled');
        await expect(h.handlers['managed-start']({},'interview')).rejects.toThrow('already active');
        await h.api.stop(); h.fetch.mockResolvedValueOnce(response({stopped:true})); delayed.resolve(response(lease('old'))); await rejection;
    });
});
