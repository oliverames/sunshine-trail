const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '../../index.html'), 'utf8');

test('closing untouched popups releases drag and zoom listeners without affecting later popups', () => {
  const events = new Map();
  const map = {
    on(type, fn) { if (!events.has(type)) events.set(type, new Set()); events.get(type).add(fn); },
    once(type, fn) { this.on(type, fn); },
    off(type, fn) { events.get(type)?.delete(fn); },
    hasLayer: () => true,
  };
  const document = { getElementById: () => ({ classList: { add() {}, remove() {} } }) };
  const timers = new Map(); let next = 0;
  const context = vm.createContext({ map, document, window: {}, AbortController,
    Viewport: { isDesktop: () => true, isMobile: () => false }, expandMapOnMobile() {},
    setTimeout: fn => { timers.set(++next, fn); return next; }, clearTimeout: id => timers.delete(id),
  });
  const source = html.slice(html.indexOf('        let savedMapState = null;'), html.indexOf('        // State filtering for community partners'));
  vm.runInContext(source, context);
  const open = [...events.get('popupopen')][0], close = [...events.get('popupclose')][0];
  for (let i = 0; i < 5; i++) {
    open({ popup: { _latlng: {} } });
    assert.equal(events.get('dragstart').size, 1);
    close({});
    assert.equal(events.get('dragstart').size, 0, 'closed popup retains a drag cancellation callback');
    assert.equal(events.get('zoomstart').size, 0, 'closed popup retains a zoom cancellation callback');
    assert.equal(timers.size, 0);
  }
});

test('rapid hide/show leaves one idle loop and no queued work while hidden', () => {
  const listeners = new Map(); const frames = new Map(); let next = 0;
  const document = { hidden: false, addEventListener: (type, fn) => listeners.set(type, fn) };
  const context = vm.createContext({ document, Map, Set, fidgetSun: { style: {} },
    isDragging: false, velocity: 0, rotation: 0, idleRotation: 0,
    requestAnimationFrame: fn => { frames.set(++next, fn); return next; },
    cancelAnimationFrame: id => frames.delete(id),
  });
  const visibility = html.slice(html.indexOf('        let pageIsVisible ='), html.indexOf('        // FIDGET SUN SPINNER CLASS'));
  const start = html.indexOf('            function idleSpin() {');
  const end = html.indexOf('            registerVisibilityAnimation(idleSpin);', start) + '            registerVisibilityAnimation(idleSpin);'.length;
  vm.runInContext(visibility + html.slice(start, end), context);
  assert.equal(frames.size, 1);
  for (let i = 0; i < 5; i++) {
    document.hidden = true; listeners.get('visibilitychange')();
    document.hidden = false; listeners.get('visibilitychange')();
    assert.equal(frames.size, 1, 'visibility resume duplicates the idle animation');
  }
  document.hidden = true; listeners.get('visibilitychange')();
  assert.equal(frames.size, 0, 'hidden page retains a queued spinner frame');
  document.hidden = false; listeners.get('visibilitychange')();
  const [id, callback] = frames.entries().next().value; frames.delete(id); callback();
  assert.equal(frames.size, 1, 'idle loop multiplies after resumed frame');
});

test('a cancelled momentum loop can restart, including when a drag starts while hidden', () => {
  const listeners = new Map(), frames = new Map(); let next = 0;
  const document = { hidden: false, addEventListener: (type, fn) => listeners.set(type, fn) };
  const context = vm.createContext({ document, Map,
    requestAnimationFrame: fn => { frames.set(++next, fn); return next; },
    cancelAnimationFrame: id => frames.delete(id),
  });
  vm.runInContext(html.slice(html.indexOf('        let pageIsVisible ='), html.indexOf('        // FIDGET SUN SPINNER CLASS')), context);
  vm.runInContext('function momentum() { scheduleVisibleAnimation(momentum); } momentum();', context);
  assert.equal(frames.size, 1);
  document.hidden = true; listeners.get('visibilitychange')();
  assert.equal(frames.size, 0);
  vm.runInContext('cancelVisibleAnimation(momentum);', context);
  document.hidden = false; listeners.get('visibilitychange')();
  assert.equal(frames.size, 0, 'cancelled momentum restarted on visibility');
  vm.runInContext('momentum();', context);
  assert.equal(frames.size, 1, 'new drag could not restart momentum');
});
