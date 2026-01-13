/**
 * UNICODA Main Logic
 */

// --- DATA PROCESSING ---

function parseFrontMatterItem(rawString, defaultType) {
    const trimmed = rawString.trim();
    const parts = trimmed.split('---');

    if (parts.length < 2) {
        // Fallback for content-only strings or malformed entries
        return { type: defaultType, title: "Untitled", content: trimmed, tags: [], props: {} };
    }

    const header = parts[0].trim();
    // Re-join in case content itself contains '---'
    const content = parts.slice(1).join('---').trim();

    const headerLines = header.split('\n').map(line => line.trim()).filter(line => line);
    
    const title = headerLines[0] || "Untitled";
    const tagsStr = headerLines[1] || "";
    const tags = tagsStr ? tagsStr.split(',').map(s => s.trim()) : [];

    return {
        type: defaultType,
        title: title,
        content: content,
        tags: tags,
        props: {}
    };
}

Object.keys(JOURNEYS).forEach(key => {
    const j = JOURNEYS[key];
    j.sequence = j.sequence.map(item => {
        // Assuming all journey sequence items are barcodes for now
        return parseFrontMatterItem(item, 'barcode');
    });
});

const LIBRARY = [
    ...RAW_BARCODES.map(s => parseFrontMatterItem(s, 'barcode')),
    ...RAW_CURRENTS.map(s => parseFrontMatterItem(s, 'current')),
    ...RAW_GEODES.map(s => parseFrontMatterItem(s, 'geode'))
].map((item, index) => ({
    ...item,
    id: `${item.type}-${index}` 
}));

Object.values(JOURNEYS).forEach(journey => {
    if (journey.sequence.length > 0) {
        const gateway = { ...journey.sequence[0] };
        if (!gateway.tags) gateway.tags = [];
        gateway.tags.push(`journey:${journey.id}`);
        gateway.id = `gateway-${journey.id}`;
        LIBRARY.push(gateway);
    }
});

// --- APP STATE ---
    const state = {
    view: 'title', 
    baseTheme: localStorage.getItem('unicoda_base_theme') || 'default', 
    themeMode: localStorage.getItem('unicoda_theme_mode') || 'dark', 
    
    history: [], 
    historyIndex: -1,
    favorites: JSON.parse(localStorage.getItem('unicoda_favorites') || '[]'),
    // Default filters
    filters: { 
        barcode: true, 
        current: true, 
        geode: true, 
        journey: true, 
        ai: true,
        explicit: localStorage.getItem('unicoda_filter_explicit') === 'true'
    },
    
    seenIntro: localStorage.getItem('unicoda_seen_intro') === 'true',
    introStep: 0,
    currentListTab: 'visited',
    
    sessionSeen: new Set(),
    globalSeen: new Set(),
    newPiecesThisSession: 0,
    pastPiecesShownThisSession: 0,
    pastPiecesShownThisSessionSet: new Set(),

    showTitles: localStorage.getItem('unicoda_show_titles') !== 'false',
    newTabMode: localStorage.getItem('unicoda_new_tab_mode') === 'true', 
    showSeconds: localStorage.getItem('unicoda_show_seconds') !== 'false', // Default true
    
    backdropLevels: [0.4, 0.2, 0.1, 0.05, 0],
    backdropIndex: parseInt(localStorage.getItem('unicoda_bg_index') || '2'), 

    activeJourney: null,
    journeyIndex: -1,
    passagesSinceJourney: 5,
    
    activeAnimationId: 0,
    activeInterval: null
};

// --- DOM CACHE ---
const dom = {
    screens: {
        title: document.getElementById('title-screen'),
        intro: document.getElementById('intro-sequence'),
        reader: document.getElementById('reader'),
        loader: document.getElementById('loading-screen')
    },
    overlays: {
        about: document.getElementById('about-overlay'),
        settings: document.getElementById('settings-menu'),
        lists: document.getElementById('list-menu')
    },
    display: document.getElementById('composition-display'),
    clock: document.getElementById('clock-display'),
    aboutSymbol: document.getElementById('about-symbol-display'),
    titleContainer: document.getElementById('title-container'),
    title: document.getElementById('composition-title'),
    loaderDisplay: document.getElementById('loader-display'),
    buttons: {
        back: document.getElementById('nav-back'),
        forward: document.getElementById('nav-forward'),
        random: document.getElementById('nav-random'),
        fav: document.getElementById('nav-fav'),
        theme: document.getElementById('toggle-theme'),
        backdrop: document.getElementById('btn-backdrop'),
        skip: document.getElementById('nav-skip'),
        titleToggle: document.getElementById('toggle-titles'),
        explicitToggle: document.getElementById('toggle-explicit'),
        newTabToggle: document.getElementById('toggle-new-tab'), 
        secondsToggle: document.getElementById('toggle-show-seconds'),
        aiInd: document.getElementById('ai-indicator')
    },
    rows: {
        seconds: document.getElementById('row-show-seconds')
    },
    noteSize: document.getElementById('slider-note-size'),
    textSize: document.getElementById('slider-text-size'),
    tooltip: document.getElementById('global-tooltip')
};

