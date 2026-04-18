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
    const sidebarIds = ['home', 'matches', 'saved', 'settings'];
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
    const mobileIds = ['home', 'matches', 'saved', 'settings'];
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
    if (viewId === 'home') {
        animateSynergyScore();
    }
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
