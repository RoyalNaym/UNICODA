/**
 * ASCII Background System
 * Full adaptation of reference shader logic.
 */

const PATTERN_CONFIG = {
    patterns: {
        museum: (x, y, t, w, h) => {
            const tile_x = Math.floor(x / 8);
            const tile_y = Math.floor(y / 6);
            const checkerboard = (tile_x + tile_y) % 2 ? 0.3 : -0.3;
            const ornament = Math.sin(tile_x * 0.5 + t * 0.08) * Math.cos(tile_y * 0.4 + t * 0.06) * 0.4;
            const institutional_hum = Math.sin(x * 0.02 + y * 0.025 + t * 0.03) * 0.15;
            return checkerboard + ornament + institutional_hum;
        },
        transformation: (x, y, t, w, h) => {
            const progress = (Math.sin(t * 0.25) + 1) * 0.5;
            const centers = [
                {x: w * 0.5, y: h * 0.3, radius: 8 + progress * 12},
                {x: w * 0.4, y: h * 0.7, radius: 6 + progress * 10},
                {x: w * 0.6, y: h * 0.5, radius: 10 + progress * 8}
            ];
            let value = 0;
            centers.forEach((center, i) => {
                const dx = x - center.x;
                const dy = y - center.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const expansion = Math.sin(dist * 0.3 - t * 0.8 - i * 0.5);
                const intensity = 1 / (1 + dist * 0.1);
                const strain = Math.sin(dist - center.radius + t * 0.3) * Math.exp(-((dist - center.radius) ** 2) * 0.01);
                value += (expansion * intensity + strain) * 0.3;
            });
            return value;
        },
        hieroglyph: (x, y, t, w, h) => {
            const pyramid_grid = Math.sin(x * 0.4 + y * 0.4) * Math.cos(x * 0.2 - y * 0.2);
            const symbol_blocks = Math.sin(Math.floor(x / 6) * 1.2 + Math.floor(y / 4) * 0.8 + t * 0.1) * Math.cos(Math.floor(x / 8) * 0.9 + Math.floor(y / 5) * 1.1);
            const papyrus_texture = Math.sin(x * 0.7 + t * 0.05) * Math.cos(y * 0.5 + t * 0.08) * 0.2;
            const strata = Math.sin(y * 0.2 + t * 0.12) * Math.exp(-Math.abs(y - h/2) * 0.02);
            const cx = w / 2, cy = h / 2;
            const oval_dist = Math.sqrt((x - cx) ** 2 * 0.5 + (y - cy) ** 2);
            const cartouche = Math.sin(oval_dist * 0.3 + t * 0.4) * Math.exp(-Math.abs(oval_dist - h * 0.3) * 0.05);
            return pyramid_grid * 0.3 + symbol_blocks * 0.4 + papyrus_texture + strata * 0.3 + cartouche * 0.4;
        },
        salon: (x, y, t, w, h) => {
            const conversation_ripples = Math.sin(x * 0.3 + t * 0.6) * Math.cos(y * 0.25 + t * 0.4);
            let fan_pattern = 0;
            [{x: w * 0.1, y: h * 0.1, spread: Math.PI / 3}, {x: w * 0.9, y: h * 0.1, spread: Math.PI / 3}, {x: w * 0.5, y: h * 0.9, spread: Math.PI / 4}].forEach((fan, i) => {
                const dx = x - fan.x, dy = y - fan.y, angle = Math.atan2(dy, dx), dist = Math.sqrt(dx * dx + dy * dy);
                fan_pattern += (Math.sin(angle / fan.spread * 8 + t * 0.2 + i * 0.5) * Math.exp(-dist * 0.03) * (Math.abs(angle) < fan.spread ? 1 : 0)) * 0.3;
            });
            const social_web = Math.sin(x * 0.2 + y * 0.15 + t * 0.3) * Math.cos(x * 0.15 - y * 0.2 + t * 0.25);
            const sparkle = Math.sin(x * 1.2 + t * 1.8) * Math.sin(y * 1.1 + t * 1.5) * Math.sin(t * 2.0) * 0.2;
            return conversation_ripples * 0.4 + fan_pattern + social_web * 0.3 + sparkle;
        },
        temporal: (x, y, t, w, h) => {
            const flow_forward = Math.sin(x * 0.3 - t * 0.8) * Math.cos(y * 0.2);
            const flow_backward = Math.sin(x * 0.3 + t * 0.8) * Math.cos(y * 0.2) * 0.5;
            const time_ripples = Math.sin((x + y) * 0.2 + t * 0.4) * 0.3;
            return flow_forward * 0.6 + flow_backward + time_ripples;
        },
        occult: (x, y, t, w, h) => {
            const centerX = w / 2, centerY = h / 2, dx = x - centerX, dy = y - centerY, circle_dist = Math.sqrt(dx * dx + dy * dy);
            const ritual_circle = Math.sin(circle_dist * 0.2 + t * 0.3) * (Math.abs(circle_dist - h * 0.3) < 3 ? 1 : 0.1);
            const pentagram = Math.sin(Math.atan2(dy, dx) * 5 + t * 0.5) * Math.exp(-Math.abs(circle_dist - h * 0.25) * 0.1);
            const emanations = Math.sin(x * 0.15 + y * 0.12 - t * 0.7) * Math.cos(x * 0.12 - y * 0.15 + t * 0.8) * Math.sin(t * 0.4);
            const symbols = Math.sin(Math.floor(x / 7) * 2.3 + Math.floor(y / 6) * 1.9 + t * 0.1) * Math.cos(Math.floor(x / 8) * 1.7 + Math.floor(y / 9) * 2.1) * 0.3;
            const tendrils = Math.sin(dx * 0.1 + dy * 0.08 + t * 0.6) * Math.cos(dx * 0.08 - dy * 0.1 + t * 0.9) * Math.exp(-circle_dist * 0.02);
            return ritual_circle * 0.4 + pentagram * 0.5 + emanations * 0.4 + symbols + tendrils * 0.3;
        },
        lace: (x, y, t, w, h) => {
            const cx = w/2, cy = h/2, dx = x-cx, dy = y-cy, radius = Math.sqrt(dx*dx+dy*dy), angle = Math.atan2(dy, dx);
            const petals = Math.sin(angle * 6 + t * 0.3) * Math.cos(radius * 0.4 - t * 0.2);
            const doily = Math.sin(radius * 0.6 + t * 0.1) * Math.cos(angle * 8 - t * 0.4);
            const filigree = Math.sin(dx * 0.5 + dy * 0.3 + t * 0.5) * 0.3;
            return petals * 0.4 + doily * 0.4 + filigree;
        },
        abundance: (x, y, t, w, h) => {
            const cx = w/2, cy = h/2, dist = Math.sqrt((x-cx)**2 + (y-cy)**2);
            const growth = Math.sin(t * 0.3) * 0.5 + 1;
            const rings = Math.sin(dist * 0.15 * growth - t * 0.4);
            const branch1 = Math.sin(x * 0.2 + t * 0.2) * Math.cos(y * 0.15 + t * 0.3);
            const branch2 = Math.cos(x * 0.1 + y * 0.1 + t * 0.25);
            return rings * 0.5 + branch1 * 0.3 + branch2 * 0.2;
        },
        wraiths: (x, y, t, w, h) => {
            const drift1 = Math.sin(x * 0.1 + y * 0.05 + t * 0.4) * Math.exp(-((x - w/3) ** 2 + (y - h/2) ** 2) * 0.001);
            const drift2 = Math.cos(x * 0.08 - y * 0.06 + t * 0.6) * Math.exp(-((x - 2*w/3) ** 2 + (y - h/3) ** 2) * 0.001);
            const wisp = Math.sin((x + y) * 0.3 + t * 0.8) * Math.sin(t * 0.5) * 0.3;
            return drift1 * 0.4 + drift2 * 0.4 + wisp;
        },
        feast: (x, y, t, w, h) => {
            const flow1 = Math.sin(x * 0.3 + t * 0.5) * Math.cos(y * 0.2 + t * 0.3);
            const flow2 = Math.sin(y * 0.4 - t * 0.4) * Math.cos(x * 0.25 + t * 0.6);
            const ripeness = Math.sin((x + y) * 0.15 + t * 0.7) * Math.sin(Math.sqrt((x - w/2) ** 2 + (y - h/2) ** 2) * 0.1 - t * 0.3);
            return flow1 * 0.35 + flow2 * 0.35 + ripeness * 0.3;
        },
        hunger: (x, y, t, w, h) => {
            const cx = w/2, cy = h/2, dx = x-cx, dy = y-cy, dist = Math.sqrt(dx*dx+dy*dy), angle = Math.atan2(dy, dx);
            const consumption = Math.sin(dist * 0.2 - t * 1.5) * Math.exp(-dist * 0.02);
            const yearning = Math.sin(angle * 6 + t * 0.8) * Math.cos(dist * 0.1 + t * 0.5);
            return consumption * 0.6 + yearning * 0.4;
        },
        loading: (x, y, t, w, h) => {
            const steamFlow = Math.sin(x * 0.2 + y * 0.1 - t * 0.8) * Math.exp(-y * 0.05);
            const rising = Math.sin(x * 0.3 + t * 0.6) * Math.cos(y * 0.2 - t * 0.4);
            const drift = Math.cos((x + y) * 0.15 + t * 0.5) * Math.sin(y * 0.1 - t * 0.3);
            return steamFlow * 0.4 + rising * 0.3 + drift * 0.3;
        },
        aether: (x, y, t, w, h) => {
            const cx = w/2, cy = h/2, dx = x-cx, dy = y-cy, dist = Math.sqrt(dx*dx+dy*dy);
            const resonance1 = Math.sin(dist * 0.3 - t * 1.5) * Math.exp(-dist * 0.03);
            const resonance2 = Math.cos(dist * 0.2 - t * 1.2) * Math.exp(-dist * 0.04);
            const harmonics = Math.sin(dist * 0.6 - t * 2.0) * 0.3;
            const interference = Math.sin(dx * 0.4 + t * 0.8) * Math.cos(dy * 0.4 + t * 0.6);
            return resonance1 * 0.6 + resonance2 * 0.4 + harmonics + interference * 0.2;
        },
        chronos: (x, y, t, w, h) => {
            const cx = w/2, cy = h/2, dx = x-cx, dy = y-cy, dist = Math.sqrt(dx*dx+dy*dy), angle = Math.atan2(dy, dx);
            const hourMarks = Math.sin(angle * 6) * (Math.abs(dist - h * 0.3) < 2 ? 1 : 0);
            const pendulumAngle = Math.sin(t * 0.6) * 0.5;
            const pendulumEffect = Math.abs(angle - pendulumAngle) < 0.1 ? Math.sin(dist * 0.2) : -0.5;
            const timeRipples = Math.sin(dist * 0.15 - t * 0.8) * Math.exp(-dist * 0.02);
            const clockwork = Math.sin(x * 0.3 + t * 0.4) * Math.cos(y * 0.3 + t * 0.3);
            const pastEcho = Math.sin(dist * 0.25 - t * 0.5 + Math.PI) * Math.exp(-dist * 0.06) * 0.3;
            return hourMarks + pendulumEffect * 0.4 + timeRipples * 0.6 + clockwork * 0.2 + pastEcho;
        },
        echoes: (x, y, t, w, h) => {
            const cx = w/2, cy = h/2, dx = x-cx, dy = y-cy, dist = Math.sqrt(dx*dx+dy*dy);
            const echo1 = Math.sin(dist * 0.3 - t * 1.5) * Math.exp(-dist * 0.03);
            const echo2 = Math.sin(dist * 0.3 - t * 1.5 + 2) * Math.exp(-dist * 0.05) * 0.7;
            const echo3 = Math.sin(dist * 0.3 - t * 1.5 + 4) * Math.exp(-dist * 0.07) * 0.4;
            const strata = Math.sin(y * 0.4 + x * 0.1 + t * 0.2) * Math.cos(y * 0.2 - t * 0.1);
            const interference = Math.sin(x * 0.2 + t * 0.3) * Math.cos(y * 0.25 - t * 0.25);
            return echo1 + echo2 + echo3 + strata * 0.3 + interference * 0.2;
        },
        luckycharm: (x, y, t, w, h) => {
            const sparkle = Math.sin(x * 0.8 + t * 1.2) * Math.sin(y * 0.9 + t * 1.1) * 0.3;
            const lucky_flow = Math.sin(x * 0.2 + t * 0.4) * Math.cos(y * 0.15 + t * 0.3);
            const gentle_drift = Math.sin((x + y) * 0.1 + t * 0.2) * 0.4;
            return lucky_flow * 0.5 + sparkle + gentle_drift;
        },
        roseschocolates: (x, y, t, w, h) => {
            const cx = w/2, cy = h/2, dx = x-cx, dy = y-cy, angle = Math.atan2(dy, dx), dist = Math.sqrt(dx*dx+dy*dy);
            const rose_radius = h * 0.2 * Math.cos(5 * angle + t * 0.3);
            const petal_proximity = Math.exp(-Math.abs(dist - Math.abs(rose_radius)) * 0.1);
            const chocolate_swirl = Math.sin(dist * 0.2 - t * 0.4) * Math.sin(angle * 3 + t * 0.6);
            return petal_proximity * 0.7 + chocolate_swirl * 0.4;
        },
        fertilityidol: (x, y, t, w, h) => {
            const cx = w/2, cy = h/2, dx = x-cx, dy = y-cy, dist = Math.sqrt(dx*dx+dy*dy), angle = Math.atan2(dy, dx);
            const convergence = Math.sin(dist * 0.1 - t * 1.2) * Math.sin(angle * 6 + t * 0.8) * Math.exp(-dist * 0.01);
            const division_wave = Math.sin(dist * 0.05 + t * 0.6) * Math.exp(-Math.abs(dist - t * 8) * 0.02);
            const flash = Math.exp(-dist * 0.03) * (1 + Math.sin(t * 2.0) * 0.5);
            return convergence * 0.4 + division_wave * 0.5 + flash * 0.3;
        },
        mine: (x, y, t, w, h) => {
            const depth_factor = (y / h) * 2;
            const corruption = Math.sin(x * 0.4 + depth_factor * 1.5 + t * 0.7) * Math.pow(depth_factor, 1.5);
            const fracture = Math.sin(x * 1.2 + y * 0.8 + t * 1.1) * Math.sin(y * 0.6 - t * 0.8) * depth_factor;
            const falling = Math.sin(x * 0.2 + (y + t * 40) * 0.3) * Math.exp(-((y + t * 20) % h) * 0.1);
            return corruption * 0.5 + fracture * 0.4 + falling * 0.3;
        },
        inventory: (x, y, t, w, h) => {
            const soft_motes = Math.sin(x * 0.15 + t * 0.08) * Math.sin(y * 0.12 + t * 0.06) * 0.3;
            const distant_drift = Math.sin(x * 0.07 + t * 0.05) * 0.2;
            const faint_scatter = Math.sin(y * 0.09 - t * 0.04) * 0.25;
            const whisper_pattern = Math.sin((x * 0.2 + y * 0.18) + t * 0.03) * 0.15;
            return soft_motes + distant_drift + faint_scatter + whisper_pattern;
        },
        future: (x, y, t, w, h) => {
            const cx = w/2, cy = h/2, dx = x-cx, dy = y-cy, angle = Math.atan2(dy, dx), dist = Math.sqrt(dx*dx+dy*dy);
            const rays = Math.sin(angle * 10 + t * 0.05);
            const zMotion = Math.sin(dist * 0.2 - t * 0.3);
            const steam = Math.sin(x * 0.1 + y * 0.1 - t * 0.25);
            const combined = (rays * zMotion * 0.4) + (steam * 0.25) - 0.05;
            const centerMask = Math.min(1, Math.pow(dist * 0.08, 1.5));
            return combined * centerMask;
        },
        misaligned: (x, y, t, w, h) => {
            const cx = w/2, cy = h/2, dx = x-cx, dy = y-cy, dist = Math.sqrt(dx*dx+dy*dy), angle = Math.atan2(dy, dx);
            const wobble = Math.sin(angle * 5 + t * 0.5) * Math.sin(dist * 0.1);
            const deepBreath = Math.sin((dist + wobble * 4) * 0.08 - t * 0.5);
            const shivering = Math.sin(x * 0.5 + t * 2) * Math.cos(y * 0.5 - t * 2) * 0.1;
            return (deepBreath * 0.5) + shivering - 0.1;
        },
        gorged: (x, y, t, w, h) => {
            const cx = w/2, cy = h/2, dx = x-cx, dy = y-cy, dist = Math.sqrt(dx*dx+dy*dy);
            const lens = 1 + Math.pow(dist * 0.05, 2);
            const surface = Math.sin((x / lens) * 0.8 + t * 0.2) * Math.cos((y / lens) * 0.8);
            const sheen = Math.sin((x + y) * 0.1 - t * 0.5);
            return surface * 0.5 + sheen * 0.2 - 0.1;
        },
        satchel: (x, y, t, w, h) => {
            const warp = Math.sin(x * 0.8 + t * 0.1);
            const weft = Math.cos(y * 0.8 - t * 0.1);
            const sag = Math.sin(x * 0.1 + y * 0.1 + t * 0.2) * 0.3;
            return (warp * weft) * 0.3 + sag - 0.2;
        },
        distortion: (x, y, t, w, h) => {
            const cx = w/2, cy = h/2, dx = x-cx, dy = y-cy, dist = Math.sqrt(dx*dx+dy*dy);
            const warpX = x + Math.sin(y * 0.3 + t * 0.8) * 3;
            const warpY = y + Math.cos(x * 0.2 + t * 0.6) * 2;
            const grid = Math.sin(warpX * 0.4) * Math.cos(warpY * 0.3);
            const vortex = Math.sin(dist * 0.2 + t * 2) * Math.exp(-dist * 0.08);
            const spiral = Math.sin(Math.atan2(dy, dx) * 4 + dist * 0.1 - t * 1.2);
            const stream1 = Math.sin(x * 0.15 + y * 0.1 - t * 1.0) * Math.cos(x * 0.1 - y * 0.2 + t * 0.7);
            const stream2 = Math.cos(x * 0.12 - y * 0.15 + t * 0.9) * Math.sin(y * 0.08 + t * 0.5);
            const fracture = Math.sin((x + y) * 0.25 + t * 0.4) * Math.cos((x - y) * 0.2 - t * 0.3);
            return grid * 0.3 + vortex * spiral * 0.4 + stream1 * 0.15 + stream2 * 0.1 + fracture * 0.05;
        }
    }
};