// --- CLOCK SYSTEM ---
const ClockSystem = {
    active: false,
    lastTimeString: "",
    interval: null,

    start() {
        if (this.active) return;
        this.active = true;
        dom.clock.classList.remove('hidden');
        dom.clock.classList.add('visible');
        this.tick(true); // Force immediate render
        this.interval = setInterval(() => this.tick(), 1000);
    },

    stop() {
        this.active = false;
        if (this.interval) clearInterval(this.interval);
        dom.clock.classList.remove('visible');
        dom.clock.classList.add('hidden');
        dom.clock.innerHTML = "";
        this.lastTimeString = "";
    },

    getTimeString() {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        
        if (state.showSeconds) {
            const s = String(now.getSeconds()).padStart(2, '0');
            return `${h}:${m}:${s}`;
        }
        return `${h}:${m}`;
    },

    tick(force = false) {
        const timeStr = this.getTimeString();
        
        // Re-build DOM if format changed (e.g. seconds toggled) or empty
        if (dom.clock.children.length !== timeStr.length) {
            dom.clock.innerHTML = "";
            timeStr.split('').forEach(char => {
                const span = document.createElement('span');
                span.className = 'clock-digit';
                span.textContent = char;
                dom.clock.appendChild(span);
            });
            this.lastTimeString = timeStr;
            return;
        }

        const chars = timeStr.split('');
        const spans = dom.clock.children;
        const blockChars = ["█", "▓", "▒", "░"];

        chars.forEach((char, i) => {
            if (force || char !== this.lastTimeString[i]) {
                const span = spans[i];
                if (char === ':') {
                    span.textContent = ':'; 
                    return;
                }

                // Animation Logic:
                // If it's the seconds part (index 6 or 7 in HH:MM:SS), update instantly.
                // Otherwise (Hours/Minutes), do the scramble.
                if (state.showSeconds && i >= 6) {
                    span.textContent = char;
                } else {
                    // Scramble Animation for Minutes/Hours
                    let flickerCount = 0;
                    const flicker = setInterval(() => {
                        span.textContent = blockChars[Math.floor(Math.random() * blockChars.length)];
                        flickerCount++;
                        if (flickerCount > 4) { 
                            clearInterval(flicker);
                            span.textContent = char;
                        }
                    }, 50);
                }
            }
        });

        this.lastTimeString = timeStr;
    }
};

// --- ABOUT ANIMATION ---
const AboutAnimation = {
    interval: null,
    // Updated Pool
    pool: ['❖', '☩', '⌘', '⌂', '⚷', '⍾', '⚙', '⚠', '⚬', '☼', '⧉', '⎈', 'ꙮ', '𖨆', '𖡄', '𒀭', '𖭅', 'ጸ'],
    lastSymbol: '',
    
    start() {
        if (this.active) return;
        this.active = true;
        this.tick();
        this.interval = setInterval(() => this.tick(), 2500); // Slower shift to let them breathe
    },
    
    stop() {
        this.active = false;
        clearInterval(this.interval);
    },
    
    tick() {
        // Non-repeating random selection
        let nextSymbol;
        do {
            nextSymbol = this.pool[Math.floor(Math.random() * this.pool.length)];
        } while (nextSymbol === this.lastSymbol);
        
        this.lastSymbol = nextSymbol;
        
        // Flicker / Scramble Effect
        const blockChars = ["█", "▓", "▒", "░"];
        let flickerCount = 0;
        
        const flicker = setInterval(() => {
            dom.aboutSymbol.textContent = blockChars[Math.floor(Math.random() * blockChars.length)];
            flickerCount++;
            if (flickerCount > 6) { 
                clearInterval(flicker);
                dom.aboutSymbol.textContent = nextSymbol;
            }
        }, 60);
    }
};

// --- INITIALIZATION ---
    
