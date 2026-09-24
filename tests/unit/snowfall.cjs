const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createCanvasSnowfall } = require('../../snowfall.js');
function fixture(reduced = false) {
    const frames = new Map(), timers = new Map(); let next = 1, seed = 1;
    const target = () => { const handlers = new Map(); return { handlers, addEventListener(n, fn) { handlers.set(n, fn); }, removeEventListener(n) { handlers.delete(n); }, emit(n) { handlers.get(n)?.(); } }; };
    const motion = { ...target(), matches: reduced };
    const doc = { ...target(), hidden: false };
    const win = { ...target(), innerWidth: 1000, innerHeight: 800, devicePixelRatio: 2, matchMedia: () => motion,
        requestAnimationFrame(fn) { const id = next++; frames.set(id, fn); return id; }, cancelAnimationFrame(id) { frames.delete(id); },
        setTimeout(fn) { const id = next++; timers.set(id, fn); return id; }, clearTimeout(id) { timers.delete(id); } };
    const ctx = { draws: [], x: 0, y: 0, clearRect() { this.draws = []; }, setTransform() {}, save() { this.x = 0; this.y = 0; }, restore() {}, rotate() {}, translate(x,y) { this.x += x; this.y += y; }, fillText(glyph) { this.draws.push({ glyph, x: this.x, y: this.y, font: this.font }); } };
    const classes = new Set();
    const canvas = { hidden: false, classList: { add: n => classes.add(n), remove: n => classes.delete(n) }, getContext: () => ctx };
    const snow = createCanvasSnowfall(canvas, { window: win, document: doc, random: () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646 });
    const tick = now => { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(fn => fn(now)); };
    return { snow, canvas, ctx, win, doc, motion, frames, timers, tick, classes };
}
test('idle allocates no frame work; start preserves glyphs and initial density on one canvas', () => {
    const f = fixture(); assert.equal(f.frames.size, 0); f.snow.start();
    assert.equal(f.frames.size, 1); assert.equal(f.ctx.draws.length, 50); assert.equal(f.canvas.width, 2000);
    assert.ok(f.ctx.draws.every(d => ['❄','❅','❆','✻','✼'].includes(d.glyph)));
    assert.ok(new Set(f.ctx.draws.map(d => d.font)).size > 1);
    f.snow.start(); assert.equal(f.frames.size, 1);
});
test('pool stays bounded at 250 during continuous snowfall and reuses it after restart', () => {
    const f = fixture(); f.snow.start();
    for (let time = 0; time <= 30000; time += 40) { f.tick(time); assert.ok(f.ctx.draws.length <= 250); }
    assert.ok(f.ctx.draws.length >= 200);
    f.snow.stop(); f.snow.start(); assert.equal(f.ctx.draws.length, 50); assert.equal(f.timers.size, 0);
});
test('hidden cancels frames and resumes without elapsed-time catch-up', () => {
    const f = fixture(); f.snow.start(); f.tick(0); f.tick(40);
    const before = structuredClone(f.ctx.draws); f.doc.hidden = true; f.doc.emit('visibilitychange');
    assert.equal(f.frames.size, 0); f.tick(60000); assert.deepEqual(f.ctx.draws, before);
    f.doc.hidden = false; f.doc.emit('visibilitychange'); assert.equal(f.frames.size, 1);
    f.tick(60000); assert.deepEqual(f.ctx.draws, before);
    f.tick(60040); assert.ok(f.ctx.draws[0].y > before[0].y);
});
test('stop freezes immediately for CSS thaw; wind has no perpetual loop and cleanup completes', () => {
    const f = fixture(); f.snow.start(); f.tick(0); f.snow.stop();
    assert.equal(f.frames.size, 0); assert.ok(f.classes.has('thawing'));
    f.snow.setWind(100); assert.equal(f.frames.size, 0);
    for (const fn of f.timers.values()) fn(); assert.equal(f.canvas.hidden, true); assert.equal(f.ctx.draws.length, 0);
});
test('wind moves glyphs and resize updates the same backing canvas', () => {
    const normal = fixture(), windy = fixture(); normal.snow.start(); windy.snow.start(); windy.snow.setWind(200);
    for (let t = 0; t < 500; t += 40) { normal.tick(t); windy.tick(t); }
    assert.ok(windy.ctx.draws[0].x > normal.ctx.draws[0].x + 50);
    windy.win.innerWidth = 500; windy.win.emit('resize'); assert.equal(windy.canvas.width, 1000); assert.equal(windy.frames.size, 1);
});
test('reduced motion suppresses frames and reacts to preference changes', () => {
    const f = fixture(true); f.snow.start(); assert.equal(f.frames.size, 0); assert.equal(f.canvas.hidden, true);
    f.motion.matches = false; f.motion.emit('change'); assert.equal(f.frames.size, 1);
    f.motion.matches = true; f.motion.emit('change'); assert.equal(f.frames.size, 0); assert.equal(f.canvas.hidden, true);
});
test('start while hidden does not schedule frames; destruction removes renderer-owned listeners', () => {
    const f = fixture(); f.doc.hidden = true; f.snow.start(); assert.equal(f.frames.size, 0);
    f.snow.destroy(); f.doc.hidden = false; f.doc.emit('visibilitychange'); f.snow.start();
    assert.equal(f.frames.size, 0); assert.equal(f.timers.size, 0); assert.equal(f.doc.handlers.size, 0); assert.equal(f.win.handlers.size, 0); assert.equal(f.motion.handlers.size, 0);
});
test('resume refreshes viewport and pixel ratio changed while hidden without advancing particles', () => {
    const f = fixture(); f.snow.start(); f.tick(0); f.tick(40);
    const before = structuredClone(f.ctx.draws);
    f.doc.hidden = true; f.doc.emit('visibilitychange');
    f.win.innerWidth = 600; f.win.innerHeight = 900; f.win.devicePixelRatio = 1.5; f.win.emit('resize');
    assert.equal(f.canvas.width, 2000); assert.equal(f.frames.size, 0);
    f.doc.hidden = false; f.doc.emit('visibilitychange');
    assert.equal(f.canvas.width, 900); assert.equal(f.canvas.height, 1350); assert.equal(f.frames.size, 1);
    f.tick(60000); assert.equal(f.ctx.draws.length, before.length);
    assert.equal(f.ctx.draws[0].glyph, before[0].glyph); assert.equal(f.ctx.draws[0].font, before[0].font);
    const resumed = structuredClone(f.ctx.draws);
    f.doc.hidden = true; f.doc.emit('visibilitychange'); f.doc.hidden = false; f.doc.emit('visibilitychange');
    assert.deepEqual(f.ctx.draws, resumed); assert.equal(f.frames.size, 1);
    f.tick(120000); assert.deepEqual(f.ctx.draws, resumed);
});
