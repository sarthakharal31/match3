// Component Loading Logic
async function loadComponent(id, url) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        document.getElementById(id).innerHTML = html;
        return true;
    } catch (error) {
        console.error(`Error loading component ${url}:`, error);
        return false;
    }
}

// ─── Matches Data Store & Filter Engine (Dropdown Panel) ─────────────────────
const MATCH_DATA = [
    { name: 'Elena Vance',  role: 'Protocol Architect',    category: 'Developer', avatar: 'https://i.pravatar.cc/150?u=elena',  skills: ['Web3','DAO','Solidity','AI'],  goal: 'Startup',    matchScore: 98, aiReason: 'Shared interest in AI agents and decentralized governance.' },
    { name: 'Marcus Thorne',role: 'Founder @ ZK-Sync',     category: 'Founder',   avatar: 'https://i.pravatar.cc/150?u=marcus', skills: ['ZK-SNARKS','Identity','Web3'], goal: 'Startup',    matchScore: 92, aiReason: 'Same goal: Building privacy-first social platforms.' },
    { name: 'Jordan Chen',  role: 'Rust Developer',         category: 'Developer', avatar: 'https://i.pravatar.cc/150?u=jordan', skills: ['Rust','Wasm','AI'],            goal: 'Networking', matchScore: 88, aiReason: 'Complementary skills: Backend and low-level optimization.' },
    { name: 'Priya Kapoor', role: 'DeFi Strategist',        category: 'Founder',   avatar: 'https://i.pravatar.cc/150?u=priya',  skills: ['DeFi','Web3','Tokenomics'],    goal: 'Networking', matchScore: 85, aiReason: 'Shared interest in decentralized finance and token design.' },
    { name: 'Alex Rivera',  role: 'AI Engineer',            category: 'Developer', avatar: 'https://i.pravatar.cc/150?u=alexr',  skills: ['AI','Rust','LLM'],             goal: 'Startup',    matchScore: 81, aiReason: 'Both focused on AI tooling for Web3 infrastructure.' },
    { name: 'Yuki Tanaka',  role: 'Smart Contract Auditor', category: 'Designer',  avatar: 'https://i.pravatar.cc/150?u=yuki',   skills: ['Solidity','Web3','Security'],  goal: 'Networking', matchScore: 76, aiReason: 'Complementary expertise in security and protocol hardening.' }
];
const SKILL_SUGGESTIONS = ['AI','Web3','Rust','Blockchain','Solidity','LLM','DAO','ZK-SNARKS','DeFi','Wasm','Identity','Tokenomics','Security'];
const dropdownFilter = { skills: new Set(), goals: new Set(), roles: new Set(), sort: 'high' };
let filterPanelOpen = false;

function toggleFilterPanel(forceClose) {
    const panel = document.getElementById('filter-dropdown');
    if (!panel) return;
    filterPanelOpen = (typeof forceClose === 'boolean') ? !forceClose : !filterPanelOpen;
    if (filterPanelOpen) {
        panel.classList.remove('hidden');
        requestAnimationFrame(() => panel.classList.add('filter-panel-visible'));
    } else {
        panel.classList.remove('filter-panel-visible');
        setTimeout(() => panel.classList.add('hidden'), 250);
        hideSkillSuggestions();
    }
}
document.addEventListener('click', e => {
    if (!filterPanelOpen) return;
    const panel = document.getElementById('filter-dropdown');
    const toggle = document.getElementById('filter-panel-toggle');
    if (panel && !panel.contains(e.target) && toggle && !toggle.contains(e.target)) toggleFilterPanel(false);
});