function init() {
    // Load Saved Filters
    const savedFilters = localStorage.getItem('unicoda_filters');
    if (savedFilters) {
        const parsed = JSON.parse(savedFilters);
        state.filters = { ...state.filters, ...parsed };
    }
    
    // Apply Filter UI State
    document.querySelectorAll('.filter-btn').forEach(btn => {
        const type = btn.dataset.type;
        if (state.filters.hasOwnProperty(type)) {
            btn.classList.toggle('active', state.filters[type]);
        }
    });

    // History setup
    const savedGlobalSeen = JSON.parse(localStorage.getItem('unicoda_global_seen') || '[]');
    state.globalSeen = new Set(savedGlobalSeen);
    
    // Reset session-specific trackers
    state.sessionSeen.clear();
    state.newPiecesThisSession = 0;
    state.pastPiecesShownThisSession = 0;
    state.pastPiecesShownThisSessionSet = new Set();

    // Text Size Setup
    const textSizeStep = localStorage.getItem('unicoda_text_step') || '4'; 
    dom.textSize.value = textSizeStep;
    updateTextSize(textSizeStep);
    
    dom.textSize.addEventListener('input', (e) => {
        updateTextSize(e.target.value);
        localStorage.setItem('unicoda_text_step', e.target.value);
    });

    updateTheme(); 
    updateBackdropState();
    
    // UI Button States
    dom.buttons.titleToggle.textContent = state.showTitles ? 'ON' : 'OFF';
    dom.buttons.explicitToggle.textContent = state.filters.explicit ? 'ON' : 'OFF';
    dom.buttons.newTabToggle.textContent = state.newTabMode ? 'ON' : 'OFF';
    dom.buttons.secondsToggle.textContent = state.showSeconds ? 'ON' : 'OFF';

    // Update Seconds Toggle Availability
    if (!state.newTabMode) dom.rows.seconds.classList.add('disabled');

    if (window.AnnotationsSystem) {
        window.AnnotationsSystem.init();
        const sizes = ['small', 'medium', 'big'];
        const currentSize = localStorage.getItem('unicoda_note_size') || 'medium';
        const sizeIndex = sizes.indexOf(currentSize) + 1;
        dom.noteSize.value = sizeIndex > 0 ? sizeIndex : 2;
        
        dom.noteSize.addEventListener('input', (e) => {
             const val = parseInt(e.target.value);
             const sizeMap = { 1: 'small', 2: 'medium', 3: 'big' };
             window.AnnotationsSystem.setFontSize(sizeMap[val]);
        });
    }

    // Event Listeners
    document.getElementById('btn-start').addEventListener('click', () => handleStart(false)); // Manual start = show loader
    dom.buttons.forward.addEventListener('click', goForward);
    dom.buttons.back.addEventListener('click', goBack);
    dom.buttons.random.addEventListener('click', () => {
        if (state.view === 'intro') {
            finishIntro();
        } else {
            goTrueRandom();
        }
    });
    dom.buttons.fav.addEventListener('click', toggleFavorite);
    dom.buttons.theme.addEventListener('click', toggleThemeMode);
    dom.buttons.backdrop.addEventListener('click', cycleBackdrop);
    dom.buttons.skip.addEventListener('click', exitJourney); 
    dom.buttons.titleToggle.addEventListener('click', toggleTitles);
    dom.buttons.explicitToggle.addEventListener('click', toggleExplicit);
    dom.buttons.newTabToggle.addEventListener('click', toggleNewTabMode);
    dom.buttons.secondsToggle.addEventListener('click', toggleSeconds);

    document.getElementById('btn-add-note').addEventListener('click', () => window.AnnotationsSystem.createNote());
    document.getElementById('btn-lists').addEventListener('click', () => { openLists(); toggleOverlay('lists', true); });
    document.getElementById('btn-settings').addEventListener('click', () => toggleOverlay('settings', true));
    document.getElementById('btn-about').addEventListener('click', () => {
        toggleOverlay('about', true);
        AboutAnimation.start();
    });
    document.getElementById('btn-close-about').addEventListener('click', () => {
        toggleOverlay('about', false);
        AboutAnimation.stop();
    });
    document.getElementById('btn-close-settings').addEventListener('click', () => toggleOverlay('settings', false));
    document.getElementById('btn-close-lists').addEventListener('click', () => toggleOverlay('lists', false));

    document.getElementById('btn-reset-intro').addEventListener('click', () => {
        state.seenIntro = false;
        localStorage.setItem('unicoda_seen_intro', 'false');
    });
    
    document.getElementById('btn-clear-data').addEventListener('click', () => {
        window.AnnotationsSystem.clearAllData();
        localStorage.clear();
        location.reload();
    });

    // Tooltips
    document.body.addEventListener('mouseover', (e) => {
        const target = e.target.closest('[data-tooltip]');
        if (target) {
            const text = target.dataset.tooltip;
            dom.tooltip.textContent = text;
            const rect = target.getBoundingClientRect();
            const centerX = rect.left + (rect.width / 2);
            let top;
            const gap = 10;
            if (rect.top < 50) {
                top = rect.bottom;
                dom.tooltip.style.transform = 'translate(-50%, 0)'; 
                dom.tooltip.style.marginTop = `${gap}px`;
            } else {
                top = rect.top;
                dom.tooltip.style.transform = 'translate(-50%, -100%)'; 
                dom.tooltip.style.marginTop = `-${gap}px`;
            }
            dom.tooltip.style.left = `${centerX}px`;
            dom.tooltip.style.top = `${top}px`;
            dom.tooltip.classList.remove('hidden');
            dom.tooltip.classList.add('visible');
        }
    });
    document.body.addEventListener('mouseout', (e) => {
        const target = e.target.closest('[data-tooltip]');
        if (target) {
            dom.tooltip.classList.remove('visible');
            dom.tooltip.classList.add('hidden');
        }
    });

    // Inputs
    document.addEventListener('keydown', (e) => {
        if (document.body.classList.contains('ui-locked')) return;
        if (state.view === 'reader' && !dom.overlays.settings.classList.contains('hidden')) return;
        if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') return; 
        if (e.key === ' ') {
            if (document.activeElement.tagName === 'BUTTON') return;
            e.preventDefault();
            goForward();
            return;
        }
        if (e.key === 'ArrowRight') goForward();
        if (e.key === 'ArrowLeft') goBack();
        if (e.key === 'f') toggleFavorite();
    });

    document.getElementById('intro-content').addEventListener('click', (e) => {
        if (e.target.closest('.intro-link')) {
            nextIntroStep();
        }
    });

    // STARTUP LOGIC
    if (state.newTabMode) {
        document.title = "New Tab"; // Set title for new tab mode
        handleStart(true); 
        ClockSystem.start(); 
    } else {
        document.title = "UNICODA"; // Reset title
        switchScreen('title');
        startMainTitleAnimation();
    }
}

function updateTextSize(step) {
    // Range 1-8
    // Min 1.2, Max 2.6
    // Step size = (2.6 - 1.2) / 7 = 0.2
    
    const val = parseInt(step);
    const vmin = 1.2 + ((val - 1) * 0.2);
    
    document.documentElement.style.setProperty('--font-reading-size', `${vmin}vmin`);
    
    // Force title reposition calculation
    if(state.view === 'reader' && dom.display.textContent) {
        requestAnimationFrame(() => {
             const rect = dom.display.getBoundingClientRect();
             dom.titleContainer.style.top = `calc(50% + ${rect.height / 2}px + 2.5rem)`;
        });
    }
}

// MAIN TITLE ANIMATION
function startMainTitleAnimation() {
    const titleEl = document.getElementById('main-title');
    if (!titleEl) return;
    
    const charSpans = Array.from(titleEl.children);
    // Capture base text from data attributes or content
    const baseText = charSpans.map(span => span.dataset.base || span.textContent);
    charSpans.forEach((span, i) => { if (!span.dataset.base) span.dataset.base = baseText[i]; });

    const blockChars = ["█", "▓", "▒", "░"];

    const runAnimation = () => {
        // Pick indices to animate
        const indices = [];
        const count = Math.random() > 0.6 ? 2 : 1; 
        while(indices.length < count) {
            const idx = Math.floor(Math.random() * baseText.length);
            if(!indices.includes(idx)) indices.push(idx);
        }
        
        indices.forEach(idx => {
            const span = charSpans[idx];
            // Prevent overlapping animations
            if (span.dataset.animating === "true") return;
            
            span.dataset.animating = "true";
            
            // Duration of the scramble event
            const duration = 300 + Math.random() * 500;
            
            // Rapid flicker interval
            const flicker = setInterval(() => {
                span.textContent = blockChars[Math.floor(Math.random() * blockChars.length)];
            }, 60);

            // Restoration
            setTimeout(() => {
                clearInterval(flicker);
                span.textContent = span.dataset.base;
                span.dataset.animating = "false";
            }, duration);
        });

        // Next run in 0.5s to 2.0s
        setTimeout(runAnimation, 500 + Math.random() * 1500);
    };

    runAnimation();
}

