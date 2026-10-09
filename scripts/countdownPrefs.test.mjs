// Countdown prefs — "Mute the countdown beep" and the v2 → v3 migration.
//
//   npm run test:countdown-prefs
//
// Runs under Node's type-stripping, so `countdownPrefs.ts` is imported directly
// (it imports nothing for exactly that reason).
//
// What is pinned: the option was "Beep countdown before recording" (ticked by
// default, stored as v2 `{enabled}`); it is now "Mute the countdown beep"
// (unticked by default, stored as v3 `{muted}`). A fresh user must get the beep;
// anyone who turned the old beep OFF must stay muted; Reset clears both keys.
import assert from 'node:assert/strict'
import {
  COUNTDOWN_PREFS_KEY,
  DEFAULT_COUNTDOWN_PREFS,
  LEGACY_COUNTDOWN_PREFS_KEY,
  clearCountdownPrefs,
  loadCountdownPrefs,
  saveCountdownPrefs,
} from '../src/lib/countdownPrefs.ts'

function memStore(init = {}) {
  const m = new Map(Object.entries(init))
  return {
    m,
    getItem: k => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)) },
    removeItem: k => { m.delete(k) },
  }
}

let n = 0
function test(name, fn) { fn(); n++; console.log(`ok - ${name}`) }

test('defaults: unticked (beep plays), 3 seconds', () => {
  assert.deepEqual(DEFAULT_COUNTDOWN_PREFS, { muted: false, seconds: 3 })
})

test('fresh user: nothing stored → unmuted, and nothing is written', () => {
  const s = memStore()
  assert.deepEqual(loadCountdownPrefs(s), { muted: false, seconds: 3 })
  assert.equal(s.m.size, 0)
})

test('v2 enabled:false (turned the beep off) → muted, seconds kept, migrated', () => {
  const s = memStore({ [LEGACY_COUNTDOWN_PREFS_KEY]: JSON.stringify({ enabled: false, seconds: 5 }) })
  assert.deepEqual(loadCountdownPrefs(s), { muted: true, seconds: 5 })
  assert.equal(s.getItem(LEGACY_COUNTDOWN_PREFS_KEY), null)
  assert.deepEqual(JSON.parse(s.getItem(COUNTDOWN_PREFS_KEY)), { muted: true, seconds: 5 })
  // and it sticks on the next read
  assert.deepEqual(loadCountdownPrefs(s), { muted: true, seconds: 5 })
})

test('v2 enabled:true → unmuted, seconds kept', () => {
  const s = memStore({ [LEGACY_COUNTDOWN_PREFS_KEY]: JSON.stringify({ enabled: true, seconds: 10 }) })
  assert.deepEqual(loadCountdownPrefs(s), { muted: false, seconds: 10 })
})

test('v3 wins over a leftover v2', () => {
  const s = memStore({
    [COUNTDOWN_PREFS_KEY]: JSON.stringify({ muted: false, seconds: 3 }),
    [LEGACY_COUNTDOWN_PREFS_KEY]: JSON.stringify({ enabled: false, seconds: 5 }),
  })
  assert.deepEqual(loadCountdownPrefs(s), { muted: false, seconds: 3 })
})

test('garbage values fall back to defaults', () => {
  assert.deepEqual(loadCountdownPrefs(memStore({ [COUNTDOWN_PREFS_KEY]: '{"muted":"yes","seconds":-1}' })), DEFAULT_COUNTDOWN_PREFS)
  assert.deepEqual(loadCountdownPrefs(memStore({ [LEGACY_COUNTDOWN_PREFS_KEY]: 'not json' })), DEFAULT_COUNTDOWN_PREFS)
})

test('save round-trips', () => {
  const s = memStore()
  saveCountdownPrefs({ muted: true, seconds: 10 }, s)
  assert.deepEqual(loadCountdownPrefs(s), { muted: true, seconds: 10 })
})

test('reset clears both keys → defaults', () => {
  const s = memStore({
    [COUNTDOWN_PREFS_KEY]: JSON.stringify({ muted: true, seconds: 5 }),
    [LEGACY_COUNTDOWN_PREFS_KEY]: JSON.stringify({ enabled: false, seconds: 5 }),
  })
  clearCountdownPrefs(s)
  assert.equal(s.m.size, 0)
  assert.deepEqual(loadCountdownPrefs(s), DEFAULT_COUNTDOWN_PREFS)
})

console.log(`\n${n} passed`)