function addSkill(skill) {
    const s = skill.trim(); if (!s || dropdownFilter.skills.has(s)) return;
    dropdownFilter.skills.add(s); renderSkillChips(); applyMatchFilters();
    const inp = document.getElementById('skill-input'); if (inp) inp.value = '';
    hideSkillSuggestions();
}
function removeSkill(skill) { dropdownFilter.skills.delete(skill); renderSkillChips(); applyMatchFilters(); }
function renderSkillChips() {
    const c = document.getElementById('skill-chips'); if (!c) return;
    c.innerHTML = '';
    dropdownFilter.skills.forEach(s => {
        const chip = document.createElement('span');
        chip.className = 'inline-flex items-center gap-1.5 px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-xs font-bold';
        chip.innerHTML = `${s} <button onclick="removeSkill('${s}')" class="hover:text-white transition-colors">×</button>`;
        c.appendChild(chip);
    });
    updateActiveChipsStrip();
}
function showSkillSuggestions(val) {
    const box = document.getElementById('skill-suggestions'); if (!box) return;
    const q = val.trim().toLowerCase();
    if (!q) { hideSkillSuggestions(); return; }
    const filtered = SKILL_SUGGESTIONS.filter(s => s.toLowerCase().includes(q) && !dropdownFilter.skills.has(s));
    if (!filtered.length) { hideSkillSuggestions(); return; }
    box.innerHTML = filtered.map(s => `<button onclick="addSkill('${s}')" class="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-primary/20 hover:text-primary transition-all font-medium">${s}</button>`).join('');
    box.classList.remove('hidden');
}
function hideSkillSuggestions() { const b = document.getElementById('skill-suggestions'); if (b) b.classList.add('hidden'); }
function skillInputKeydown(e) {
    if (e.key === 'Enter' && e.target.value.trim()) { addSkill(e.target.value); e.preventDefault(); }
    if (e.key === 'Escape') hideSkillSuggestions();
}
function applyMatchFilters() {
    const sortRadio = document.querySelector('input[name="match-sort"]:checked');
    dropdownFilter.sort = sortRadio ? sortRadio.value : 'high';
    dropdownFilter.goals.clear();
    document.querySelectorAll('.goal-checkbox:checked').forEach(cb => dropdownFilter.goals.add(cb.value));
    dropdownFilter.roles.clear();
    document.querySelectorAll('.role-checkbox:checked').forEach(cb => dropdownFilter.roles.add(cb.value));
    let results = MATCH_DATA.filter(m => {
        const skillOk = dropdownFilter.skills.size === 0 || [...dropdownFilter.skills].every(s => m.skills.map(x => x.toLowerCase()).includes(s.toLowerCase()));
        const goalOk  = dropdownFilter.goals.size === 0 || dropdownFilter.goals.has(m.goal);
        const roleOk  = dropdownFilter.roles.size === 0 || dropdownFilter.roles.has(m.category);
        return skillOk && goalOk && roleOk;
    });
    results.sort((a, b) => dropdownFilter.sort === 'high' ? b.matchScore - a.matchScore : a.matchScore - b.matchScore);
    updateActiveChipsStrip(); renderMatchCards(results);
}
function updateActiveChipsStrip() {
    const total = dropdownFilter.skills.size + dropdownFilter.goals.size + dropdownFilter.roles.size;
    const badge = document.getElementById('filter-badge');
    if (badge) { badge.textContent = total; badge.classList.toggle('hidden', total === 0); badge.classList.toggle('flex', total > 0); }
    const strip = document.getElementById('active-filter-chips'); if (!strip) return;
    strip.innerHTML = '';
    const makeChip = (label, removeFn) => {
        const c = document.createElement('span');
        c.className = 'inline-flex items-center gap-1 px-3 py-1 bg-primary/15 text-primary border border-primary/25 rounded-full text-xs font-bold';
        c.innerHTML = `${label} <button onclick="${removeFn}" class="hover:text-white transition-colors">×</button>`;
        strip.appendChild(c);
    };
    dropdownFilter.skills.forEach(s => makeChip(s, `removeSkill('${s}')`));
    dropdownFilter.goals.forEach(g => makeChip(`Goal: ${g}`, `removeGoalFilter('${g}')`));
    dropdownFilter.roles.forEach(r => makeChip(`Role: ${r}`, `removeRoleFilter('${r}')`));
}
function removeGoalFilter(g) { dropdownFilter.goals.delete(g); const cb = document.querySelector(`.goal-checkbox[value="${g}"]`); if (cb) cb.checked = false; applyMatchFilters(); }
function removeRoleFilter(r) { dropdownFilter.roles.delete(r); const cb = document.querySelector(`.role-checkbox[value="${r}"]`); if (cb) cb.checked = false; applyMatchFilters(); }
function clearAllMatchFilters() {
    dropdownFilter.skills.clear(); dropdownFilter.goals.clear(); dropdownFilter.roles.clear();
    document.querySelectorAll('.goal-checkbox,.role-checkbox').forEach(cb => cb.checked = false);
    const sortRadio = document.querySelector('input[name="match-sort"][value="high"]'); if (sortRadio) sortRadio.checked = true;
    const inp = document.getElementById('skill-input'); if (inp) inp.value = '';
    renderSkillChips(); applyMatchFilters();
}
function renderMatchCards(matches) {
    const grid = document.getElementById('matches-grid');
    const empty = document.getElementById('matches-empty');
    const count = document.getElementById('matches-result-count');
    if (!grid) return;
    const existing = grid.querySelectorAll('.match-card');
    existing.forEach(c => { c.style.opacity = '0'; c.style.transform = 'translateY(10px)'; });
    setTimeout(() => {
        grid.innerHTML = '';
        if (matches.length === 0) { if (empty) { empty.classList.remove('hidden'); empty.classList.add('flex'); } if (count) count.textContent = ''; return; }
        if (empty) { empty.classList.add('hidden'); empty.classList.remove('flex'); }
        if (count) count.textContent = `${matches.length} match${matches.length !== 1 ? 'es' : ''} found`;
        matches.forEach((m, i) => {
            const card = buildMatchCard(m);
            card.style.opacity = '0'; card.style.transform = 'translateY(20px)';
            card.style.transition = `opacity 0.35s ease ${i * 70}ms, transform 0.35s ease ${i * 70}ms`;
            grid.appendChild(card);
            requestAnimationFrame(() => requestAnimationFrame(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }));
        });
    }, existing.length > 0 ? 180 : 0);
}
function buildMatchCard(m) {
    const div = document.createElement('div');
    div.className = 'match-card glass-panel rounded-[2rem] overflow-hidden group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 flex flex-col';
    const skillTags = m.skills.map(s => `<span class="px-3 py-1 rounded-lg bg-secondary/10 text-secondary text-[10px] font-black uppercase border border-secondary/20">${s}</span>`).join('');
    div.innerHTML = `<div class="p-8"><div class="flex items-start justify-between mb-6"><div class="flex gap-4"><div class="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border-2 border-white/5"><img src="${m.avatar}" alt="${m.name}" class="w-full h-full object-cover"></div><div><h3 class="text-xl font-headline font-bold text-white">${m.name}</h3><p class="text-xs text-primary font-bold uppercase tracking-widest">${m.role}</p></div></div><div class="text-right"><div class="text-2xl font-black text-white">${m.matchScore}%</div><div class="text-[10px] font-bold text-primary uppercase">Match</div></div></div><div class="flex flex-wrap gap-2 mb-6">${skillTags}</div><div class="p-4 bg-white/5 rounded-2xl mb-8 border border-white/5"><p class="text-sm text-on-surface-variant leading-relaxed"><span class="font-bold text-primary">AI Reason:</span> ${m.aiReason}</p></div><div class="mt-auto grid grid-cols-2 gap-3"><button onclick="addConnectionAndNotify('${m.name}')" class="py-3 bg-primary text-on-primary font-bold rounded-xl text-xs btn-interact">Connect</button><button onclick="openProfileModal('${m.name}','${m.role}','${m.matchScore}%')" class="py-3 bg-white/5 text-white border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all btn-interact">View Profile</button><button onclick="handleAction(event,'Profile saved')" class="col-span-2 py-3 bg-transparent text-white/60 border border-white/5 rounded-xl text-xs font-bold hover:text-white transition-all flex items-center justify-center gap-2"><span class="material-symbols-outlined text-sm">bookmark</span> Save for Later</button></div></div>`;
    return div;
}