class AsciiBackdrop {
    constructor() {
        this.element = document.getElementById('ascii-backdrop');
        this.active = false;
        this.frame = 0;
        this.patternName = 'random'; 
        this.fontSize = 14; 
        this.speed = 8; 
        
        window.addEventListener('resize', () => { if (this.active) this.render(); });
    }

    start(pattern = null) {
        if (pattern) {
            this.patternName = pattern;
        } else if (this.patternName === 'random') {
            const keys = Object.keys(PATTERN_CONFIG.patterns);
            this.patternName = keys[Math.floor(Math.random() * keys.length)];
        }
        
        if (!this.active) {
            this.active = true;
            this.loop();
        }
    }

    randomize() {
        const keys = Object.keys(PATTERN_CONFIG.patterns);
        this.patternName = keys[Math.floor(Math.random() * keys.length)];
    }

    stop() {
        this.active = false;
        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.element.textContent = '';
    }

    calculateDimensions() {
        const charWidth = this.fontSize * 0.6;
        const charHeight = this.fontSize;
        // Large safety buffer to prevent white bars on edge
        const width = Math.ceil(window.innerWidth / charWidth) + 10;
        const height = Math.ceil(window.innerHeight / charHeight);
        return { width, height };
    }

    render() {
        const { width, height } = this.calculateDimensions();
        const t = (this.frame * Math.PI) / (60 * this.speed);
        
        const patternFunc = PATTERN_CONFIG.patterns[this.patternName] || PATTERN_CONFIG.patterns['inventory'];
        let result = '';

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let value = patternFunc(x, y, t, width, height);
                if (value > 0.8) result += '█';
                else if (value > 0.5) result += '▓';
                else if (value > 0.2) result += '▒';
                else if (value > -0.2) result += '░';
                else if (value > -0.5) result += '·';
                else result += ' ';
            }
            result += '\n';
        }
        this.element.textContent = result;
    }

    loop() {
        if (!this.active) return;
        this.frame++;
        this.render();
        this.animationId = requestAnimationFrame(() => this.loop());
    }

    setOpacity(val) {
        this.element.style.opacity = val;
    }
}

window.AsciiBackdropSystem = new AsciiBackdrop();