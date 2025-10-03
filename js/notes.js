// ======= Utilities =======
const $ = (q,root=document) => root.querySelector(q);
const $$ = (q,root=document) => Array.from(root.querySelectorAll(q));
const fmtDate = (d) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(d);
const toast = (msg, cls='text-bg-dark') => {
    const t = $('#toast');
    t.className = `toast align-items-center border-0 ${cls}`;
    t.querySelector('.toast-body').textContent = msg;
    bootstrap.Toast.getOrCreateInstance(t).show();
};

// ======= Theme (light/dark) =======
const themeKey = 'studyhub-theme';
const applyTheme = (val) => {
    document.documentElement.setAttribute('data-bs-theme', val);
    localStorage.setItem(themeKey, val);
    $('#btnTheme').setAttribute('aria-pressed', val === 'dark');
};
const initTheme = () => {
    const saved = localStorage.getItem(themeKey) || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark':'light');
    applyTheme(saved);
};

// ======= Notes storage =======
const LS_KEY = 'notes';
const loadNotes = () => JSON.parse(localStorage.getItem(LS_KEY) || '[]');
const saveNotes = (arr) => localStorage.setItem(LS_KEY, JSON.stringify(arr));

// ======= State =======
let notes = [];

// ======= Render =======
function renderNotes() {
    const list = $('#notesList');
    list.setAttribute('aria-busy','true');
    list.innerHTML = '';

    let q = $('#search').value.trim().toLowerCase();
    let sort = $('#sort').value;

    let filtered = notes.filter(n => !q || n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q));

    filtered.sort((a,b)=>{
        if (sort === 'title') return a.title.localeCompare(b.title, 'en');
        if (sort === 'oldest') return a.updatedAt - b.updatedAt;
        return b.updatedAt - a.updatedAt; // newest
    });

    $('#emptyState').classList.toggle('d-none', filtered.length !== 0);

    const tpl = $('#noteTpl').content;
    filtered.forEach(n => {
        const node = tpl.cloneNode(true);
        $('.note-title', node).textContent = n.title;
        $('.note-body', node).textContent = n.body;
        $('.note-date', node).textContent = fmtDate(new Date(n.updatedAt));
        $('.btn-edit', node).addEventListener('click', () => startEdit(n.id));
        $('.btn-del', node).addEventListener('click', () => delNote(n.id));
        list.appendChild(node);
    });
    list.removeAttribute('aria-busy');
}

// ======= CRUD =======
function addNote(title, body) {
    const now = Date.now();
    const note = { id: crypto.randomUUID(), title, body, createdAt: now, updatedAt: now };
    notes.push(note);
    saveNotes(notes);
    renderNotes();
    toast('Note saved', 'text-bg-success');
}

function startEdit(id) {
    const n = notes.find(x => x.id === id);
    if (!n) return;
    $('#noteId').value = n.id;
    $('#noteTitle').value = n.title;
    $('#noteBody').value = n.body;
    $('#btnSave').textContent = 'Update';
    $('#noteTitle').focus();
}

function updateNote(id, title, body) {
    const idx = notes.findIndex(x => x.id === id);
    if (idx === -1) return;
    notes[idx] = { ...notes[idx], title, body, updatedAt: Date.now() };
    saveNotes(notes);
    renderNotes();
    toast('Note updated', 'text-bg-primary');
}

function delNote(id) {
    if (!confirm('Delete this note?')) return;
    notes = notes.filter(n => n.id !== id);
    saveNotes(notes);
    renderNotes();
    toast('Note deleted', 'text-bg-warning');
}

function clearAll() {
    if (!confirm('Clear all notes?')) return;
    notes = [];
    saveNotes(notes);
    renderNotes();
    toast('All notes cleared', 'text-bg-danger');
}

// ======= Form validation =======
function validate(form) {
    form.classList.add('was-validated');
    return form.checkValidity();
}

// ======= Export JSON =======
function exportJSON() {
    const blob = new Blob([JSON.stringify(notes, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'notes.json'; a.click();
    URL.revokeObjectURL(url);
}

// ======= Initialization =======
function init() {
    initTheme();
    notes = loadNotes();
    renderNotes();

    // Search/sort
    $('#search').addEventListener('input', renderNotes);
    $('#sort').addEventListener('change', renderNotes);

    // Buttons
    $('#btnClearAll').addEventListener('click', clearAll);
    $('#btnExport').addEventListener('click', exportJSON);
    $('#btnTheme').addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-bs-theme') || 'light';
        applyTheme(cur === 'light' ? 'dark' : 'light');
    });

    // Form handling
    const form = $('#noteForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validate(form)) return;
        const id = $('#noteId').value;
        const title = $('#noteTitle').value.trim();
        const body = $('#noteBody').value.trim();
        if (id) updateNote(id, title, body); else addNote(title, body);
        form.reset();
        form.classList.remove('was-validated');
        $('#noteId').value = '';
        $('#btnSave').textContent = 'Save';
    });

    $('#btnReset').addEventListener('click', () => {
        $('#noteId').value = '';
        $('#btnSave').textContent = 'Save';
        $('#noteForm').classList.remove('was-validated');
    });
}

document.addEventListener('DOMContentLoaded', init);