function addConnectionAndNotify(name) {
    const match = MATCH_DATA.find(m => m.name === name);
    if (match) {
        addConnection(match);
        handleAction(null, 'Connected! View in My Connections');
    }
}
function initMatchesView() { applyMatchFilters(); }
// ─── End Matches Filter Engine ────────────────────────────────────────────────

// ─── Connections Data Store & Management ─────────────────────────────────────
let CONNECTIONS_DATA = [];
let filteredConnections = [];

function addConnection(match) {
    const existingConnection = CONNECTIONS_DATA.find(c => c.name === match.name);
    if (existingConnection) return;
    
    const connection = {
        ...match,
        connectedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        notes: ''
    };
    CONNECTIONS_DATA.push(connection);
    localStorage.setItem('connections', JSON.stringify(CONNECTIONS_DATA));
    renderConnections(CONNECTIONS_DATA);
    updateConnectionCount();
}

function removeConnection(name) {
    CONNECTIONS_DATA = CONNECTIONS_DATA.filter(c => c.name !== name);
    localStorage.setItem('connections', JSON.stringify(CONNECTIONS_DATA));
    renderConnections(filteredConnections);
    updateConnectionCount();
}

function updateConnectionCount() {
    const countEl = document.getElementById('connection-count');
    if (countEl) countEl.textContent = CONNECTIONS_DATA.length;
}

