// Web Worker for precise ticker every 1000 ms
let timer = null;
let startTs = 0;
let remain = 0; // ms

self.onmessage = (e) => {
    const { cmd, payload } = e.data || {};
    if (cmd === 'start') {
        const { durationMs } = payload; // stage duration
        clearInterval(timer);
        startTs = Date.now();
        remain = durationMs;
        timer = setInterval(() => {
            const elapsed = Date.now() - startTs;
            const left = Math.max(0, remain - elapsed);
            self.postMessage({ type: 'tick', left });
            if (left <= 0) {
                clearInterval(timer);
                self.postMessage({ type: 'done' });
            }
        }, 250); // more frequent than 1s for smoothness
    }
    if (cmd === 'pause') {
        clearInterval(timer);
        // fix remaining time
        remain = payload.left;
    }
    if (cmd === 'resume') {
        clearInterval(timer);
        startTs = Date.now();
        const leftAtResume = payload.left;
        timer = setInterval(() => {
            const elapsed = Date.now() - startTs;
            const left = Math.max(0, leftAtResume - elapsed);
            self.postMessage({ type: 'tick', left });
            if (left <= 0) {
                clearInterval(timer);
                self.postMessage({ type: 'done' });
            }
        }, 250);
    }
    if (cmd === 'stop') {
        clearInterval(timer);
    }
};