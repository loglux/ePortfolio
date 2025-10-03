// Utilities
const $ = (q, root=document) => root.querySelector(q);
const toast = (msg, cls='text-bg-dark') => { const t = $('#toast'); t.className = `toast align-items-center border-0 ${cls}`; t.querySelector('.toast-body').textContent = msg; bootstrap.Toast.getOrCreateInstance(t).show(); };
const themeKey = 'studyhub-theme';
const applyTheme = (val) => { document.documentElement.setAttribute('data-bs-theme', val); localStorage.setItem(themeKey, val); $('#btnTheme')?.setAttribute('aria-pressed', val==='dark'); };
const initTheme = () => { const saved = localStorage.getItem(themeKey) || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark':'light'); applyTheme(saved); };

let watchId = null;

function show(pos){
    const { latitude, longitude, accuracy, altitude, speed, heading } = pos.coords;
    $('#status').textContent = 'OK';
    $('#lat').textContent = latitude.toFixed(6);
    $('#lng').textContent = longitude.toFixed(6);
    $('#acc').textContent = accuracy != null ? accuracy.toFixed(1) : '—';
    $('#alt').textContent = altitude != null ? altitude.toFixed(1) : '—';
    $('#spd').textContent = speed != null ? speed.toFixed(2) : '—';
    $('#hdg').textContent = heading != null ? heading.toFixed(0) : '—';
    $('#ts').textContent = new Date(pos.timestamp).toLocaleString();
    updateMap(latitude, longitude);
}

function fail(err){
    $('#status').textContent = 'Error';
    toast(err.message || 'Geolocation error', 'text-bg-danger');
}

function updateMap(lat, lng){
    // Simple static map using OpenStreetMap tile server snapshot (no key). We'll stitch one tile as preview.
    const z = 13; // zoom
    // Convert lat/lng to tile numbers
    const xtile = Math.floor((lng + 180) / 360 * Math.pow(2, z));
    const ytile = Math.floor((1 - Math.log(Math.tan(lat * Math.PI/180) + 1/Math.cos(lat * Math.PI/180)) / Math.PI) / 2 * Math.pow(2, z));
    const src = `https://tile.openstreetmap.org/${z}/${xtile}/${ytile}.png`;
    const img = $('#mapImg'); img.src = src; img.alt = `Map tile near ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

function init(){
    initTheme();
    $('#btnTheme')?.addEventListener('click', ()=>{ const cur = document.documentElement.getAttribute('data-bs-theme') || 'light'; applyTheme(cur==='light' ? 'dark' : 'light'); });

    if (!('geolocation' in navigator)) { toast('Geolocation is not supported', 'text-bg-danger'); return; }

    $('#btnLocate').addEventListener('click', ()=>{
        $('#status').textContent = 'Locating…';
        navigator.geolocation.getCurrentPosition(show, fail, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
    });

    $('#btnWatch').addEventListener('click', ()=>{
        if (watchId != null) return;
        $('#status').textContent = 'Watching…';
        watchId = navigator.geolocation.watchPosition(show, fail, { enableHighAccuracy: true, maximumAge: 1000 });
        $('#btnStopWatch').disabled = false;
    });

    $('#btnStopWatch').addEventListener('click', ()=>{
        if (watchId != null) navigator.geolocation.clearWatch(watchId);
        watchId = null; $('#status').textContent = 'Idle'; $('#btnStopWatch').disabled = true;
    });
}

document.addEventListener('DOMContentLoaded', init);