function searchConnections(query) {
    const q = query.trim().toLowerCase();
    if (!q) { filteredConnections = [...CONNECTIONS_DATA]; } 
    else { filteredConnections = CONNECTIONS_DATA.filter(c => c.name.toLowerCase().includes(q)); }
    renderConnections(filteredConnections);
}

function renderConnections(connections) {
    const grid = document.getElementById('connections-grid');
    const empty = document.getElementById('connections-empty');
    const count = document.getElementById('connections-result-count');
    if (!grid) return;
    
    const existing = grid.querySelectorAll('.connection-card');
    existing.forEach(c => { c.style.opacity = '0'; c.style.transform = 'translateY(10px)'; });
    
    setTimeout(() => {
        grid.innerHTML = '';
        if (connections.length === 0) {
            if (empty) { empty.classList.remove('hidden'); empty.classList.add('flex'); }
            if (count) count.textContent = '';
            return;
        }
        if (empty) { empty.classList.add('hidden'); empty.classList.remove('flex'); }
        if (count) count.textContent = `${connections.length} connection${connections.length !== 1 ? 's' : ''}`;
        
        connections.forEach((c, i) => {
            const card = buildConnectionCard(c);
            card.style.opacity = '0'; card.style.transform = 'translateY(20px)';
            card.style.transition = `opacity 0.35s ease ${i * 70}ms, transform 0.35s ease ${i * 70}ms`;
            grid.appendChild(card);
            requestAnimationFrame(() => requestAnimationFrame(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }));
        });
    }, existing.length > 0 ? 180 : 0);
}