function handleStart(skipLoader = false) {
    if (!state.seenIntro) startIntro();
    else enterReader(skipLoader);
}

function switchScreen(name) {
    Object.values(dom.screens).forEach(el => {
        el.classList.remove('active');
        el.classList.add('hidden');
    });
    dom.screens[name].classList.remove('hidden');
    void dom.screens[name].offsetWidth; 
    dom.screens[name].classList.add('active');
    
    state.view = name;
    
    const randomBtn = dom.buttons.random;
    
    if(name === 'title') {
        document.getElementById('app').classList.add('view-title');
    } else {
        document.getElementById('app').classList.remove('view-title');
    }

    if (name === 'intro') {
        document.getElementById('app').classList.add('view-intro');
        randomBtn.textContent = '↠';
        randomBtn.dataset.tooltip = 'Skip Intro';
    } else {
        document.getElementById('app').classList.remove('view-intro');
        randomBtn.textContent = '⚄';
        randomBtn.dataset.tooltip = 'Random';
    }
}

function toggleOverlay(name, show) {
    if (show) dom.overlays[name].classList.remove('hidden');
    else dom.overlays[name].classList.add('hidden');
}

// --- THEMING LOGIC ---

function toggleThemeMode() {
    state.themeMode = state.themeMode === 'dark' ? 'light' : 'dark';
    localStorage.setItem('unicoda_theme_mode', state.themeMode);
    updateTheme();
}

function updateTheme() {
    let attr = null;
    if (state.baseTheme === 'default') {
        if (state.themeMode === 'light') attr = 'light';
    } else {
        if (state.themeMode === 'light') attr = `${state.baseTheme}-light`;
        else attr = state.baseTheme;
    }
    
    if (attr) document.documentElement.setAttribute('data-theme', attr);
    else document.documentElement.removeAttribute('data-theme');
    
    updateFavicon();
}

