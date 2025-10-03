// ======= Theme =======
const themeKey = 'studyhub-theme';
const $ = (q, root=document) => root.querySelector(q);
const applyTheme = (val) => { document.documentElement.setAttribute('data-bs-theme', val); localStorage.setItem(themeKey, val); $('#btnTheme')?.setAttribute('aria-pressed', val==='dark'); };
const initTheme = () => { const saved = localStorage.getItem(themeKey) || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark':'light'); applyTheme(saved); };

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    $('#btnTheme')?.addEventListener('click', ()=>{
        const cur = document.documentElement.getAttribute('data-bs-theme') || 'light';
        applyTheme(cur==='light' ? 'dark':'light');
        // Redraw, as colors depend on theme
        drawBasic();
        drawFrame();
    });

    // ====== Demo 1: Basic shapes ======
    const cBasic = $('#cBasic');
    const ctx = cBasic.getContext('2d');
    function drawBasic() {
        const bodyStyles = getComputedStyle(document.body);
        const border = bodyStyles.getPropertyValue('--bs-border-color') || '#e0e0e0';
        const primary = bodyStyles.getPropertyValue('--bs-primary') || '#0d6efd';
        const text = bodyStyles.getPropertyValue('--bs-body-color') || '#111';

        ctx.clearRect(0,0,cBasic.width,cBasic.height);

        // Background grid
        ctx.save();
        ctx.strokeStyle = border; ctx.lineWidth = 1;
        for (let x=0; x<cBasic.width; x+=40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,cBasic.height); ctx.stroke(); }
        for (let y=0; y<cBasic.height; y+=40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(cBasic.width,y); ctx.stroke(); }
        ctx.restore();

        // Rectangle with shadow
        ctx.save();
        ctx.fillStyle = '#fff';
        ctx.shadowColor = 'rgba(0,0,0,.2)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 6;
        ctx.fillRect(40, 40, 200, 100);
        ctx.restore();

        // Line
        ctx.save();
        ctx.strokeStyle = primary; ctx.lineWidth = 4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(60, 180); ctx.lineTo(260, 300); ctx.stroke();
        ctx.restore();

        // Circle/arc
        ctx.save();
        ctx.strokeStyle = primary; ctx.lineWidth = 8;
        ctx.beginPath(); ctx.arc(420, 120, 60, 0, Math.PI * 1.3, false); ctx.stroke();
        ctx.restore();

        // Gradient
        const grad = ctx.createLinearGradient(340, 220, 540, 320);
        grad.addColorStop(0, '#ff7a7a'); grad.addColorStop(1, '#ffd36e');
        ctx.fillStyle = grad; ctx.fillRect(340, 220, 200, 100);

        // Text
        ctx.fillStyle = text; ctx.font = '600 20px system-ui, -apple-system, Segoe UI, Roboto';
        ctx.fillText('Canvas Demo: shapes, lines, arcs, gradient, text', 40, 340);
    }
    drawBasic();
    $('#btnRedrawBasic').addEventListener('click', drawBasic);

    // ====== Demo 2: Ball animation ======
    const cAnim = $('#cAnim');
    const ctxA = cAnim.getContext('2d');
    let rafId = 0; let playing = false;
    const ball = { x: 80, y: 80, vx: 3, vy: 2.5, r: 20 };

    function drawFrame() {
        const bg = getComputedStyle(document.body).getPropertyValue('--bs-body-bg') || '#fff';
        const primary = getComputedStyle(document.body).getPropertyValue('--bs-primary') || '#0d6efd';

        ctxA.clearRect(0,0,cAnim.width,cAnim.height);
        // background
        ctxA.fillStyle = bg; ctxA.fillRect(0,0,cAnim.width,cAnim.height);

        // update
        ball.x += ball.vx; ball.y += ball.vy;
        if (ball.x - ball.r < 0 || ball.x + ball.r > cAnim.width) { ball.vx *= -1; }
        if (ball.y - ball.r < 0 || ball.y + ball.r > cAnim.height) { ball.vy *= -1; }

        // draw shadow
        ctxA.save(); ctxA.shadowColor = 'rgba(0,0,0,.25)'; ctxA.shadowBlur = 16; ctxA.shadowOffsetY = 8;
        // circle
        const grd = ctxA.createRadialGradient(ball.x-8, ball.y-8, 6, ball.x, ball.y, ball.r);
        grd.addColorStop(0, '#ffffff'); grd.addColorStop(1, primary.trim() || '#0d6efd');
        ctxA.fillStyle = grd;
        ctxA.beginPath(); ctxA.arc(ball.x, ball.y, ball.r, 0, Math.PI*2); ctxA.fill();
        ctxA.restore();

        if (playing) rafId = requestAnimationFrame(drawFrame);
    }

    $('#btnPlay').addEventListener('click', ()=>{ if (!playing) { playing = true; drawFrame(); }});
    $('#btnPause').addEventListener('click', ()=>{ playing = false; cancelAnimationFrame(rafId); });
    $('#btnResetBall').addEventListener('click', ()=>{ ball.x=80; ball.y=80; ball.vx=3; ball.vy=2.5; if (!playing) drawFrame(); });
    drawFrame();

    // ====== Demo 3: Mouse drawing ======
    const cDraw = $('#cDraw');
    const ctxD = cDraw.getContext('2d');
    let drawing = false; let last = null;

    function pos(evt){ const rect = cDraw.getBoundingClientRect(); const x = (evt.touches? evt.touches[0].clientX: evt.clientX) - rect.left; const y = (evt.touches? evt.touches[0].clientY: evt.clientY) - rect.top; return {x, y}; }

    function stroke(from, to) {
        ctxD.strokeStyle = $('#color').value; ctxD.lineWidth = parseInt($('#size').value,10);
        ctxD.lineJoin = 'round'; ctxD.lineCap = 'round';
        ctxD.beginPath(); ctxD.moveTo(from.x, from.y); ctxD.lineTo(to.x, to.y); ctxD.stroke();
    }

    cDraw.addEventListener('mousedown', (e)=>{ drawing=true; last = pos(e); });
    cDraw.addEventListener('touchstart', (e)=>{ drawing=true; last = pos(e); });
    window.addEventListener('mouseup', ()=> drawing=false);
    window.addEventListener('touchend', ()=> drawing=false);
    cDraw.addEventListener('mousemove', (e)=>{ if (!drawing) return; const p = pos(e); stroke(last, p); last = p; });
    cDraw.addEventListener('touchmove', (e)=>{ if (!drawing) return; const p = pos(e); stroke(last, p); last = p; });

    $('#btnClear').addEventListener('click', ()=> ctxD.clearRect(0,0,cDraw.width,cDraw.height));
});