function buildConnectionCard(connection) {
    const div = document.createElement('div');
    div.className = 'connection-card glass-panel rounded-2xl overflow-hidden group hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 flex flex-col p-6 border border-white/5';
    
    const skillTags = connection.skills.map(s => `<span class="px-2 py-1 rounded-lg bg-white/5 text-white/70 text-[9px] font-bold uppercase border border-white/10">${s}</span>`).join('');
    
    const notesDisplay = connection.notes ? `<div class="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20"><p class="text-xs text-white/70"><span class="text-primary font-bold">Note:</span> ${connection.notes}</p></div>` : '';
    
    div.innerHTML = `
        <div class="flex items-start justify-between mb-4">
            <div class="flex gap-3">
                <div class="w-12 h-12 rounded-xl overflow-hidden shadow-lg border border-white/5">
                    <img src="${connection.avatar}" alt="${connection.name}" class="w-full h-full object-cover">
                </div>
                <div>
                    <h3 class="text-sm font-headline font-bold text-white">${connection.name}</h3>
                    <p class="text-xs text-white/60 font-semibold">${connection.role}</p>
                </div>
            </div>
            <button onclick="removeConnectionAction('${connection.name}')" class="text-white/40 hover:text-red-400 transition-colors" title="Remove connection">
                <span class="material-symbols-outlined text-lg">close</span>
            </button>
        </div>
        
        <div class="flex flex-wrap gap-1.5 mb-4">${skillTags}</div>
        
        <div class="mb-4 pb-4 border-b border-white/5">
            <p class="text-xs text-white/50">Connected ${connection.connectedDate}</p>
        </div>
        
        ${notesDisplay}
        
        <div class="mt-auto grid grid-cols-3 gap-2 pt-4">
            <button onclick="openProfileModal('${connection.name}','${connection.role}')" class="py-2 bg-white/5 text-white text-xs font-bold rounded-lg hover:bg-white/10 transition-all btn-interact flex items-center justify-center gap-1">
                <span class="material-symbols-outlined text-sm">person</span> Profile
            </button>
            <button onclick="showNoteModal('${connection.name}')" class="py-2 bg-white/5 text-white text-xs font-bold rounded-lg hover:bg-white/10 transition-all btn-interact flex items-center justify-center gap-1">
                <span class="material-symbols-outlined text-sm">note</span> Note
            </button>
            <button onclick="sendMessage('${connection.name}')" class="py-2 bg-white/5 text-white text-xs font-bold rounded-lg hover:bg-white/10 transition-all btn-interact flex items-center justify-center gap-1">
                <span class="material-symbols-outlined text-sm">mail</span> Msg
            </button>
        </div>
    `;
    return div;
}

function removeConnectionAction(name) {
    if (confirm(`Remove ${name} from your connections?`)) {
        removeConnection(name);
    }
}

function showNoteModal(connectionName) {
    const connection = CONNECTIONS_DATA.find(c => c.name === connectionName);
    if (!connection) return;
    
    const note = prompt(`Add or edit note for ${connection.name}:`, connection.notes || '');
    if (note !== null) {
        connection.notes = note;
        localStorage.setItem('connections', JSON.stringify(CONNECTIONS_DATA));
        renderConnections(filteredConnections);
        showToast('Note saved');
    }
}

function sendMessage(connectionName) {
    showToast(`Message sent to ${connectionName}`);
}

function initConnectionsView() {
    const saved = localStorage.getItem('connections');
    if (saved) { CONNECTIONS_DATA = JSON.parse(saved); }
    filteredConnections = [...CONNECTIONS_DATA];
    updateConnectionCount();
    renderConnections(CONNECTIONS_DATA);
}

// ─── End Connections Management ────────────────────────────────────────────


// Main Logic
function toggleFocusMode() {
    document.body.classList.toggle('focus-active');
}

