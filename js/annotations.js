/**
 * UNICODA ANNOTATIONS SYSTEM
 * Adapted from Smiley Annotations v23.11.20
 * 
 * Features: Cluster Physics, Snapping, Minimization, Raw Text editing.
 */

const SA_Constants = {
    DEBOUNCE_MS: 500,
    BASE_Z_INDEX: 1000,
    MIN_WIDTH: 200,
    MIN_HEIGHT: 140,
    SNAP_THRESHOLD: 32,
    SNAP_LANE: 60,
    FORCE_FIELD: 16,
    IDS: { CONTAINER: 'notes-layer', ICON_DEFS: 'sa-icon-definitions' }
};

const Annotations = {
    notes: [],
    selectedNotes: new Set(),
    globalMaxZ: SA_Constants.BASE_Z_INDEX,
    elementMap: new Map(),
    saveDebouncer: null,
    contentDebouncers: {},
    lastClickTime: 0,
    currentFontSize: 'medium', // small, medium, big

    // STATE
    drag: {
        active: false, target: null, startX: 0, startY: 0,
        offsetX: 0, offsetY: 0, elWidth: 0, elHeight: 0,
        currentX: 0, currentY: 0, rafId: null, pointerId: null,
        noteData: null, snapTargets: [], clusterOffsets: {},
        clusterBounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 }
    },
    resize: {
        active: false, target: null, startX: 0, startY: 0,
        initialW: 0, initialH: 0, initialLeft: 0, initialTop: 0,
        currentX: 0, currentY: 0, rafId: null, pointerId: null,
        noteData: null, direction: '', snapTargets: []
    },
    math: {
        mRect: { left: 0, top: 0, right: 0, bottom: 0 },
        vector: { x: 0, y: 0 },
        viewport: { w: 0, h: 0 },
        cluster: []
    },

    // --- INITIALIZATION ---
    init() {
        this.container = document.getElementById(SA_Constants.IDS.CONTAINER);
        if (!this.container) return;

        // Load Settings
        this.currentFontSize = localStorage.getItem('unicoda_note_size') || 'medium';

        // Load Data
        this.loadNotes();

        // Render Existing
        this.notes.forEach(noteData => {
            const el = this.createNoteElement(noteData);
            this.container.appendChild(el);
        });

        // Event Listeners
        window.addEventListener('pointermove', (e) => {
            this.drag.currentX = e.clientX;
            this.drag.currentY = e.clientY;
            this.resize.currentX = e.clientX;
            this.resize.currentY = e.clientY;
        });

        window.addEventListener('pointerup', (e) => {
            if (this.drag.active) {
                cancelAnimationFrame(this.drag.rafId);
                this.handleDragEnd(e);
            }
            if (this.resize.active) {
                cancelAnimationFrame(this.resize.rafId);
                this.handleResizeEnd(e);
            }
        });

        // Deselection Logic: Click anywhere NOT a header to deselect
        window.addEventListener('pointerdown', (e) => {
            // If dragging or resizing, ignore
            if (this.drag.active || this.resize.active) return;
            
            // If clicking a header (or its children like buttons), do nothing (handled in createNoteElement)
            if (e.target.closest('.sa-header')) return;

            // If clicking inside a note body (editing), do nothing
            if (e.target.closest('.sa-note')) return;

            // Otherwise (background, UI, etc), clear group selection
            if (!e.shiftKey) this.clearSelection();
        });
    },

    // --- MATH HELPERS ---
    pxToPercent(px, axis) {
        const viewport = axis === 'x' ? window.innerWidth : window.innerHeight;
        return parseFloat(((px / viewport) * 100).toFixed(2));
    },

    percentToPx(percent, axis) {
        const viewport = axis === 'x' ? window.innerWidth : window.innerHeight;
        return (percent / 100) * viewport;
    },

    checkRectCollision(rect1, rect2) {
        const gap = SA_Constants.FORCE_FIELD;
        return !(rect1.right + gap <= rect2.left ||
                 rect1.left >= rect2.right + gap ||
                 rect1.bottom + gap <= rect2.top ||
                 rect1.top >= rect2.bottom + gap);
    },

    getOptimalAnchors(rect) {
        return {
            x: rect.left > (window.innerWidth * 0.70) ? 'right' : 'left',
            y: rect.top > (window.innerHeight * 0.70) ? 'bottom' : 'top'
        };
    },

    // --- PERSISTENCE ---
    loadNotes() {
        try {
            const raw = localStorage.getItem('unicoda_notes_metadata') || '[]';
            this.notes = JSON.parse(raw);
            this.notes.forEach(n => {
                if (n.zIndex > this.globalMaxZ) this.globalMaxZ = n.zIndex;
            });
        } catch (e) {
            this.notes = [];
        }
    },

    saveMetadata() {
        clearTimeout(this.saveDebouncer);
        this.saveDebouncer = setTimeout(() => {
            const data = this.notes.map(n => ({
                id: n.id, posX: n.posX, posY: n.posY, w: n.w, h: n.h,
                zIndex: n.zIndex, minimized: n.minimized,
                anchorX: n.anchorX, anchorY: n.anchorY,
                symbol: n.symbol // Save symbol for watermarks
            }));
            localStorage.setItem('unicoda_notes_metadata', JSON.stringify(data));
        }, SA_Constants.DEBOUNCE_MS);
    },

    loadContent(id) {
        return localStorage.getItem(`unicoda_note_content_${id}`) || '';
    },

    saveContent(id, text) {
        localStorage.setItem(`unicoda_note_content_${id}`, text);
    },

    triggerContentSave(id, element) {
        if (!this.contentDebouncers[id]) {
            this.contentDebouncers[id] = this.debounce((el) => {
                if (el) this.saveContent(id, el.value);
            }, SA_Constants.DEBOUNCE_MS);
        }
        this.contentDebouncers[id](element);
    },

    debounce(func, wait) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    },

    clearAllData() {
        localStorage.removeItem('unicoda_notes_metadata');
        this.notes.forEach(n => localStorage.removeItem(`unicoda_note_content_${n.id}`));
        this.notes = [];
        this.container.innerHTML = '';
        this.elementMap.clear();
    },

    setFontSize(size) {
        // size: 'small' | 'medium' | 'big'
        this.currentFontSize = size;
        localStorage.setItem('unicoda_note_size', size);
        this.container.querySelectorAll('.sa-note').forEach(el => {
            el.setAttribute('data-size', size);
        });
    },

    parseNoteFrontMatter(rawString) {
        const trimmed = rawString.trim();
        const parts = trimmed.split('---');

        if (parts.length < 2) {
            return { content: trimmed, props: {} };
        }

        const header = parts[0].trim();
        const content = parts.slice(1).join('---').trim();
        const headerLines = header.split('\n').map(line => line.trim()).filter(line => line);
        
        const props = {};
        
        // Parse key: value pairs from header
        headerLines.forEach(line => {
            if (line.includes(':')) {
                const [key, ...rest] = line.split(':');
                if (key && rest.length) {
                    props[key.trim().toLowerCase()] = rest.join(':').trim();
                }
            }
        });

        return { content, props };
    },

    // --- UI GENERATION ---
    createNoteElement(noteData) {
        const el = document.createElement('div');
        el.className = 'sa-note';
        
        // Initial Selection State
        if (this.selectedNotes.has(noteData.id)) {
            el.classList.add('sa-selected');
            if (this.selectedNotes.size > 1) el.classList.add('sa-group-selected');
        }
        
        // Apply current font size
        el.setAttribute('data-size', this.currentFontSize);

        el.dataset.id = noteData.id;
        el.style.width = `${noteData.w}px`;
        el.style.height = `${noteData.h}px`;
        el.style.zIndex = noteData.zIndex;
        
        this.elementMap.set(noteData.id, el);

        // Position
        if (noteData.anchorX === 'right') { el.style.right = `${noteData.posX}%`; el.style.left = 'auto'; }
        else { el.style.left = `${noteData.posX}%`; el.style.right = 'auto'; }
        
        if (noteData.anchorY === 'bottom') { el.style.bottom = `${noteData.posY}%`; el.style.top = 'auto'; }
        else { el.style.top = `${noteData.posY}%`; el.style.bottom = 'auto'; }

        // REMOVED HARDCODED THEME LOGIC
        // Visuals now rely on CSS variables inherited from body/root

        if (noteData.minimized) {
            el.classList.add('sa-minimized');
            el.dataset.fullHeight = noteData.h;
            el.style.height = '28px';
        }

        const savedContent = this.loadContent(noteData.id);
        const previewTitle = savedContent.split('\n')[0] || 'Empty Note';

        // Watermark Logic
        let watermarkHTML = '';
        if (noteData.symbol) {
            watermarkHTML = `<div class="sa-watermark">${noteData.symbol}</div>`;
        }

        const innerHTML = `
            <div class="sa-note-visual">
                <div class="sa-header">
                    <span class="sa-collapsed-title">${previewTitle}</span>
                    <div class="sa-actions">
                        <button class="sa-btn sa-min-btn" title="Minimize">
                            <svg class="sa-icon"><use href="#sa-icon-${noteData.minimized ? 'maximize' : 'minimize'}"></use></svg>
                        </button>
                        <button class="sa-btn sa-dup-btn" title="Duplicate">
                            <svg class="sa-icon"><use href="#sa-icon-copy"></use></svg>
                        </button>
                        <button class="sa-btn sa-close-btn" title="Close">
                            <svg class="sa-icon"><use href="#sa-icon-close"></use></svg>
                        </button>
                    </div>
                </div>
                <div class="sa-body">
                    ${watermarkHTML}
                    <textarea class="sa-raw-editor" spellcheck="false" placeholder="Type here...">${savedContent}</textarea>
                </div>
            </div>
            <!-- Corners -->
            <div class="sa-resize-handle sa-resize-br" data-dir="se"></div>
            <div class="sa-resize-handle sa-resize-bl" data-dir="sw"></div>
            <div class="sa-resize-handle sa-resize-tr" data-dir="ne"></div>
            <div class="sa-resize-handle sa-resize-tl" data-dir="nw"></div>
            <!-- Edges -->
            <div class="sa-resize-handle sa-resize-b" data-dir="s"></div>
            <div class="sa-resize-handle sa-resize-t" data-dir="n"></div>
            <div class="sa-resize-handle sa-resize-r" data-dir="e"></div>
            <div class="sa-resize-handle sa-resize-l" data-dir="w"></div>
        `;

        el.innerHTML = innerHTML;

        // Event Binding
        const editor = el.querySelector('.sa-raw-editor');
        const title = el.querySelector('.sa-collapsed-title');
        
        editor.addEventListener('input', (e) => {
            title.textContent = e.target.value.split('\n')[0] || 'Empty Note';
            this.triggerContentSave(noteData.id, e.target);
        });

        // Header Interactions
        const header = el.querySelector('.sa-header');
        header.addEventListener('pointerdown', (e) => {
            if (e.target.closest('button')) return;
            
            // Double Click check
            const now = Date.now();
            if (now - this.lastClickTime < 300) {
                this.toggleMinimize(el, noteData);
                this.lastClickTime = 0;
                return; 
            }
            this.lastClickTime = now;

            // Selection Logic
            if (e.shiftKey) {
                if (this.selectedNotes.has(noteData.id)) {
                    this.selectedNotes.delete(noteData.id);
                    el.classList.remove('sa-selected');
                } else {
                    this.selectedNotes.add(noteData.id);
                    el.classList.add('sa-selected');
                }
            } else if (!this.selectedNotes.has(noteData.id)) {
                this.clearSelection();
                this.selectedNotes.add(noteData.id);
                el.classList.add('sa-selected');
            }
            
            // Bring this note to front visually regardless of selection state
            this.bringToFront(el, noteData);
            
            // Update Visual Borders based on group size
            this.updateSelectionVisuals();

            this.startDrag(e, el, noteData);
        });

        // Buttons
        el.querySelector('.sa-close-btn').addEventListener('click', () => this.deleteNote(noteData));
        el.querySelector('.sa-dup-btn').addEventListener('click', () => this.duplicateNote(noteData));
        el.querySelector('.sa-min-btn').addEventListener('click', () => this.toggleMinimize(el, noteData));

        // Resize Handles
        el.querySelectorAll('.sa-resize-handle').forEach(handle => {
            handle.addEventListener('pointerdown', (e) => {
                this.bringToFront(el, noteData);
                this.startResize(e, el, noteData, handle.dataset.dir);
            });
        });

        return el;
    },

    updateSelectionVisuals() {
        const isMulti = this.selectedNotes.size > 1;
        this.container.querySelectorAll('.sa-note').forEach(n => {
            if (this.selectedNotes.has(n.dataset.id)) {
                if (isMulti) n.classList.add('sa-group-selected');
                else n.classList.remove('sa-group-selected');
            } else {
                n.classList.remove('sa-group-selected', 'sa-selected');
            }
        });
    },

    createNote() {
        const id = 'note-' + Date.now().toString(36);
        const force = SA_Constants.FORCE_FIELD;
        
        // LOGIC CHANGE: RNG Check for Rare Note (18%)
        let content = "";
        let symbol = null;
        
        if (Math.random() < 0.18 && typeof RAW_RARE_NOTES !== 'undefined' && RAW_RARE_NOTES.length > 0) {
            const raw = RAW_RARE_NOTES[Math.floor(Math.random() * RAW_RARE_NOTES.length)];
            const parsed = this.parseNoteFrontMatter(raw);
            content = parsed.content;
            symbol = parsed.props.symbol || null;
        }

        let spawnX = window.innerWidth / 2 - 125;
        let spawnY = window.innerHeight / 2 - 125;
        let angle = 0;
        let radius = 0;
        let foundSpot = false;
        let iterations = 0;

        const existingRects = Array.from(this.container.querySelectorAll('.sa-note')).map(n => n.getBoundingClientRect());

        while (!foundSpot && iterations < 50) {
            let candidate = { left: spawnX, top: spawnY, right: spawnX+250, bottom: spawnY+200 };
            let collision = false;
            for (let r of existingRects) {
                if (this.checkRectCollision(candidate, r)) { collision = true; break; }
            }
            if (!collision) foundSpot = true;
            else {
                angle += 0.5; radius += 60;
                spawnX = (window.innerWidth / 2 - 125) + Math.cos(angle) * radius;
                spawnY = (window.innerHeight / 2 - 125) + Math.sin(angle) * radius;
                iterations++;
            }
        }

        spawnX = Math.max(force, Math.min(spawnX, window.innerWidth - 250 - force));
        spawnY = Math.max(force, Math.min(spawnY, window.innerHeight - 200 - force));

        const noteData = {
            id: id,
            posX: this.pxToPercent(spawnX, 'x'),
            posY: this.pxToPercent(spawnY, 'y'),
            w: 250, h: 200,
            zIndex: ++this.globalMaxZ,
            anchorX: 'left', anchorY: 'top',
            minimized: false,
            symbol: symbol // Store the watermark symbol if present
        };

        this.notes.push(noteData);
        // CRITICAL FIX: Save content BEFORE creating element so loadContent() finds it
        this.saveContent(id, content);
        
        const el = this.createNoteElement(noteData);
        this.container.appendChild(el);
        this.saveMetadata();
        
        // Auto-focus logic
        this.clearSelection();
        this.selectedNotes.add(id);
        el.classList.add('sa-selected');
    },

    spawnRareNote(rawString) {
        // Parse the raw string using Front Matter format
        const { content, props } = this.parseNoteFrontMatter(rawString);
        
        const id = 'rare-' + Date.now().toString(36);
        const force = SA_Constants.FORCE_FIELD;
        
        let spawnX = window.innerWidth / 2 - 125;
        let spawnY = window.innerHeight / 2 - 125;
        let angle = 0;
        let radius = 0;
        let foundSpot = false;
        let iterations = 0;

        const existingRects = Array.from(this.container.querySelectorAll('.sa-note')).map(n => n.getBoundingClientRect());

        while (!foundSpot && iterations < 50) {
            let candidate = { left: spawnX, top: spawnY, right: spawnX+250, bottom: spawnY+200 };
            let collision = false;
            for (let r of existingRects) {
                if (this.checkRectCollision(candidate, r)) { collision = true; break; }
            }
            if (!collision) foundSpot = true;
            else {
                angle += 0.5; radius += 60;
                spawnX = (window.innerWidth / 2 - 125) + Math.cos(angle) * radius;
                spawnY = (window.innerHeight / 2 - 125) + Math.sin(angle) * radius;
                iterations++;
            }
        }

        spawnX = Math.max(force, Math.min(spawnX, window.innerWidth - 250 - force));
        spawnY = Math.max(force, Math.min(spawnY, window.innerHeight - 200 - force));

        const noteData = {
            id: id,
            posX: this.pxToPercent(spawnX, 'x'),
            posY: this.pxToPercent(spawnY, 'y'),
            w: 250, h: 250, // Slightly taller for content
            theme: props.theme || 'Simple Light', // Use theme from front matter or default
            symbol: props.symbol || null, // Use symbol from front matter
            zIndex: ++this.globalMaxZ,
            anchorX: 'left', anchorY: 'top',
            minimized: false
        };

        this.notes.push(noteData);
        // CRITICAL FIX: Save content BEFORE creating element
        this.saveContent(id, content);

        const el = this.createNoteElement(noteData);
        this.container.appendChild(el);
        this.saveMetadata();
        
        // Highlight it
        this.clearSelection();
        this.selectedNotes.add(id);
        el.classList.add('sa-selected');
    },

    duplicateNote(noteData) {
        const id = 'note-' + Date.now().toString(36);
        const newNote = { ...noteData, id: id, posX: noteData.posX + 2, posY: noteData.posY + 2, zIndex: ++this.globalMaxZ };
        const content = this.loadContent(noteData.id);
        
        this.saveContent(id, content);
        this.notes.push(newNote);
        this.container.appendChild(this.createNoteElement(newNote));
        this.saveMetadata();
    },

    deleteNote(noteData) {
        const el = this.elementMap.get(noteData.id);
        if (el) {
            el.classList.add('sa-closing');
            setTimeout(() => el.remove(), 300);
        }
        this.notes = this.notes.filter(n => n.id !== noteData.id);
        this.elementMap.delete(noteData.id);
        this.selectedNotes.delete(noteData.id);
        localStorage.removeItem(`unicoda_note_content_${noteData.id}`);
        this.saveMetadata();
    },

    clearSelection() {
        this.selectedNotes.clear();
        this.container.querySelectorAll('.sa-note').forEach(n => {
            n.classList.remove('sa-selected', 'sa-group-selected');
        });
    },

    bringToFront(el, noteData) {
        noteData.zIndex = ++this.globalMaxZ;
        el.style.zIndex = noteData.zIndex;
        this.saveMetadata();
    },

    toggleMinimize(el, noteData) {
        noteData.minimized = !noteData.minimized;
        const rect = el.getBoundingClientRect();
        
        el.style.top = `${rect.top}px`;
        el.style.left = `${rect.left}px`;
        el.style.right = 'auto'; el.style.bottom = 'auto';

        if (noteData.minimized) {
            el.dataset.fullHeight = noteData.h;
            el.style.height = '28px';
            el.classList.add('sa-minimized', 'sa-animating-height');
            el.querySelector('.sa-min-btn use').setAttribute('href', '#sa-icon-maximize');
            el.addEventListener('transitionend', () => el.classList.remove('sa-animating-height'), {once:true});
        } else {
            el.classList.remove('sa-minimized');
            el.style.height = `${el.dataset.fullHeight}px`;
            el.classList.add('sa-animating-height');
            el.querySelector('.sa-min-btn use').setAttribute('href', '#sa-icon-minimize');
            el.addEventListener('transitionend', () => {
                el.classList.remove('sa-animating-height');
                const finalRect = el.getBoundingClientRect();
                const anchors = this.getOptimalAnchors(finalRect);
                noteData.anchorX = anchors.x;
                noteData.anchorY = anchors.y;
                noteData.w = finalRect.width; noteData.h = finalRect.height;
                if (anchors.x === 'right') {
                    noteData.posX = this.pxToPercent(window.innerWidth - finalRect.right, 'x');
                    el.style.right = `${noteData.posX}%`; el.style.left = 'auto';
                } else {
                    noteData.posX = this.pxToPercent(finalRect.left, 'x');
                    el.style.left = `${noteData.posX}%`; el.style.right = 'auto';
                }
                if (anchors.y === 'bottom') {
                    noteData.posY = this.pxToPercent(window.innerHeight - finalRect.bottom, 'y');
                    el.style.bottom = `${noteData.posY}%`; el.style.top = 'auto';
                } else {
                    noteData.posY = this.pxToPercent(finalRect.top, 'y');
                    el.style.top = `${noteData.posY}%`; el.style.bottom = 'auto';
                }
                this.saveMetadata();
            }, {once:true});
        }
        this.saveMetadata();
    },

    // --- PHYSICS ENGINE (Drag/Resize) ---
    startDrag(e, el, data) {
        this.drag.active = true;
        this.drag.target = el;
        this.drag.noteData = data;
        this.drag.startX = e.clientX;
        this.drag.startY = e.clientY;
        this.drag.pointerId = e.pointerId;

        const rect = el.getBoundingClientRect();
        this.drag.elWidth = rect.width;
        this.drag.elHeight = rect.height;
        this.drag.offsetX = e.clientX - rect.left;
        this.drag.offsetY = e.clientY - rect.top;

        el.setPointerCapture(e.pointerId);
        document.body.classList.add('sa-global-dragging');
        el.classList.add('sa-dragging');
        el.style.willChange = 'transform';

        this.drag.clusterOffsets = {};
        if (this.selectedNotes.size > 1) {
            this.selectedNotes.forEach(id => {
                if (id === data.id) return;
                const otherEl = this.elementMap.get(id);
                if (otherEl) {
                    const r = otherEl.getBoundingClientRect();
                    this.drag.clusterOffsets[id] = {
                        x: r.left - rect.left,
                        y: r.top - rect.top,
                        w: r.width, h: r.height, el: otherEl
                    };
                    otherEl.classList.add('sa-dragging');
                    otherEl.style.willChange = 'transform';
                }
            });
        }

        this.drag.snapTargets = [];
        this.container.querySelectorAll('.sa-note').forEach(n => {
            const nid = n.dataset.id;
            if (n !== el && !this.selectedNotes.has(nid) && !n.classList.contains('sa-closing')) {
                const r = n.getBoundingClientRect();
                this.drag.snapTargets.push({
                    left: r.left, right: r.right, top: r.top, bottom: r.bottom
                });
            }
        });

        this.math.viewport = { w: window.innerWidth, h: window.innerHeight };
        this.drag.rafId = requestAnimationFrame(this.dragLoop.bind(this));
    },

    dragLoop() {
        if (!this.drag.active) return;

        const { currentX, currentY, startX, startY, offsetX, offsetY, elWidth, elHeight } = this.drag;
        const viewW = this.math.viewport.w;
        const viewH = this.math.viewport.h;
        const force = SA_Constants.FORCE_FIELD;

        let newLeft = currentX - offsetX;
        let newTop = currentY - offsetY;

        newLeft = Math.max(force, Math.min(newLeft, viewW - elWidth - force));
        newTop = Math.max(force, Math.min(newTop, viewH - elHeight - force));

        const mRect = { left: newLeft, top: newTop, right: newLeft + elWidth, bottom: newTop + elHeight };
        
        for (const target of this.drag.snapTargets) {
            if (this.checkRectCollision(mRect, target)) {
                const overlapLeft = (mRect.right + force) - target.left;
                const overlapRight = (target.right + force) - mRect.left;
                const overlapTop = (mRect.bottom + force) - target.top;
                const overlapBottom = (target.bottom + force) - mRect.top;

                const pushX = (overlapLeft < overlapRight) ? -overlapLeft : overlapRight;
                const pushY = (overlapTop < overlapBottom) ? -overlapTop : overlapBottom;

                if (Math.abs(pushX) <= Math.abs(pushY)) newLeft += pushX;
                else newTop += pushY;

                newLeft = Math.max(force, Math.min(newLeft, viewW - elWidth - force));
                newTop = Math.max(force, Math.min(newTop, viewH - elHeight - force));
                mRect.left = newLeft; mRect.top = newTop;
                mRect.right = newLeft + elWidth; mRect.bottom = newTop + elHeight;
            }
        }

        const thresh = SA_Constants.SNAP_THRESHOLD;
        const lane = SA_Constants.SNAP_LANE;

        for (const target of this.drag.snapTargets) {
            const inV = (newTop < target.bottom + lane) && (newTop + elHeight > target.top - lane);
            const inH = (newLeft < target.right + lane) && (newLeft + elWidth > target.left - lane);

            if (inV) {
                if (Math.abs((target.left - force) - (newLeft + elWidth)) < thresh) newLeft = target.left - elWidth - force;
                else if (Math.abs((target.right + force) - newLeft) < thresh) newLeft = target.right + force;
            }
            if (inH) {
                if (Math.abs((target.top - force) - (newTop + elHeight)) < thresh) newTop = target.top - elHeight - force;
                else if (Math.abs((target.bottom + force) - newTop) < thresh) newTop = target.bottom + force;
            }
        }

        const tx = newLeft - (startX - offsetX);
        const ty = newTop - (startY - offsetY);

        this.drag.target.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
        Object.values(this.drag.clusterOffsets).forEach(o => {
            o.el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
        });

        this.drag.rafId = requestAnimationFrame(this.dragLoop.bind(this));
    },

    handleDragEnd() {
        document.body.classList.remove('sa-global-dragging');
        const el = this.drag.target;
        if (el) {
            el.releasePointerCapture(this.drag.pointerId);
            el.classList.remove('sa-dragging');
            el.style.willChange = '';
            
            const rect = el.getBoundingClientRect();
            el.style.transform = 'none';
            
            this.finalizePosition(el, this.drag.noteData, rect);

            Object.keys(this.drag.clusterOffsets).forEach(id => {
                const off = this.drag.clusterOffsets[id];
                off.el.style.transform = 'none';
                const offRect = off.el.getBoundingClientRect();
                const nData = this.notes.find(n => n.id === id);
                if (nData) this.finalizePosition(off.el, nData, offRect);
            });

            this.saveMetadata();
        }
        this.drag.active = false;
        this.drag.target = null;
    },

    finalizePosition(el, data, rect) {
        const anchors = this.getOptimalAnchors(rect);
        data.anchorX = anchors.x;
        data.anchorY = anchors.y;

        if (anchors.x === 'right') {
            data.posX = this.pxToPercent(window.innerWidth - rect.right, 'x');
            el.style.right = `${data.posX}%`; el.style.left = 'auto';
        } else {
            data.posX = this.pxToPercent(rect.left, 'x');
            el.style.left = `${data.posX}%`; el.style.right = 'auto';
        }
        if (anchors.y === 'bottom') {
            data.posY = this.pxToPercent(window.innerHeight - rect.bottom, 'y');
            el.style.bottom = `${data.posY}%`; el.style.top = 'auto';
        } else {
            data.posY = this.pxToPercent(rect.top, 'y');
            el.style.top = `${data.posY}%`; el.style.bottom = 'auto';
        }
    },

    startResize(e, el, data, dir) {
        e.stopPropagation();
        this.resize.active = true;
        this.resize.target = el;
        this.resize.noteData = data;
        this.resize.direction = dir;
        this.resize.startX = e.clientX;
        this.resize.startY = e.clientY;
        this.resize.pointerId = e.pointerId;

        el.setPointerCapture(e.pointerId);
        document.body.classList.add('sa-global-dragging');
        el.classList.add('sa-resizing');

        const rect = el.getBoundingClientRect();
        this.resize.initialW = rect.width;
        this.resize.initialH = rect.height;
        this.resize.initialLeft = rect.left;
        this.resize.initialTop = rect.top;

        el.style.right = 'auto'; el.style.bottom = 'auto';
        el.style.left = `${rect.left}px`; el.style.top = `${rect.top}px`;

        this.math.viewport = { w: window.innerWidth, h: window.innerHeight };
        this.resize.rafId = requestAnimationFrame(this.resizeLoop.bind(this));
    },

    resizeLoop() {
        if (!this.resize.active) return;
        const { currentX, currentY, startX, startY, initialW, initialH, initialLeft, initialTop, direction } = this.resize;
        
        const dx = currentX - startX;
        const dy = currentY - startY;
        
        let newW = initialW;
        let newH = initialH;
        let newTop = initialTop;
        let newLeft = initialLeft;

        if (direction.includes('n')) { newH = initialH - dy; newTop = initialTop + dy; }
        if (direction.includes('s')) { newH = initialH + dy; }
        if (direction.includes('w')) { newW = initialW - dx; newLeft = initialLeft + dx; }
        if (direction.includes('e')) { newW = initialW + dx; }

        if (newW < SA_Constants.MIN_WIDTH) {
            if (direction.includes('w')) newLeft = initialLeft + (initialW - SA_Constants.MIN_WIDTH);
            newW = SA_Constants.MIN_WIDTH;
        }
        if (newH < SA_Constants.MIN_HEIGHT) {
            if (direction.includes('n')) newTop = initialTop + (initialH - SA_Constants.MIN_HEIGHT);
            newH = SA_Constants.MIN_HEIGHT;
        }

        this.resize.target.style.width = `${newW}px`;
        this.resize.target.style.height = `${newH}px`;
        this.resize.target.style.left = `${newLeft}px`;
        this.resize.target.style.top = `${newTop}px`;

        this.resize.rafId = requestAnimationFrame(this.resizeLoop.bind(this));
    },

    handleResizeEnd() {
        document.body.classList.remove('sa-global-dragging');
        const el = this.resize.target;
        const data = this.resize.noteData;

        if (el) {
            el.releasePointerCapture(this.resize.pointerId);
            el.classList.remove('sa-resizing');
            
            const rect = el.getBoundingClientRect();
            data.w = rect.width;
            data.h = rect.height;
            this.finalizePosition(el, data, rect);
            this.saveMetadata();
        }
        this.resize.active = false;
        this.resize.target = null;
    }
};

window.AnnotationsSystem = Annotations;