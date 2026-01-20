// ================= DATA & GLOBALS =================
let LLD_DATA = [];
let HLD_DATA = [];
let TOPIC_DETAILS = {};

const CONFIG = {
    mode: localStorage.getItem('app_mode') || 'LLD',
};

let lldState = JSON.parse(localStorage.getItem('lld_master_state')) || { activeTab: 0, completed: {} };
let hldState = JSON.parse(localStorage.getItem('hld_master_state')) || { activeTab: 0, completed: {} };

// ================= INIT & FETCH =================
async function loadDataAndInit() {
    try {
        document.getElementById('headerTitle').innerText = "Loading Knowledge Base...";
        
        const [lldRes, hldRes, detailsRes] = await Promise.all([
            fetch('data/lld.json'),
            fetch('data/hld.json'),
            fetch('data/details.json')
        ]);

        LLD_DATA = await lldRes.json();
        HLD_DATA = await hldRes.json();
        TOPIC_DETAILS = await detailsRes.json();

        initDashboard();
      

    } catch (error) {
        console.error("Error loading data:", error);
        document.getElementById('headerTitle').innerText = "Error Loading Data";
        document.getElementById('headerSubtitle').innerText = "Please run on Live Server";
    }
}

function getData() { return CONFIG.mode === 'LLD' ? LLD_DATA : HLD_DATA; }
function getState() { return CONFIG.mode === 'LLD' ? lldState : hldState; }
function saveState() {
    if(CONFIG.mode === 'LLD') localStorage.setItem('lld_master_state', JSON.stringify(lldState));
    else localStorage.setItem('hld_master_state', JSON.stringify(hldState));
}

// ================= DASHBOARD LOGIC =================
function initDashboard() {
    document.body.setAttribute('data-mode', CONFIG.mode);
    document.getElementById('logoTitle').innerText = `${CONFIG.mode} MASTER`;

    // If screen is small (mobile), close sidebar by default
        if (window.innerWidth <= 768) {
            document.querySelector('aside').classList.add('closed');
        }
    updateModeToggleUI();
    renderNav();
    renderContent();
}

function renderNav() {
    const nav = document.getElementById('navContainer');
    const data = getData();
    const state = getState();
    
    nav.innerHTML = '';
    data.forEach((section, idx) => {
        const div = document.createElement('div');
        div.className = `nav-item ${state.activeTab === idx ? 'active' : ''}`;
        div.onclick = () => switchTab(idx);
        div.innerHTML = `<span>${section.title}</span><span class="progress-pill" id="pill-${idx}">0%</span>`;
        nav.appendChild(div);
    });
    updateStats(); 
}

function renderContent() {
    const state = getState();
    const data = getData();
    const idx = state.activeTab;
    const content = document.getElementById('contentArea');
    const section = data[idx];
    const searchVal = document.getElementById('searchInput').value.toLowerCase();

    // Update Header
    document.getElementById('headerTitle').innerText = section.title;
    document.getElementById('headerSubtitle').innerText = section.subtitle;

    let html = '';
    let hasResults = false;

    section.groups.forEach(group => {
        const filteredTopics = group.topics.filter(item => {
            const title = (typeof item === 'object' ? item.title : item);
            return title.toLowerCase().includes(searchVal);
        });

        if (filteredTopics.length > 0) {
            hasResults = true;
            html += `<div class="group-section"><div class="group-title">${group.name}</div><div class="topic-grid">`;
            
            filteredTopics.forEach(item => {
                // Data prep
                let title, priority, note;
                if (typeof item === 'object') {
                    title = item.title;
                    priority = item.priority || 'none';
                    note = item.note || '';
                } else {
                    title = item;
                    priority = 'none';
                    note = '';
                }
            
                const safeId = 'card-' + title.replace(/[^a-zA-Z0-9]/g, '');
                const isDone = state.completed[title];
            
                // === STAR LOGIC ===
                let starHtml = '';
                if (priority === 'high') {
                    starHtml = `<div class="star-badge high"><i class="fas fa-star"></i> <i class="fas fa-star"></i></div>`;
                } else if (priority === 'medium') {
                    starHtml = `<div class="star-badge medium"><i class="fas fa-star"></i></div>`;
                }
            
                // === NEW LOGIC: CONDITIONAL BUTTON ===
                // Check if we have details in our JSON for this specific title
                const hasContent = TOPIC_DETAILS[title] && 
                                   TOPIC_DETAILS[title].blocks && 
                                   TOPIC_DETAILS[title].blocks.length > 0;
            
                let actionButtonHtml = '';
                
                // Only generate the button HTML if content exists
                if (hasContent) {
                    actionButtonHtml = `
                        <div class="card-actions">
                            <div class="btn-action" onclick="openModal(event, '${title}')" title="Read Notes">
                                <i class="fas fa-file-lines"></i>
                            </div>
                        </div>`;
                }
            
                // === NOTE LOGIC ===
                let noteSection = '';
                if (note) {
                    noteSection = `
                    <div class="card-note-row">
                        <div class="topic-note">
                            <i class="fas fa-comment-dots" style="margin-top:3px; font-size: 0.7rem;"></i>
                            <span>${note}</span>
                        </div>
                    </div>`;
                }
            
                // === RENDER ===
                html += `
                <div id="${safeId}" class="topic-card ${isDone ? 'completed' : ''} prio-${priority}" onclick="handleTopicClick(event, '${title}', '${safeId}')">
                    ${starHtml}
                    
                    <div class="card-top-row">
                        <div class="card-title-group">
                            <div class="checkbox"></div>
                            <span class="topic-text">${title}</span>
                        </div>
            
                        ${actionButtonHtml}
                    </div>
            
                    ${noteSection}
            
                </div>`;
            });
            html += `</div></div>`;
        }
    });

    if (!hasResults) html = `<div class="empty-state"><h3>No vibes found.</h3><p>Try searching for something else.</p></div>`;
    content.innerHTML = html;
}

