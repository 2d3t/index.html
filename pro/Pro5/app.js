// ============ УПРАВЛЕНИЕ ЗАМЕТКАМИ ============
let notes = [];

function load() {
    try {
        notes = JSON.parse(localStorage.getItem('n') || '[]');
    } catch(e) {
        notes = [];
    }
    render();
}

function save() {
    localStorage.setItem('n', JSON.stringify(notes));
    render();
}

function add() {
    const input = document.getElementById('noteInput');
    const text = input.value.trim();
    if (!text) return alert('Введите текст!');
    notes.push({ id: Date.now(), text });
    input.value = '';
    save();
}

function del(id) {
    notes = notes.filter(n => n.id !== id);
    save();
}

function clearAll() {
    if (!notes.length) return;
    if (confirm('Удалить всё?')) {
        notes = [];
        save();
    }
}

function render() {
    const el = document.getElementById('notesList');
    if (!notes.length) {
        el.innerHTML = '<div class="empty">📭 Нет заметок</div>';
        return;
    }
    el.innerHTML = notes.map(n => 
        `<div class="note-item">
            <span class="note-text">${n.text.replace(/</g, '&lt;')}</span>
            <button class="delete-btn" onclick="del(${n.id})">✕</button>
        </div>`
    ).join('');
}

// ============ СТАТУС ОНЛАЙН/ОФФЛАЙН ============
function updateStatus() {
    const el = document.getElementById('onlineStatus');
    if (navigator.onLine) {
        el.textContent = '🟢 Онлайн';
        el.className = '';
    } else {
        el.textContent = '🔴 Офлайн';
        el.className = 'offline';
    }
}

// ============ РЕГИСТРАЦИЯ SERVICE WORKER ============
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(() => console.log('[SW] Зарегистрирован'))
        .catch((err) => console.log('[SW] Ошибка:', err));
}

// ============ СОБЫТИЯ ============
document.addEventListener('DOMContentLoaded', () => {
    load();
    updateStatus();
    
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    
    document.getElementById('addBtn').onclick = add;
    document.getElementById('noteInput').onkeypress = (e) => {
        if (e.key === 'Enter') add();
    };
    document.getElementById('clearBtn').onclick = clearAll;
    
    window.addEventListener('beforeunload', save);
});