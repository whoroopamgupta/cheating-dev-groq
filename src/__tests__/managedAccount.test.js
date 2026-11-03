import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
function harness() {
    const handlers = {}, send = vi.fn();
    const context = { module: {exports:{}}, require: () => ({ipcMain:{handle:(name,fn)=>handlers[name]=fn},BrowserWindow:{getAllWindows:()=>[{webContents:{send}}]}}),
        fetch:vi.fn(), AbortSignal, setInterval,clearInterval,setTimeout,clearTimeout };
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
        h.fetch.mockResolvedValueOnce(response({session_id:'session',lease_seconds:30,remaining_seconds:900}));
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
        await h.handlers['managed-auth']({}, {access_token:'token'});
        h.fetch.mockResolvedValueOnce(response({lease_seconds:0}));
        await expect(h.handlers['managed-start']({},'interview')).rejects.toThrow('used up');
        expect(()=>h.api.proxyOptions()).toThrow();
    });
});