function switchTab(idx) {
    const state = getState();
    state.activeTab = idx;
    document.getElementById('searchInput').value = ''; 
    saveState();
    renderNav();
    renderContent(); 

    if (window.innerWidth <= 768) {
    document.querySelector('aside').classList.add('closed');
}
    
}

function handleTopicClick(e, topicName, elementId) {
    // 1. Prevent toggle if selecting text
    const selection = window.getSelection();
    if(selection.toString().length > 0) return; 

    // 2. Toggle State
    const state = getState();
    const wasCompleted = state.completed[topicName];
    state.completed[topicName] = !wasCompleted;
    saveState();

    // 3. Update UI
    const card = document.getElementById(elementId);
    if(card) card.classList.toggle('completed');
    
    // If unchecking, stop here (no celebration for undoing work)
    if (wasCompleted) {
        updateStats();
        return;
    }

    // 4. Calculate Progress to decide Celebration Tier
    const stats = updateStats();
    const data = getData();
    const currentSection = data[state.activeTab];
    
    // Extract titles correctly (handling Object vs String difference in LLD/HLD)
    const sectionTopics = currentSection.groups.flatMap(g => g.topics);
    const totalSectionTopics = sectionTopics.length;
    const finishedSectionTopics = sectionTopics.filter(t => {
        const title = (typeof t === 'object' ? t.title : t);
        return state.completed[title];
    }).length;

    // === DECISION TREE ===
    if (stats.globalPercent === 100) {
        // TIER 3: EXTREME
        triggerExtremeCelebration();
    } 
    else if (finishedSectionTopics === totalSectionTopics) {
        // TIER 2: SECTION COMPLETE (BIG)
        triggerSectionComplete();
    } 
    else {
        // TIER 1: SINGLE TOPIC (SMALL)
        // Pass mouse coordinates normalized (0 to 1)
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        triggerSmallConfetti(x, y);
    }
}

// ================= MODAL LOGIC =================
function openModal(e, key) {
    e.stopPropagation();

    const details = TOPIC_DETAILS[key];
    const modal = document.getElementById('noteModal');
    document.getElementById('modalTitle').innerText = key;
    const modalBody = document.getElementById('modalBody');
    
    if (!details || !details.blocks) {
        // Fallback for old format or empty
        modalBody.innerHTML = `<p class="modal-text">No formatted notes available.</p>`;
    } else {
        let html = '';
        
        details.blocks.forEach((block, index) => {
            if (block.type === 'text') {
                html += `<div class="modal-text">${block.content}</div>`;
            } 
            else if (block.type === 'code') {
                // We create a unique ID for the copy function
                const codeId = `code-${index}`;
                // Simple syntax highlighting regex (optional, adds colors to keywords)
                let coloredCode = safeSyntaxHighlight(block.content);

                html += `
                <div class="gemini-code-container">
                    <div class="code-header">
                        <span class="code-lang">${block.language}</span>
                        <button class="copy-btn" onclick="copyToClipboard('${codeId}')">
                            <i class="fas fa-copy"></i> Copy code
                        </button>
                    </div>
                    <div class="code-scroll">
                        <pre class="code-content" id="${codeId}">${coloredCode}</pre>
                        <textarea id="${codeId}-raw" style="display:none;">${block.content}</textarea>
                    </div>
                </div>`;
            }else if (block.type === 'gallery') {
                    html += `<div class="modal-images">`;
                    
                    block.urls.forEach(url => {
                        html += `<img src="${url}" class="modal-img" alt="Topic Diagram" loading="lazy">`;
                    });
            
                    if (block.caption) {
                        html += `<p class="modal-text" style="text-align: center; font-size: 0.85rem; color: var(--text-secondary); margin-top: 5px;">${block.caption}</p>`;
                    }
                    
                    html += `</div>`;
                }
        });
        modalBody.innerHTML = html;
    }
    modal.classList.add('active');

         modalBody.scrollTop = 0;
}

