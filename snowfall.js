/* Canvas snowfall. The renderer owns its frame lifecycle; UI controls stay in index.html. */
(function (root) {
    function createCanvasSnowfall(canvas, environment = {}) {
        const win = environment.window || window;
        const doc = environment.document || document;
        const random = environment.random || Math.random;
        const ctx = canvas.getContext('2d');
        const motion = win.matchMedia('(prefers-reduced-motion: reduce)');
        const glyphs = ['❄', '❅', '❆', '✻', '✼'];
        const pool = Array.from({ length: 250 }, () => ({ active: false, sway: [0, 0, 0, 0, 0] }));
        let running = false;
        let destroyed = false;
        let frame = null;
        let cleanup = null;
        let previous = null;
        let emission = 0;
        let wind = 0;
        let targetWind = 0;
        let width = 0;
        let height = 0;
        let ratio = 1;

        function cancelFrame() {
            if (frame !== null) win.cancelAnimationFrame(frame);
            frame = null;
            previous = null;
        }
        function clear() {
            for (const flake of pool) flake.active = false;
            if (ctx) ctx.clearRect(0, 0, width, height);
        }
        function resize() {
            width = win.innerWidth;
            height = win.innerHeight;
            ratio = Math.min(2, win.devicePixelRatio || 1);
            canvas.width = Math.round(width * ratio);
            canvas.height = Math.round(height * ratio);
            if (ctx) ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        }
        function spawn(fast) {
            const flake = pool.find(item => !item.active);
            if (!flake) return;
            flake.active = true;
            flake.glyph = glyphs[Math.floor(random() * glyphs.length)];
            flake.x = random();
            flake.size = 1.2 + random() * 1.3;
            flake.spin = (180 + random() * 540) * (random() > 0.5 ? 1 : -1);
            const sway = (random() - 0.5) * 60;
            flake.sway[1] = sway + (random() - 0.5) * 30;
            flake.sway[2] = sway * -0.5 + (random() - 0.5) * 40;
            flake.sway[3] = sway * 0.3 + (random() - 0.5) * 35;
            flake.sway[4] = sway * -0.2 + (random() - 0.5) * 25;
            flake.duration = fast ? 2 + random() * 4 : 5 + random() * 12;
            flake.age = fast ? 0 : -random() * 0.3;
        }
        function draw() {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = '#fff';
            ctx.shadowColor = 'rgba(200, 230, 255, 0.9)';
            ctx.shadowBlur = 8;
            ctx.textBaseline = 'top';
            for (const flake of pool) {
                if (!flake.active || flake.age < 0) continue;
                const progress = Math.min(1, flake.age / flake.duration);
                const segment = Math.min(3, Math.floor(progress * 4));
                const fraction = progress * 4 - segment;
                const sway = flake.sway[segment] + (flake.sway[segment + 1] - flake.sway[segment]) * fraction;
                ctx.save();
                ctx.globalAlpha = 0.75 - 0.5 * progress;
                ctx.font = `${flake.size * 16}px sans-serif`;
                ctx.translate(flake.x * width + wind * (2.5 - flake.size * 0.6), -50 + (height * 1.1 + 20) * progress);
                ctx.rotate(flake.spin * progress * Math.PI / 180);
                ctx.translate(sway, 0);
                ctx.fillText(flake.glyph, 0, 0);
                ctx.restore();
            }
        }
        function canAnimate() {
            return running && !destroyed && !doc.hidden && !motion.matches && ctx;
        }
        function schedule() {
            if (canAnimate() && frame === null) frame = win.requestAnimationFrame(animate);
        }
        function animate(now) {
            frame = null;
            if (!canAnimate()) { previous = null; return; }
            // First frame after any pause has zero elapsed time; stalls cannot create catch-up bursts.
            const elapsed = previous === null ? 0 : Math.min(0.05, Math.max(0, (now - previous) / 1000));
            previous = now;
            wind += (targetWind - wind) * (1 - Math.pow(0.85, elapsed * 60));
            for (const flake of pool) {
                if (!flake.active) continue;
                flake.age += elapsed;
                if (flake.age >= flake.duration) flake.active = false;
            }
            emission += elapsed;
            while (emission >= 0.04) { spawn(false); spawn(false); emission -= 0.04; }
            draw();
            schedule();
        }
        function start() {
            if (destroyed || running) return;
            running = true;
            if (cleanup !== null) win.clearTimeout(cleanup);
            cleanup = null;
            cancelFrame();
            clear();
            emission = 0;
            wind = 0;
            targetWind = 0;
            canvas.classList.remove('thawing');
            canvas.hidden = !ctx || motion.matches;
            if (canvas.hidden) return;
            resize();
            for (let index = 0; index < 50; index++) spawn(true);
            if (!doc.hidden) draw();
            schedule();
        }
        function stop() {
            if (!running) return;
            running = false;
            cancelFrame();
            canvas.classList.add('thawing');
            cleanup = win.setTimeout(() => {
                clear();
                canvas.hidden = true;
                cleanup = null;
            }, motion.matches ? 0 : 3100);
        }
        function visibilityChanged() {
            cancelFrame();
            // Resize events may have been ignored while hidden. Preserve particles and
            // the paused image unless the viewport or backing resolution changed.
            if (canAnimate() && (width !== win.innerWidth || height !== win.innerHeight ||
                ratio !== Math.min(2, win.devicePixelRatio || 1))) {
                resize();
                draw();
            }
            schedule();
        }
        function motionChanged() {
            if (!running) return;
            running = false;
            start();
        }
        function viewportChanged() {
            if (!canAnimate()) return;
            resize();
            draw();
        }
        doc.addEventListener('visibilitychange', visibilityChanged);
        win.addEventListener('resize', viewportChanged);
        motion.addEventListener('change', motionChanged);
        canvas.hidden = true;
        return {
            start,
            stop,
            setWind(value) { if (running && Number.isFinite(value)) targetWind = Math.max(-200, Math.min(200, value)); },
            destroy() {
                if (destroyed) return;
                destroyed = true;
                running = false;
                cancelFrame();
                if (cleanup !== null) win.clearTimeout(cleanup);
                clear();
                canvas.hidden = true;
                doc.removeEventListener('visibilitychange', visibilityChanged);
                win.removeEventListener('resize', viewportChanged);
                motion.removeEventListener('change', motionChanged);
            },
        };
    }
    if (typeof module !== 'undefined' && module.exports) module.exports = { createCanvasSnowfall };
    else root.createCanvasSnowfall = createCanvasSnowfall;
})(typeof window !== 'undefined' ? window : this);
