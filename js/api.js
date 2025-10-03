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

// ======= FETCH demo: Open Library search =======
async function searchBooks(q) {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=10`;
    const resBox = $('#resFetch');
    resBox.innerHTML = spinner();
    try {
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const items = (data.docs || []).map(b => ({
            title: b.title,
            author: (b.author_name && b.author_name[0]) || 'Unknown',
            year: b.first_publish_year || '—'
        }));
        if (items.length === 0) { resBox.innerHTML = empty('No results'); return; }
        resBox.innerHTML = renderBooks(items);
    } catch (err) {
        console.error(err); resBox.innerHTML = errorBox(err);
    }
}

function renderBooks(items){
    const rows = items.map(i => `
    <tr>
      <td>${escapeHtml(i.title)}</td>
      <td>${escapeHtml(i.author)}</td>
      <td>${escapeHtml(String(i.year))}</td>
    </tr>`).join('');
    return `<div class="table-responsive"><table class="table table-sm align-middle mb-0">
    <thead><tr><th>Title</th><th>Author</th><th>Year</th></tr></thead>
    <tbody>${rows}</tbody></table></div>`;
}

// ======= XHR demo: Cat fact =======
function getCatFact() {
    const box = $('#resCat');
    box.innerHTML = spinner();
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://catfact.ninja/fact');
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    box.innerHTML = `<div class="alert alert-secondary mb-0">${escapeHtml(data.fact)} <span class="badge text-bg-light border ms-2">length: ${data.length}</span></div>`;
                } catch (e) {
                    box.innerHTML = errorBox(e);
                }
            } else {
                box.innerHTML = errorBox(new Error(`HTTP ${xhr.status}`));
            }
        }
    };
    xhr.onerror = () => box.innerHTML = errorBox(new Error('Network error'));
    xhr.send();
}

// ======= jQuery demo: Dog image(s) =======
function getDog(n=1) {
    const box = $('#resDog');
    box.innerHTML = spinner();
    const url = n>1 ? `https://dog.ceo/api/breeds/image/random/${n}` : 'https://dog.ceo/api/breeds/image/random';
    $.getJSON(url)
        .done(data => {
            const arr = Array.isArray(data.message) ? data.message : [data.message];
            box.innerHTML = arr.map(src => `<img class="thumb me-2 mb-2" alt="Random dog" src="${src}">`).join('');
        })
        .fail((jq, status, err) => {
            box.innerHTML = errorBox(new Error(status || err || 'Request failed'));
        });
}

// ======= Small helpers =======
function spinner(){ return `<div class="d-flex align-items-center gap-2 text-body-secondary"><div class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div><span>Loading…</span></div>`; }
function empty(msg){ return `<div class="alert alert-warning mb-0">${escapeHtml(msg)}</div>`; }
function errorBox(err){ return `<div class="alert alert-danger mb-0">${escapeHtml(err.message || String(err))}</div>`; }
function escapeHtml(str){ return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[s])); }

// ======= Init =======
function init(){
    // theme
    initTheme();
    $('#btnTheme')?.addEventListener('click', ()=>{
        const cur = document.documentElement.getAttribute('data-bs-theme') || 'light';
        applyTheme(cur==='light' ? 'dark':'light');
    });

    // fetch form
    $('#formFetch').addEventListener('submit', (e)=>{
        e.preventDefault();
        const q = $('#qBooks').value.trim(); if (!q) return; searchBooks(q);
    });

    // XHR button
    $('#btnCat').addEventListener('click', getCatFact);

    // jQuery buttons
    $('#btnDog').addEventListener('click', ()=> getDog(1));
    $('#btnDog5').addEventListener('click', ()=> getDog(5));
}

document.addEventListener('DOMContentLoaded', init);