// New Copy Function
function copyToClipboard(elementId) {
    const rawText = document.getElementById(elementId + '-raw').value;
    navigator.clipboard.writeText(rawText).then(() => {
        // Visual feedback could go here (e.g., change icon to checkmark)
        alert("Copied to clipboard!"); 
    });
}

function closeModal(e) {
    const modal = document.getElementById('noteModal');
    // Close if clicking overlay, close button, or passed explicitly
    if (!e || e.target === modal || e.target.closest('.modal-close')) {
        modal.classList.remove('active');
    }
}

function copyCode(btn, key) {
    const details = TOPIC_DETAILS[key];
    if(details && details.code) {
        navigator.clipboard.writeText(details.code).then(() => {
            const originalText = btn.innerText;
            btn.innerText = "Copied!";
            btn.style.background = "var(--success)";
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.background = "";
            }, 1500);
        });
    }
}

function safeSyntaxHighlight(code) {
    // 1. Escape HTML special chars first to prevent rendering issues
    let clean = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // 2. Tokenize Strings and Comments 
    // We replace them with placeholders (###0###) so the keyword regex ignores them.
    const placeholders = [];
    const save = (content, type) => {
        placeholders.push(`<span class="code-${type}">${content}</span>`);
        return `###${placeholders.length - 1}###`;
    };

    // Match Strings ("...")
    clean = clean.replace(/"(.*?)"/g, (match) => save(match, 'string'));

    // Match Comments (// ...)
    clean = clean.replace(/\/\/.*/g, (match) => save(match, 'comment'));

    // 3. Highlight Keywords
    // I added 'abstract', 'interface', 'extends', 'implements', 'super', 'this' based on your screenshot
    clean = clean.replace(/\b(public|class|void|int|String|new|return|if|else|static|abstract|interface|extends|implements|super|this)\b/g,
        '<span class="code-keyword">$1</span>');

    // 4. Restore placeholders
    clean = clean.replace(/###(\d+)###/g, (_, index) => placeholders[index]);

    return clean;
}

// ================= UTILITIES =================
function updateStats() {
    const state = getState();
    const data = getData();
    
    // 1. Get all topics, but ensure we extract the TITLE string if it's an object
    const allTopics = data.flatMap(s => s.groups.flatMap(g => g.topics));
    
    // FIX: Check 'typeof' to handle both Strings (HLD) and Objects (LLD)
    const totalDone = allTopics.filter(t => {
        const title = (typeof t === 'object' ? t.title : t);
        return state.completed[title];
    }).length;

    const globalPercent = Math.round((totalDone / allTopics.length) * 100) || 0;

    document.getElementById('masteryPercent').innerText = `${globalPercent}%`;
    document.getElementById('masteryBar').style.width = `${globalPercent}%`;

    // 2. Update individual section pills
    data.forEach((section, idx) => {
        const sectionTopics = section.groups.flatMap(g => g.topics);
        
        // FIX: Same check here
        const sDone = sectionTopics.filter(t => {
            const title = (typeof t === 'object' ? t.title : t);
            return state.completed[title];
        }).length;

        const sPer = Math.round((sDone / sectionTopics.length) * 100) || 0;
        const pill = document.getElementById(`pill-${idx}`);
        if(pill) pill.innerText = `${sPer}%`;
    });

    return { globalPercent };
}

function toggleTheme() {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    const icon = document.querySelector('.theme-toggle i');
    if(icon) icon.className = isDark ? 'fas fa-moon' : 'fas fa-sun';
}

function toggleSidebar() {
    const sidebar = document.querySelector('aside');
    sidebar.classList.toggle('closed');
}

// --- SECRET SWITCH ---
// let clickCount = 0;
// let clickTimer = null;
// function initSecretSwitch() {
//     const title = document.getElementById('logoTitle');
//     title.addEventListener('click', () => {
//         clickCount++;
//         title.style.transform = 'scale(0.95)';
//         setTimeout(() => title.style.transform = 'scale(1)', 100);
//         if (clickTimer) clearTimeout(clickTimer);
//         clickTimer = setTimeout(() => { clickCount = 0; }, 500);
//         if (clickCount === 3) toggleMode();
//     });
// }

// function toggleMode() {
//     CONFIG.mode = CONFIG.mode === 'LLD' ? 'HLD' : 'LLD';
//     localStorage.setItem('app_mode', CONFIG.mode);
//     document.body.style.opacity = '0';
//     setTimeout(() => {
//         initDashboard();
//         document.body.style.opacity = '1';
//         confetti({ particleCount: 100, spread: 70, origin: { y: 0.1 }, colors: CONFIG.mode === 'LLD' ? ['#2563eb'] : ['#8b5cf6'] });
//     }, 300);
//     clickCount = 0;
// }

// ================= MODE SWITCH LOGIC =================

// Replace the old toggleMode with this explicit setter
function setMode(selectedMode) {
    if (CONFIG.mode === selectedMode) return; // Don't reload if already active

    // 1. Update Config & Storage
    CONFIG.mode = selectedMode;
    localStorage.setItem('app_mode', CONFIG.mode);

    // 2. Visual Feedback (Fade out)
    document.body.style.opacity = '0';
    
    // 3. Wait for fade, then re-init
    setTimeout(() => {
        initDashboard();
        updateModeToggleUI(); // Ensure the toggle looks correct
        document.body.style.opacity = '1';
        
        // Optional: Small confetti burst on switch
        confetti({ 
            particleCount: 60, 
            spread: 70, 
            origin: { y: 0.1 }, 
            colors: CONFIG.mode === 'LLD' ? ['#2563eb'] : ['#8b5cf6'] 
        });
    }, 250);
}

// Call this inside initDashboard() to ensure UI matches state on load
function updateModeToggleUI() {
    const lldBtn = document.getElementById('btn-lld');
    const hldBtn = document.getElementById('btn-hld');
    
    // Reset classes
    lldBtn.className = 'mode-option';
    hldBtn.className = 'mode-option';

    // Set active class
    if (CONFIG.mode === 'LLD') {
        lldBtn.classList.add('active');
    } else {
        hldBtn.classList.add('active');
    }
}

// ================= BOOTSTRAP =================
// TIER 1: Small Burst at Mouse Position
function triggerSmallConfetti(x, y) {
    const color = CONFIG.mode === 'LLD' ? '#2563eb' : '#8b5cf6';
    confetti({
        particleCount: 40,
        spread: 60,
        origin: { x: x, y: y },
        colors: [color, '#ffffff'],
        disableForReducedMotion: true,
        gravity: 1.2,
        scalar: 0.7 // Make particles slightly smaller
    });
}

// TIER 2: Dual Cannons from Bottom (Section Complete)
function triggerSectionComplete() {
    const color = CONFIG.mode === 'LLD' ? '#2563eb' : '#8b5cf6';
    const end = Date.now() + 1000; // Run for 1 second

    (function frame() {
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.8 }, // Bottom Left
            colors: [color, '#22c55e']
        });
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.8 }, // Bottom Right
            colors: [color, '#22c55e']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

// TIER 3: EXTREME CELEBRATION (Global 100%)
function triggerExtremeCelebration() {
    const duration = 8000; // 8 Seconds of chaos
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // Random Fireworks
        confetti(Object.assign({}, defaults, { 
            particleCount, 
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } 
        }));
        confetti(Object.assign({}, defaults, { 
            particleCount, 
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } 
        }));
        
        // "School Pride" side streams
        confetti({
            particleCount: 10,
            angle: 60,
            spread: 80,
            origin: { x: 0 },
            colors: ['#2563eb', '#ffffff']
        });
        confetti({
            particleCount: 10,
            angle: 120,
            spread: 80,
            origin: { x: 1 },
            colors: ['#8b5cf6', '#ffffff']
        });
        
    }, 250);
}

window.onload = loadDataAndInit;
