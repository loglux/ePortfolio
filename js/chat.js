// Utilities
const $ = (q, root=document) => root.querySelector(q);
const toast = (msg, cls='text-bg-dark') => { const t = $('#toast'); t.className = `toast align-items-center border-0 ${cls}`; t.querySelector('.toast-body').textContent = msg; bootstrap.Toast.getOrCreateInstance(t).show(); };
const themeKey = 'studyhub-theme';
const applyTheme = (val) => { document.documentElement.setAttribute('data-bs-theme', val); localStorage.setItem(themeKey, val); $('#btnTheme')?.setAttribute('aria-pressed', val==='dark'); };
const initTheme = () => { const saved = localStorage.getItem(themeKey) || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark':'light'); applyTheme(saved); };

let ws = null;

function setStatus(txt, cls='text-bg-secondary'){ const el = $('#status'); el.textContent = txt; el.className = `badge ${cls}`; }
function pushMsg(text, who='peer'){ const box = $('#messages'); const div = document.createElement('div'); div.className = `msg ${who}`; div.textContent = text; box.appendChild(div); box.scrollTop = box.scrollHeight; }

function connect(){
    if (ws && (ws.readyState===WebSocket.OPEN || ws.readyState===WebSocket.CONNECTING)) return;
    ws = new WebSocket('wss://echo.websocket.events');
    setStatus('Connecting…', 'text-bg-warning');
    ws.addEventListener('open', ()=>{ setStatus('Connected', 'text-bg-success'); $('#btnDisconnect').disabled=false; toast('WebSocket connected', 'text-bg-primary');});
    ws.addEventListener('message', (ev)=>{ if (typeof ev.data === 'string') pushMsg(ev.data, 'peer'); });
    ws.addEventListener('close', ()=>{ setStatus('Disconnected', 'text-bg-secondary'); $('#btnDisconnect').disabled=true; });
    ws.addEventListener('error', ()=>{ toast('WebSocket error', 'text-bg-danger'); });
}

function disconnect(){ if (ws) { ws.close(); ws = null; } }

function init(){
    initTheme();
    $('#btnTheme')?.addEventListener('click', ()=>{ const cur = document.documentElement.getAttribute('data-bs-theme') || 'light'; applyTheme(cur==='light' ? 'dark' : 'light'); });

    $('#btnConnect').addEventListener('click', connect);
    $('#btnDisconnect').addEventListener('click', disconnect);

    $('#formSend').addEventListener('submit', (e)=>{
        e.preventDefault(); const input = $('#msgText'); const text = input.value.trim(); if (!text) return;
        if (!ws || ws.readyState !== WebSocket.OPEN) { toast('Not connected', 'text-bg-warning'); return; }
        ws.send(text); pushMsg(text, 'me'); input.value=''; input.focus();
    });
}

document.addEventListener('DOMContentLoaded', init);