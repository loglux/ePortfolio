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

// ======= Regex and validators =======
const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/; // basic check
const reDigit = /\d/; const reUpper = /[A-Z]/; const reLower = /[a-z]/;

function passwordScore(pwd) {
    let s = 0; if (pwd.length >= 8) s++; if (reDigit.test(pwd)) s++; if (reUpper.test(pwd)) s++; if (reLower.test(pwd)) s++; return s; // 0..4
}

function setPwdMeter(score) {
    const bar = $('#pwdBar');
    const widths = ['0%','25%','50%','75%','100%'];
    const classes = ['bg-secondary','bg-danger','bg-warning','bg-info','bg-success'];
    bar.className = `progress-bar ${classes[score]}`; bar.style.width = widths[score];
}

function validateEmail(input){ return reEmail.test(input.value.trim()); }
function validateBirth(input){ // at least 16 years old
    if (!input.value) return false; const d = new Date(input.value); const now = new Date(); const min = new Date(now.getFullYear()-16, now.getMonth(), now.getDate()); return d <= min; }
function validatePhone(input){ return new RegExp(input.pattern).test(input.value.trim()); }
function validateURL(input){ if (!input.value) return true; return /^https?:\/\/.+/.test(input.value.trim()); }

// ======= Draft (sessionStorage) =======
const DKEY = 'formDraft';
function saveDraft(form){
    const data = Object.fromEntries(new FormData(form).entries());
    sessionStorage.setItem(DKEY, JSON.stringify(data));
    toast('Draft saved', 'text-bg-primary');
}
function loadDraft(form){
    const raw = sessionStorage.getItem(DKEY); if (!raw) return;
    const data = JSON.parse(raw);
    Object.entries(data).forEach(([k,v])=>{ const el = form.elements[k]; if (!el) return; if (el.type==='checkbox') el.checked = !!v; else el.value = v; });
}
function clearDraft(){ sessionStorage.removeItem(DKEY); toast('Draft cleared', 'text-bg-warning'); }

// ======= Main logic =======
function init(){
    initTheme();
    $('#btnTheme')?.addEventListener('click', ()=>{ const cur = document.documentElement.getAttribute('data-bs-theme') || 'light'; applyTheme(cur==='light' ? 'dark' : 'light'); });

    const form = $('#profileForm');
    loadDraft(form);

    // live validation
    const pw = $('#password'); const cf = $('#confirm'); const birth = $('#birth'); const email = $('#email'); const phone = $('#phone'); const url = $('#portfolio');

    pw.addEventListener('input', ()=> setPwdMeter(passwordScore(pw.value)));
    [email, phone, birth, url, pw, cf, $('#firstName'), $('#lastName')].forEach(el=>{
        el.addEventListener('input', ()=> el.setCustomValidity(''));
    });

    form.addEventListener('submit', (e)=>{
        e.preventDefault();

        // First check HTML5
        form.classList.add('was-validated');
        let ok = form.checkValidity();

        // Additional Regex checks
        if (!validateEmail(email)) { email.setCustomValidity('Invalid email'); ok=false; }
        if (!validateBirth(birth)) { birth.setCustomValidity('Age must be ≥ 16 years'); ok=false; }
        if (!validatePhone(phone)) { phone.setCustomValidity('Invalid phone number'); ok=false; }
        if (!validateURL(url)) { url.setCustomValidity('URL must start with http(s)://'); ok=false; }
        if (passwordScore(pw.value) < 3) { pw.setCustomValidity('Weak password'); ok=false; }
        if (pw.value !== cf.value) { cf.setCustomValidity('Passwords do not match'); ok=false; }

        if (!ok) { toast('Please fix form errors', 'text-bg-danger'); return; }

        // Success: create "profile", show toast
        const data = Object.fromEntries(new FormData(form).entries());
        console.log('Profile saved:', data); // to developer console
        toast('Profile saved', 'text-bg-success');
        clearDraft();
        form.reset(); form.classList.remove('was-validated'); setPwdMeter(0);
    });

    // Draft buttons
    $('#btnSaveDraft').addEventListener('click', ()=> saveDraft(form));
    $('#btnClearDraft').addEventListener('click', ()=> { clearDraft(); form.reset(); form.classList.remove('was-validated'); setPwdMeter(0); });
}

document.addEventListener('DOMContentLoaded', init);