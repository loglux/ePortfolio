// ======= Utilities/UI =======
const $ = (q, root=document) => root.querySelector(q);
const toast = (msg, cls='text-bg-dark') => {
    const t = $('#toast');
    t.className = `toast align-items-center border-0 ${cls}`;
    t.querySelector('.toast-body').textContent = msg;
    bootstrap.Toast.getOrCreateInstance(t).show();
};
const themeKey = 'studyhub-theme';
const applyTheme = (val) => { document.documentElement.setAttribute('data-bs-theme', val); localStorage.setItem(themeKey, val); $('#btnTheme')?.setAttribute('aria-pressed', val==='dark'); };
const initTheme = () => { const saved = localStorage.getItem(themeKey) || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark':'light'); applyTheme(saved); };

// ======= Model =======
const PKEY = 'pomo';
const loadState = () => JSON.parse(localStorage.getItem(PKEY) || '{}');
const saveState = (s) => localStorage.setItem(PKEY, JSON.stringify(s));

// ======= Canvas ring =======
const Ring = (canvas) => {
    const ctx = canvas.getContext('2d');
    const dpi = window.devicePixelRatio || 1;
    const size = 260; // logical px
    // scale for clarity
    canvas.width = size * dpi; canvas.height = size * dpi; canvas.style.width = size+'px'; canvas.style.height = size+'px';
    ctx.scale(dpi, dpi);
    const cx = size/2, cy = size/2, r = 110; // radius

    function draw(progress /*0..1*/, mode='Focus') {
        ctx.clearRect(0,0,size,size);
        // background
        ctx.lineWidth = 18; ctx.lineCap = 'round';
        ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--bs-border-color') || '#e0e0e0';
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.stroke();
        // active arc
        ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--bs-primary') || '#0d6efd';
        const start = -Math.PI/2; const end = start + Math.PI*2*progress;
        ctx.beginPath(); ctx.arc(cx, cy, r, start, end); ctx.stroke();
        // center dot
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bs-body-bg') || '#fff';
        ctx.beginPath(); ctx.arc(cx, cy, r-20, 0, Math.PI*2); ctx.fill();
        // label
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bs-body-color') || '#111';
        ctx.font = '600 16px system-ui, -apple-system, Segoe UI, Roboto, Ubuntu';
        ctx.textAlign = 'center'; ctx.fillText(mode, cx, cy + r/2);
    }
    return { draw };
};

// ======= Pomodoro logic =======
const Modes = { Focus: 'Focus', Short: 'Break', Long: 'Long Break' };

class Pomodoro {
    constructor() {
        this.worker = new Worker('./service/worker.js');
        this.bindWorker();
        this.resetCounters();
        this.left = 0; // ms
        this.running = false;
        this.mode = 'Focus';
    }
    bindWorker() {
        this.worker.onmessage = (e) => {
            const { type, left } = e.data;
            if (type === 'tick') this.onTick(left);
            if (type === 'done') this.onDone();
        };
    }
    config() {
        return {
            focus: parseInt($('#focus').value,10)*60*1000,
            short: parseInt($('#short').value,10)*60*1000,
            long: parseInt($('#long').value,10)*60*1000,
            cycles: parseInt($('#cycles').value,10)
        };
    }
    start() {
        const cfg = this.config();
        const dur = this.mode==='Focus' ? cfg.focus : (this.mode==='Short'? cfg.short : cfg.long);
        this.left = dur;
        this.worker.postMessage({ cmd: 'start', payload: { durationMs: dur } });
        this.running = true; this.updateButtons();
    }
    pause() {
        this.worker.postMessage({ cmd: 'pause', payload: { left: this.left } });
        this.running = false; this.updateButtons();
    }
    resume() {
        this.worker.postMessage({ cmd: 'resume', payload: { left: this.left } });
        this.running = true; this.updateButtons();
    }
    stop() {
        this.worker.postMessage({ cmd: 'stop' });
        this.running = false; this.updateButtons();
    }
    onTick(leftMs) {
        this.left = leftMs;
        renderTime(leftMs);
        const cfg = this.config();
        const full = this.mode==='Focus' ? cfg.focus : (this.mode==='Short'? cfg.short : cfg.long);
        const progress = 1 - (leftMs/full);
        ring.draw(progress, Modes[this.mode] || this.mode);
    }
    onDone() {
        this.running = false; this.updateButtons();
        toast(`${Modes[this.mode]} completed`, 'text-bg-success');
        notify('Pomodoro', `${Modes[this.mode]} completed`);
        this.nextStage();
    }
    nextStage() {
        const cfg = this.config();
        if (this.mode==='Focus') {
            this.completed++;
            if (this.completed % cfg.cycles === 0) this.mode = 'Long'; else this.mode = 'Short';
        } else {
            this.mode = 'Focus';
        }
        $('#mode').textContent = Modes[this.mode];
        saveState({ completed: this.completed, lastMode: this.mode });
        this.start();
    }
    resetCounters() {
        const s = loadState();
        this.completed = s.completed || 0;
        this.mode = s.lastMode || 'Focus';
        $('#mode').textContent = Modes[this.mode];
    }
    updateButtons() {
        $('#btnStart').disabled = this.running;
        $('#btnPause').disabled = !this.running;
        $('#btnReset').disabled = !this.running && this.left===0;
        $('#btnSkip').disabled = this.running;
    }
}

// ======= Helper functions =======
function renderTime(ms) {
    const totalSec = Math.ceil(ms/1000);
    const m = Math.floor(totalSec/60).toString().padStart(2,'0');
    const s = (totalSec%60).toString().padStart(2,'0');
    $('#time').textContent = `${m}:${s}`;
}

function notify(title, body) {
    try {
        if (Notification && Notification.permission === 'granted') new Notification(title, { body });
        else if (Notification && Notification.permission !== 'denied') Notification.requestPermission();
    } catch {}
}

// ======= Initialization =======
let app, ring;
function init() {
    initTheme();
    ring = Ring($('#ring'));
    ring.draw(0, 'Ready');
    app = new Pomodoro();
    app.updateButtons();

    $('#btnTheme').addEventListener('click', ()=>{
        const cur = document.documentElement.getAttribute('data-bs-theme') || 'light';
        applyTheme(cur==='light' ? 'dark' : 'light');
    });

    $('#btnStart').addEventListener('click', ()=> app.start());
    $('#btnPause').addEventListener('click', ()=> app.pause());
    $('#btnReset').addEventListener('click', ()=> { app.stop(); app.left=0; renderTime(app.left); ring.draw(0, Modes[app.mode]); });
    $('#btnSkip').addEventListener('click', ()=> { app.stop(); app.onDone(); });

    // Real-time config validation
    ['focus','short','long','cycles'].forEach(id=>{
        $('#'+id).addEventListener('change', (e)=>{
            e.target.reportValidity();
            saveState({ completed: app.completed, lastMode: app.mode, cfg: app.config() });
        });
    });
}

document.addEventListener('DOMContentLoaded', init);