function updateFavicon() {
    const link = document.getElementById('app-favicon');
    if (!link) return;

    // Configuration for Dark vs Light
    // Dark Mode: Dark Box (#1a1a1a), Light Text (#d4d4d4)
    // Light Mode: Light Box (#d4d4d4), Dark Text (#1a1a1a)
    
    const isLight = state.themeMode === 'light';
    const bgColor = isLight ? '%23d4d4d4' : '%231a1a1a';
    const textColor = isLight ? '%231a1a1a' : '%23d4d4d4';
    
    // Centered SVG with dominant-baseline='central'
    // Shifted x to 29
    const svg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cstyle%3E text %7B font-family: monospace; font-weight: bold; font-size: 42px; fill: ${textColor}; %7D %3C/style%3E%3Crect width='64' height='64' rx='8' fill='${bgColor}'/%3E%3Ctext x='29' y='32' dominant-baseline='central' text-anchor='middle'%3E❖%3C/text%3E%3C/svg%3E`;
    
    link.href = svg;
}

// --- BACKDROP LOGIC ---

function cycleBackdrop() {
    state.backdropIndex++;
    if (state.backdropIndex >= state.backdropLevels.length) state.backdropIndex = 0;
    localStorage.setItem('unicoda_bg_index', state.backdropIndex);
    updateBackdropState();
}

function updateBackdropState() {
    const opacity = state.backdropLevels[state.backdropIndex];
    const icons = ["█", "▓", "▒", "░", "∅"];
    const percentages = ["100%", "50%", "25%", "12%", "0%"];
    
    dom.buttons.backdrop.textContent = icons[state.backdropIndex];
    dom.buttons.backdrop.dataset.tooltip = `Backdrop: ${percentages[state.backdropIndex]}`;
    
    // Update live tooltip if it is visible
    if(dom.tooltip.classList.contains('visible') && dom.tooltip.textContent.startsWith("Backdrop:")) {
        dom.tooltip.textContent = `Backdrop: ${percentages[state.backdropIndex]}`;
    }

    if (opacity === 0) {
        window.AsciiBackdropSystem.stop();
        // FORCE OPACITY 0
        if(window.AsciiBackdropSystem.element) {
            window.AsciiBackdropSystem.element.style.opacity = '0';
        }
    } else {
        if (!window.AsciiBackdropSystem.active) window.AsciiBackdropSystem.start();
        window.AsciiBackdropSystem.setOpacity(opacity);
    }
}

// --- TITLE LOGIC ---

function toggleTitles() {
    state.showTitles = !state.showTitles;
    localStorage.setItem('unicoda_show_titles', state.showTitles);
    dom.buttons.titleToggle.textContent = state.showTitles ? 'ON' : 'OFF';
    
    if (state.showTitles) dom.title.classList.remove('hidden');
    else dom.title.classList.add('hidden');
}

// --- NEW TAB MODE LOGIC ---

function toggleNewTabMode() {
    state.newTabMode = !state.newTabMode;
    localStorage.setItem('unicoda_new_tab_mode', state.newTabMode);
    dom.buttons.newTabToggle.textContent = state.newTabMode ? 'ON' : 'OFF';
    
    // Update Title
    document.title = state.newTabMode ? "New Tab" : "UNICODA";
    
    if (state.newTabMode) {
        ClockSystem.start();
        dom.rows.seconds.classList.remove('disabled');
    } else {
        ClockSystem.stop();
        dom.rows.seconds.classList.add('disabled');
    }
}

function toggleSeconds() {
    state.showSeconds = !state.showSeconds;
    localStorage.setItem('unicoda_show_seconds', state.showSeconds);
    dom.buttons.secondsToggle.textContent = state.showSeconds ? 'ON' : 'OFF';
    
    // Force immediate update to redraw the clock structure
    if (state.newTabMode) ClockSystem.tick(true);
}

// --- EXPLICIT LOGIC ---

function toggleExplicit() {
    state.filters.explicit = !state.filters.explicit;
    localStorage.setItem('unicoda_filter_explicit', state.filters.explicit);
    dom.buttons.explicitToggle.textContent = state.filters.explicit ? 'ON' : 'OFF';
}

// --- LOADING LOGIC ---

function triggerLoad(isNew = true, specificId = null, forceTrueRandom = false, skipLoader = false) {
    let piece;
    let enteringJourney = false;

    if (specificId) {
        // Direct navigation
        if (specificId.includes(':') && !specificId.startsWith('gateway')) {
            const [jName, jIdx] = specificId.split(':');
            if (JOURNEYS[jName]) {
                const index = parseInt(jIdx);
                const rawPiece = JOURNEYS[jName].sequence[index];
                if (rawPiece) {
                    piece = { ...rawPiece, id: specificId, tags: [], props: {} };
                    state.activeJourney = jName;
                    state.journeyIndex = index;
                    enteringJourney = true;
                }
            }
        } 
        
        if (!piece) {
            piece = LIBRARY.find(p => p.id === specificId);
            if (piece && piece.id.startsWith('gateway-')) {
                 const jId = piece.id.split('gateway-')[1];
                 if (JOURNEYS[jId] && state.filters.journey) {
                     state.activeJourney = jId;
                     state.journeyIndex = 0;
                     enteringJourney = true;
                 }
            } else if (state.activeJourney && (!piece || !piece.id.startsWith(state.activeJourney))) {
                state.activeJourney = null;
                state.journeyIndex = -1;
            }
        }
    } 
    else if (isNew) {
        if (state.activeJourney && !forceTrueRandom) {
            // Journey progression
            const nextIndex = state.journeyIndex + 1;
            const journey = JOURNEYS[state.activeJourney];
            
            if (nextIndex < journey.sequence.length) {
                state.journeyIndex = nextIndex;
                const rawPiece = journey.sequence[nextIndex];
                piece = { ...rawPiece, id: `${state.activeJourney}:${nextIndex}`, tags: [], props: {} };
                enteringJourney = true;
                
                state.history.push(piece.id);
                state.historyIndex = state.history.length - 1;
            } else {
                exitJourney();
                return;
            }
        } else {
            // Random selection logic
            const candidates = LIBRARY.filter(p => {
                const isJourney = p.tags && p.tags.some(t => t.startsWith('journey:'));
                if (isJourney && state.filters.journey) { /* Pass */ } 
                else { if(!state.filters[p.type]) return false; }

                const isAI = p.tags && (p.tags.includes('ai') || p.tags.includes('hybrid'));
                if (isAI && !state.filters.ai) return false;

                const isExplicit = p.tags && p.tags.includes('explicit');
                if (isExplicit && !state.filters.explicit) return false;
                
                return true;
            });

            if (candidates.length === 0) return;
            
            if (forceTrueRandom) {
                piece = candidates[Math.floor(Math.random() * candidates.length)];
                if (piece.tags && piece.tags.some(t => t.startsWith('journey:'))) {
                    const tag = piece.tags.find(t => t.startsWith('journey:'));
                    const jId = tag.split(':')[1];
                    if (JOURNEYS[jId] && state.filters.journey) {
                        state.activeJourney = jId;
                        state.journeyIndex = 0; 
                        enteringJourney = true;
                    }
                }
                state.history.push(piece.id);
                state.historyIndex = state.history.length - 1;

            } else {
                // Normal Discovery Logic
                const availablePool = candidates.filter(p => !state.sessionSeen.has(p.id));
                const unseenGlobally = availablePool.filter(p => !state.globalSeen.has(p.id));
                const seenInPast = availablePool.filter(p => state.globalSeen.has(p.id));
                const recentPastSlice = seenInPast.slice(-45);
                const eligiblePastPieces = recentPastSlice.filter(p => !state.pastPiecesShownThisSessionSet.has(p.id));

                let pool = [];
                let wasFromPastPool = false;

                if (state.newPiecesThisSession < 5 && unseenGlobally.length > 0) {
                    pool = unseenGlobally;
                } else {
                    const canShowPast = state.pastPiecesShownThisSession < 3 && eligiblePastPieces.length > 0;
                    const shouldShowPast = Math.random() < 0.05; 

                    if (canShowPast && shouldShowPast) {
                        pool = eligiblePastPieces;
                        wasFromPastPool = true;
                    } else if (unseenGlobally.length > 0) {
                        pool = unseenGlobally;
                    } else {
                        pool = availablePool.length > 0 ? availablePool : candidates;
                    }
                }
                
                if (pool.length === 0) pool = candidates;

                let validPool = pool;
                if (state.passagesSinceJourney < 5 || !state.filters.journey) {
                    const nonJourneyPool = pool.filter(p => !p.tags || !p.tags.some(t => t.startsWith('journey:')));
                    if (nonJourneyPool.length > 0) validPool = nonJourneyPool;
                }

                piece = validPool[Math.floor(Math.random() * validPool.length)];

                if (wasFromPastPool) {
                    state.pastPiecesShownThisSession++;
                    state.pastPiecesShownThisSessionSet.add(piece.id);
                } else if (!state.globalSeen.has(piece.id)) {
                    state.newPiecesThisSession++;
                }
                
                if (!wasFromPastPool && piece.tags && piece.tags.some(t => t.startsWith('journey:'))) {
                    const tag = piece.tags.find(t => t.startsWith('journey:'));
                    const jId = tag.split(':')[1];
                    if (JOURNEYS[jId] && state.filters.journey) {
                        state.activeJourney = jId;
                        state.journeyIndex = 0; 
                        enteringJourney = true;
                    }
                } else {
                    state.passagesSinceJourney++;
                }

                state.history.push(piece.id);
                state.historyIndex = state.history.length - 1;
            }
        }
    } 
    else {
        const id = state.history[state.historyIndex];
        triggerLoad(true, id);
        return;
    }

    if (!piece) return;

    state.sessionSeen.add(piece.id);
    state.globalSeen.add(piece.id);
    saveGlobalHistory();

    document.body.classList.add('ui-locked');

    state.baseTheme = 'default';
    
    if (state.activeJourney) {
        dom.buttons.skip.classList.add('visible');
        const journey = JOURNEYS[state.activeJourney];
        if (journey.theme) state.baseTheme = journey.theme;
        if (journey.backdrop) window.AsciiBackdropSystem.start(journey.backdrop);
    } else {
        dom.buttons.skip.classList.remove('visible');
        if (piece.tags && piece.tags.includes('theme:burgundy')) state.baseTheme = 'burgundy';
        if (isNew && !enteringJourney) window.AsciiBackdropSystem.randomize(); 
    }
    
    updateTheme();

    // --- SKIP LOADER LOGIC ---
    if (skipLoader) {
        switchScreen('reader');
        document.body.classList.remove('ui-locked');
        
        // Add startup fade class
        dom.display.classList.add('startup-fade');
        
        requestAnimationFrame(() => {
             displayPiece(piece);
             updateFavButton(piece.id);
             
             // Cleanup class
             setTimeout(() => {
                 dom.display.classList.remove('startup-fade');
             }, 2500);
        });
        return;
    }

    // --- NORMAL LOADER LOGIC ---
    switchScreen('loader');
    
    dom.title.style.opacity = '0';
    dom.title.style.pointerEvents = 'none'; 
    if (dom.title.hoverInterval) clearInterval(dom.title.hoverInterval);
    dom.title.dataset.state = 'hidden';
    dom.title.classList.remove('revealed');
    
    let frames = POOLS.fallback[0]; 

    if (state.activeJourney && JOURNEYS[state.activeJourney].loaders) {
        const jLoaders = JOURNEYS[state.activeJourney].loaders;
        frames = jLoaders[Math.floor(Math.random() * jLoaders.length)];
    } else if (piece && POOLS[piece.type]) {
        const pool = POOLS[piece.type];
        frames = pool[Math.floor(Math.random() * pool.length)];
    } else {
        const pool = POOLS.fallback;
        frames = pool[Math.floor(Math.random() * pool.length)];
    }

    // --- GHOST MEASURE ---
    dom.loaderDisplay.style.opacity = '0';
    dom.loaderDisplay.style.width = 'auto';
    dom.loaderDisplay.style.height = 'auto';
    
    let maxW = 0;
    let maxH = 0;
    
    frames.forEach(frame => {
        dom.loaderDisplay.textContent = frame;
        const rect = dom.loaderDisplay.getBoundingClientRect();
        if(rect.width > maxW) maxW = rect.width;
        if(rect.height > maxH) maxH = rect.height;
    });
    
    dom.loaderDisplay.style.width = (maxW + 2) + 'px';
    dom.loaderDisplay.style.height = (maxH + 2) + 'px';
    
    dom.loaderDisplay.textContent = frames[0];
    dom.loaderDisplay.style.opacity = '1';

    let frameIdx = 1;
    const interval = setInterval(() => {
        dom.loaderDisplay.textContent = frames[frameIdx % frames.length];
        frameIdx++;
    }, 200);

    setTimeout(() => {
        clearInterval(interval);
        dom.loaderDisplay.textContent = "";
        dom.loaderDisplay.style.width = 'auto';
        dom.loaderDisplay.style.height = 'auto';
        
        switchScreen('reader');
        document.body.classList.remove('ui-locked');
        
        requestAnimationFrame(() => {
             displayPiece(piece);
             updateFavButton(piece.id);
        });
    }, 2000);
}

function exitJourney() {
    state.activeJourney = null;
    state.journeyIndex = -1;
    state.passagesSinceJourney = 0; 
    window.AsciiBackdropSystem.randomize();
    triggerLoad(true);
}

function goTrueRandom() {
    exitJourney(); // Ensure we aren't locked in a journey
    triggerLoad(true, null, true); // Force true random
}

function goBack() {
    if (state.view === 'intro') {
        prevIntroStep();
        return;
    }

    if (state.historyIndex > 0) {
        state.historyIndex--;
        triggerLoad(false);
    }
}

function goForward() {
    if (state.view === 'intro') {
        nextIntroStep();
        return;
    }

    if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        triggerLoad(false);
    } else {
        triggerLoad(true);
    }
}

// --- ANIMATION SYSTEM ---

const Scrambler = {
    chars: ["█", "▓", "▒", "░"],
    animate(element, finalString, callback) {
        // Clear any existing global interval before starting
        if (state.activeInterval) clearInterval(state.activeInterval);

        const maxDuration = 1000; 
        const speed = 40; 
        const startTime = Date.now();
        const resolveTimes = finalString.split('').map(() => Math.random() * maxDuration);

        state.activeInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            let output = "";
            let completeCount = 0;

            for (let i = 0; i < finalString.length; i++) {
                if (elapsed >= resolveTimes[i]) {
                    output += finalString[i];
                    completeCount++;
                } else {
                    output += this.randomChar();
                }
            }

            element.textContent = output;

            if (completeCount === finalString.length && elapsed > maxDuration) {
                clearInterval(state.activeInterval);
                state.activeInterval = null;
                element.textContent = finalString; 
                if(callback) callback();
            }
        }, speed);
    },
    animateTo(element, finalString, callback) {
        this.animate(element, finalString, callback);
    },
    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    },
    generateStatic(text) {
        return text.split('').map(c => c === ' ' ? ' ' : this.chars[Math.floor(Math.random() * this.chars.length)]).join('');
    }
};

function displayPiece(piece) {
    const display = dom.display;
    
    // Check AI status
    const isAI = piece.tags && piece.tags.includes('ai');
    const isHybrid = piece.tags && piece.tags.includes('hybrid');
    
    if (isAI || isHybrid) {
        dom.buttons.aiInd.classList.add('visible');
        dom.buttons.aiInd.dataset.tooltip = isHybrid ? "Hybrid (AI + Human)" : "Fully AI Generated";
    } else {
        dom.buttons.aiInd.classList.remove('visible');
    }

    // Ghost Measure: Use min-width/height in pixels for stability without breaking responsiveness
    display.style.opacity = '0';
    display.textContent = piece.content;
    // Reset any previous fixed dimensions
    display.style.width = 'auto'; 
    display.style.height = 'auto';
    display.style.minWidth = '0';
    display.style.minHeight = '0';
    
    const rect = display.getBoundingClientRect();
    
    // Set minimums to prevent shrinkage during animation
    display.style.minWidth = rect.width + 'px';
    display.style.minHeight = rect.height + 'px';
    
    // Position title container dynamically based on measured content height
    dom.titleContainer.style.top = `calc(50% + ${rect.height / 2}px + 2.5rem)`;
    
    if (piece.type !== 'barcode') {
        display.textContent = ''; 
    }
    
    display.style.opacity = '1';

    // TITLE PREP
    const titleEl = dom.title;
    if(state.showTitles && piece.title && piece.title !== "Untitled") {
        titleEl.classList.remove('hidden');
        titleEl.dataset.staticNoise = Scrambler.generateStatic(piece.title);
        titleEl.dataset.state = 'hidden'; 
        titleEl.dataset.disableHover = ''; 
        titleEl.textContent = titleEl.dataset.staticNoise;
        titleEl.style.opacity = '0'; 
        titleEl.style.pointerEvents = 'none'; 
        
        if(titleEl.hoverInterval) clearInterval(titleEl.hoverInterval);
        
        titleEl.onmouseenter = () => {
            if(titleEl.dataset.state === 'hidden' && !titleEl.dataset.disableHover) {
                titleEl.hoverInterval = setInterval(() => {
                    const currentText = titleEl.textContent.split('');
                    const count = Math.ceil(currentText.length * 0.3);
                    for(let k=0; k<count; k++) {
                        const idx = Math.floor(Math.random() * currentText.length);
                        if(currentText[idx] !== ' ') currentText[idx] = Scrambler.randomChar();
                    }
                    titleEl.textContent = currentText.join('');
                }, 150); 
            }
        };
        
        titleEl.onmouseleave = () => {
            if(titleEl.hoverInterval) clearInterval(titleEl.hoverInterval);
            titleEl.dataset.disableHover = '';
            
            if(titleEl.dataset.state === 'hidden') {
                 titleEl.textContent = titleEl.dataset.staticNoise;
            }
        };
        
        titleEl.onclick = () => {
            if(titleEl.hoverInterval) clearInterval(titleEl.hoverInterval);
            
            if(titleEl.dataset.state === 'hidden') {
                Scrambler.animateTo(titleEl, piece.title);
                titleEl.dataset.state = 'revealed';
                titleEl.classList.add('revealed');
            } else {
                Scrambler.animateTo(titleEl, titleEl.dataset.staticNoise);
                titleEl.dataset.state = 'hidden';
                titleEl.classList.remove('revealed');
                titleEl.dataset.disableHover = 'true';
            }
        };
    } else {
        titleEl.classList.add('hidden');
    }

    const onAnimationComplete = () => {
        // Unlock dimensions so it scales freely
        display.style.minWidth = '0';
        display.style.minHeight = '0';

        if(state.showTitles && piece.title && piece.title !== "Untitled") {
            titleEl.style.opacity = '0.8';
            titleEl.style.pointerEvents = 'auto';
        }
    };

    // Use unified animation function for ALL types
    animatePiece(display, piece, onAnimationComplete);
}

// --- UTILS ---

function saveGlobalHistory() {
    localStorage.setItem('unicoda_global_seen', JSON.stringify(Array.from(state.globalSeen)));
}

function toggleFavorite() {
    if (state.historyIndex === -1 && !state.activeJourney) return;
    
    const currentId = state.history[state.historyIndex];
    if (currentId.includes(':') && !currentId.startsWith('gateway')) return;

    const idx = state.favorites.indexOf(currentId);
    if (idx === -1) { state.favorites.push(currentId); } 
    else { state.favorites.splice(idx, 1); }
    updateFavButton(currentId);
    localStorage.setItem('unicoda_favorites', JSON.stringify(state.favorites));
}

function updateFavButton(id) {
    if (state.favorites.includes(id)) {
        dom.buttons.fav.textContent = '★';
    } else {
        dom.buttons.fav.textContent = '☆';
    }
}

function openLists() { switchListTab(state.currentListTab); }

function switchListTab(tab) {
    state.currentListTab = tab;
    document.getElementById('tab-visited').classList.toggle('active', tab === 'visited');
    document.getElementById('tab-favorites').classList.toggle('active', tab === 'favorites');
    
    if (tab === 'visited') {
        // Show global history, reversed, limited to 15
        const allSeen = Array.from(state.globalSeen);
        renderList(allSeen.reverse().slice(0, 15));
    } else {
        renderList(state.favorites);
    }
}

function renderList(ids) {
    const container = document.getElementById('list-container');
    container.innerHTML = '';
    if (ids.length === 0) {
        container.innerHTML = '<div style="opacity:0.5; padding:1rem;">Nothing here yet.</div>';
        return;
    }
    // ids are already reversed/sliced coming in for Visited, but Favorites needs reversal
    // To be safe, we assume input is the exact list to display in order.
    // NOTE: Favorites are stored oldest->newest, so reverse them.
    // Visited passed from switchListTab is already reversed.
    // Let's handle reversal at call site or check here.
    
    // Simplest: just iterate. 
    ids.forEach(id => {
        let p;
        if (id.includes(':') && !id.startsWith('gateway')) {
             const [jName, jIdx] = id.split(':');
             if (JOURNEYS[jName] && JOURNEYS[jName].sequence[jIdx]) {
                 p = { ...JOURNEYS[jName].sequence[jIdx], id: id };
             }
        } else {
             p = LIBRARY.find(x => x.id === id);
        }

        if (p) {
            const div = document.createElement('div');
            div.className = 'list-item';
            const preview = p.content.replace(/\n/g, ' ').substring(0, 40);
            div.textContent = preview + (p.content.length > 40 ? '...' : '');
            div.onclick = () => { triggerLoad(true, p.id); toggleOverlay('lists', false); };
            container.appendChild(div);
        }
    });
}

function startIntro() { switchScreen('intro'); renderIntro(); }

function renderIntro() {
    const introContent = document.getElementById('intro-content');
    const step = INTRO_DATA[state.introStep];
    
    introContent.innerHTML = ''; // Clear previous content
    
    let exampleData = null;
    let exampleContainer = null;
    
    step.content.forEach(part => {
        if (part.type === 'title') {
            const titleDiv = document.createElement('div');
            titleDiv.className = 'intro-title';
            titleDiv.textContent = part.text;
            introContent.appendChild(titleDiv);
        } else if (part.type === 'text') {
            const textDiv = document.createElement('div');
            textDiv.className = 'intro-text';
            
            const html = part.text
                .replace(/\n/g, '<br>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/%\{(.*?)\}%/g, '<span class="intro-link">$1</span>');

            textDiv.innerHTML = html;
            introContent.appendChild(textDiv);
        } else if (part.type === 'example') {
            exampleContainer = document.createElement('div');
            exampleContainer.className = 'intro-example';
            const pre = document.createElement('pre');
            exampleContainer.appendChild(pre);
            introContent.appendChild(exampleContainer);
            exampleData = part.data;
        }
    });
    
    if (exampleData && exampleContainer) {
        const exampleEl = exampleContainer.querySelector('pre');
        requestAnimationFrame(() => {
            exampleEl.style.opacity = '0';
            exampleEl.textContent = exampleData.content;
            const rect = exampleEl.getBoundingClientRect();
            exampleContainer.style.width = rect.width + 'px';
            exampleContainer.style.height = rect.height + 'px';
            exampleEl.textContent = '';
            exampleEl.style.opacity = '1';

            animatePiece(exampleEl, exampleData);
        });
    }
}

function animatePiece(element, piece, onComplete) {
    // 1. Increment ID: This invalidates all previous running loops
    state.activeAnimationId++;
    const runId = state.activeAnimationId;

    // 2. Clear any active intervals (for Scrambler/Barcodes)
    if (state.activeInterval) {
        clearInterval(state.activeInterval);
        state.activeInterval = null;
    }

    if (piece.type === 'barcode') {
        Scrambler.animate(element, piece.content, onComplete);
    } 
    else if (piece.type === 'geode') {
        const lines = piece.content.split('\n');
        let idx = 0;
        function drill() {
            // SUICIDE CHECK: If ID has changed, stop immediately
            if (runId !== state.activeAnimationId) return;

            if (idx < lines.length) {
                element.textContent += (idx > 0 ? '\n' : '') + lines[idx];
                idx++;
                setTimeout(drill, 300);
            } else if (onComplete) {
                onComplete();
            }
        }
        drill();
    } 
    else if (piece.type === 'current') {
        let i = 0;
        function flow() {
            // SUICIDE CHECK
            if (runId !== state.activeAnimationId) return;

            if (i < piece.content.length) {
                element.textContent += piece.content.charAt(i);
                i++;
                setTimeout(flow, 40);
            } else if (onComplete) {
                onComplete();
            }
        }
        flow();
    } 
}

function transitionIntro(stepFunction) {
    const introContent = document.getElementById('intro-content');
    introContent.classList.add('fading-out');
    
    setTimeout(() => {
        stepFunction();
        requestAnimationFrame(() => {
            introContent.classList.remove('fading-out');
        });
    }, 200); // Match this with CSS transition duration
}

function prevIntroStep() {
    if (state.introStep > 0) {
        transitionIntro(() => {
            state.introStep--;
            renderIntro();
        });
    }
}

function nextIntroStep() { 
    if (state.introStep < INTRO_DATA.length - 1) {
        transitionIntro(() => {
            state.introStep++;
            renderIntro();
        });
    } else {
        finishIntro();
    }
}

function finishIntro() { 
    state.seenIntro = true; 
    localStorage.setItem('unicoda_seen_intro', 'true'); 
    enterReader(); 
}

function enterReader(skipLoader = false) {
    switchScreen('reader');
    triggerLoad(true, null, false, skipLoader);
}

init();