function showView(viewId) {
    // Hide all views with fade-out
    document.querySelectorAll('.view-content').forEach(view => {
        view.classList.add('hidden');
        view.classList.remove('view-visible');
    });
    // Show selected view with fade-in
    const targetView = document.getElementById(`view-${viewId}`);
    if (targetView) {
        targetView.classList.remove('hidden');
        requestAnimationFrame(() => targetView.classList.add('view-visible'));
    }

    // Update Desktop Sidebar Active State
    const sidebarIds = ['home', 'matches', 'connections', 'saved', 'settings'];
    sidebarIds.forEach(id => {
        const navElem = document.getElementById(`nav-${id}`);
        if (navElem) {
            if (id === viewId) {
                navElem.classList.add('bg-[#ffffff]/10', 'text-[#ffffff]', 'rounded-md', 'font-semibold');
                navElem.classList.remove('text-[#ffffff]/40', 'hover:bg-[#ffffff]/5', 'hover:text-[#ffffff]');
            } else {
                navElem.classList.remove('bg-[#ffffff]/10', 'text-[#ffffff]', 'rounded-md', 'font-semibold');
                navElem.classList.add('text-[#ffffff]/40', 'hover:bg-[#ffffff]/5', 'hover:text-[#ffffff]');
            }
        }
    });

    // Update Header Nav Active State
    const headerNavIds = ['team', 'solutions', 'blog', 'pricing'];
    headerNavIds.forEach(id => {
        const navElem = document.getElementById(`nav-header-${id}`);
        if (navElem) {
            if (id === viewId) {
                navElem.classList.add('text-white', 'bg-white/10');
                navElem.classList.remove('text-white/60');
            } else {
                navElem.classList.remove('text-white', 'bg-white/10');
                navElem.classList.add('text-white/60');
            }
        }
    });

    // Update Mobile Nav Active State
    const mobileIds = ['home', 'matches', 'connections', 'saved', 'settings'];
    mobileIds.forEach(id => {
        const mobElem = document.getElementById(`mobile-nav-${id}`);
        if (mobElem) {
            if (id === viewId) {
                mobElem.classList.add('text-[#ffffff]');
                mobElem.classList.remove('text-[#ffffff]/40');
            } else {
                mobElem.classList.remove('text-[#ffffff]');
                mobElem.classList.add('text-[#ffffff]/40');
            }
        }
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Trigger synergy count animation if home is shown
    if (viewId === 'home') animateSynergyScore();
    // Trigger matches filter init when matches is shown
    if (viewId === 'matches') setTimeout(initMatchesView, 50);
    // Trigger connections init when connections is shown
    if (viewId === 'connections') setTimeout(initConnectionsView, 50);
}

function animateSynergyScore() {
    const scoreElem = document.getElementById('synergy-score');
    if (!scoreElem) return;
    let count = 0;
    const target = 94;
    const interval = setInterval(() => {
        if (count >= target) {
            clearInterval(interval);
            scoreElem.innerText = target + '%';
        } else {
            count++;
            scoreElem.innerText = count + '%';
        }
    }, 15);
}

// Profile Modal Logic
let currentTargetName = "";
let currentTargetRole = "";

function openProfileModal(name, role, score) {
    currentTargetName = name;
    currentTargetRole = role;
    
    // Map names to specific avatars for consistency
    const avatarMap = {
        'Sarah Jenkins': 'https://i.pravatar.cc/300?u=sarah',
        'Elena Vance': 'https://i.pravatar.cc/300?u=elena',
        'Marcus Thorne': 'https://i.pravatar.cc/300?u=marcus',
        'Jordan Chen': 'https://i.pravatar.cc/300?u=jordan'
    };

    const modalImg = document.getElementById('modal-profile-img');
    const modalName = document.getElementById('modal-profile-name');
    const modalRole = document.getElementById('modal-profile-role');
    const modalScore = document.getElementById('modal-profile-score');
    const modalIntro = document.getElementById('modal-intro-text');

    if (modalImg) modalImg.src = avatarMap[name] || 'https://i.pravatar.cc/300';
    if (modalName) modalName.innerText = name;
    if (modalRole) modalRole.innerText = role;
    if (modalScore) modalScore.innerText = score;
    
    // Set default intro
    if (modalIntro) modalIntro.innerText = `Hey ${name.split(' ')[0]}, I've been following your work in ${role}. Given our shared interests in Web3 and AI, I believe there's a strong synergy for potential collaboration!`;
    
    const overlay = document.getElementById('profile-modal-overlay');
    if (overlay) {
        overlay.classList.remove('hidden');
        overlay.classList.add('flex');
    }
}

function closeProfileModal() {
    const overlay = document.getElementById('profile-modal-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
        overlay.classList.remove('flex');
    }
}

function regenerateIntro() {
    const firstName = currentTargetName.split(' ')[0];
    const intros = [
        `Hi ${firstName}, your work as a ${currentTargetRole} is impressive. I'm building in a similar space and thought it'd be great to swap insights!`,
        `Hey ${firstName}! Our goals seem to align perfectly regarding ${currentTargetRole}. Would you be open to a quick chat next week?`,
        `Hello ${firstName}, our AI matchmaker suggested we connect. Given your expertise in ${currentTargetRole}, I think there's huge synergy here.`
    ];
    const modalIntro = document.getElementById('modal-intro-text');
    if (modalIntro) modalIntro.innerText = intros[Math.floor(Math.random() * intros.length)];
}

function copyToClipboard() {
    const modalIntro = document.getElementById('modal-intro-text');
    if (!modalIntro) return;
    const text = modalIntro.innerText;
    navigator.clipboard.writeText(text).then(() => {
        const btn = event.currentTarget;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="material-symbols-outlined text-sm">check</span> Copied!';
        setTimeout(() => btn.innerHTML = originalText, 2000);
    });
}

function toggleSwitch(btn, type) {
    const dot = btn.querySelector('div');
    const isActive = btn.classList.contains('bg-primary');
    
    if (isActive) {
        btn.classList.remove('bg-primary');
        btn.classList.add('bg-white/10');
        dot.classList.remove('right-1');
        dot.classList.add('left-1');
        dot.classList.remove('bg-white');
        dot.classList.add('bg-white/40');
        if (type === 'dark-mode') document.documentElement.classList.remove('dark');
    } else {
        btn.classList.add('bg-primary');
        btn.classList.remove('bg-white/10');
        dot.classList.add('right-1');
        dot.classList.remove('left-1');
        dot.classList.add('bg-white');
        dot.classList.remove('bg-white/40');
        if (type === 'dark-mode') document.documentElement.classList.add('dark');
    }
    showToast('Preference updated');
}

function showToast(message) {
    const existing = document.getElementById('toast-container');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'toast-container';
    toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-3 rounded-full font-bold shadow-2xl z-[200] modal-animate flex items-center gap-3';
    toast.innerHTML = `<span class="material-symbols-outlined text-green-500">check_circle</span> ${message}`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, 20px)';
        toast.style.transition = 'all 0.4s ease';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

function handleAction(event, action) {
    const btn = event.currentTarget;
    const originalText = btn.innerHTML;
    
    showToast(`${action} successful`);
    
    if (btn.tagName === 'BUTTON') {
        btn.innerHTML = `<span class="material-symbols-outlined text-sm">done</span> Done`;
        btn.classList.add('opacity-50', 'pointer-events-none');
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.remove('opacity-50', 'pointer-events-none');
        }, 2000);
    }
}

// Removed duplicate copyToClipboard and regenerateIntro from here, moved to logic above

function handleSearch(event) {
    if (event.key === 'Enter') {
        showToast(`Searching for "${event.target.value}"...`);
        event.target.value = '';
        showView('matches');
    }
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', async () => {
    // Load components sequentially
    await loadComponent('sidebar-container', 'components/sidebar.html');
    await loadComponent('header-container', 'components/header.html');
    await loadComponent('modal-container', 'components/modal.html');
    await loadComponent('mobile-nav-container', 'components/mobile-nav.html');
    
    // Load views
    await loadComponent('view-home', 'views/home.html');
    await loadComponent('view-matches', 'views/matches.html');
    await loadComponent('view-connections', 'views/connections.html');
    await loadComponent('view-saved', 'views/saved.html');
    await loadComponent('view-settings', 'views/settings.html');
    await loadComponent('view-team', 'views/team.html');
    await loadComponent('view-solutions', 'views/solutions.html');
    await loadComponent('view-blog', 'views/blog.html');
    await loadComponent('view-pricing', 'views/pricing.html');

    // Show initial view
    showView('home');

    // Close focus mode when clicking main or background if active
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.body.classList.contains('focus-active')) {
            toggleFocusMode();
        }
    });
});
