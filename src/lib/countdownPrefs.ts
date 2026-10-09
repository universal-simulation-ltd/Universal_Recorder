// Pre-record countdown prefs (beep mute + seconds), persisted on this device.
//
// ⚠️ This module imports NOTHING, so `npm run test:countdown-prefs` can load it
// under Node's type-stripping (same rule as hostedPaths.ts).
//
// The countdown itself always runs: once the screen picker is confirmed, an
// on-screen "Recording starts in N…" counts down before MediaRecorder starts.
// The beep is the audible half of it — so the start cue is heard even when the
// user has switched to the app they're demoing. The one checkbox is
// "Mute the countdown beep", which only silences the beeps; the visual count
// and its timing are unchanged.
//
// Why it is worded as a mute (James, 2026-10-09): suite options start UNTICKED,
// but the beep should still play by default. The old option, "Beep countdown
// before recording", had to start ticked to do that. Inverting the meaning lets
// the checkbox start unticked while the default behaviour stays "beep on".
//
// Key history — each stored value is a real choice, never a mount-time default:
// - v1 wrote on mount, so a stored `false` said nothing about intent; abandoned.
// - v2 (`{enabled, seconds}`) wrote only when the user changed something, so a
//   stored `enabled: false` IS someone who turned the beep off.
// - v3 (`{muted, seconds}`) is the inverted meaning. A v2 value is migrated once
//   (`muted = !enabled`, seconds kept) so nobody who turned the beep off gets it
//   back, then v2 is removed. v3 is also written only on a real change.
export const COUNTDOWN_PREFS_KEY = 'universal-recorder:countdown:v3'
export const LEGACY_COUNTDOWN_PREFS_KEY = 'universal-recorder:countdown:v2'

export interface CountdownPrefs {
  muted: boolean
  seconds: number
}

export const COUNTDOWN_CHOICES = [3, 5, 10]
export const DEFAULT_COUNTDOWN_PREFS: CountdownPrefs = { muted: false, seconds: 3 }

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

function validSeconds(s: unknown): number {
  return typeof s === 'number' && s > 0 ? s : DEFAULT_COUNTDOWN_PREFS.seconds
}

/** Read the prefs, migrating a v2 `{enabled, seconds}` value to v3 on first read. */
export function loadCountdownPrefs(store: Store = localStorage): CountdownPrefs {
  try {
    const raw = store.getItem(COUNTDOWN_PREFS_KEY)
    if (raw) {
      const p = JSON.parse(raw) as Partial<CountdownPrefs>
      return {
        muted: typeof p.muted === 'boolean' ? p.muted : DEFAULT_COUNTDOWN_PREFS.muted,
        seconds: validSeconds(p.seconds),
      }
    }
    const legacy = store.getItem(LEGACY_COUNTDOWN_PREFS_KEY)
    if (!legacy) return DEFAULT_COUNTDOWN_PREFS
    const old = JSON.parse(legacy) as { enabled?: unknown; seconds?: unknown }
    const migrated: CountdownPrefs = {
      muted: typeof old.enabled === 'boolean' ? !old.enabled : DEFAULT_COUNTDOWN_PREFS.muted,
      seconds: validSeconds(old.seconds),
    }
    try {
      store.setItem(COUNTDOWN_PREFS_KEY, JSON.stringify(migrated))
      store.removeItem(LEGACY_COUNTDOWN_PREFS_KEY)
    } catch { /* storage full/disabled — re-migrated on next read, still correct */ }
    return migrated
  } catch {
    return DEFAULT_COUNTDOWN_PREFS
  }
}

export function saveCountdownPrefs(prefs: CountdownPrefs, store: Store = localStorage): void {
  try {
    store.setItem(COUNTDOWN_PREFS_KEY, JSON.stringify(prefs))
  } catch { /* storage disabled — the choice just won't persist */ }
}

/** Reset to defaults: forget both the current and the legacy key. */
export function clearCountdownPrefs(store: Store = localStorage): void {
  try {
    store.removeItem(COUNTDOWN_PREFS_KEY)
    store.removeItem(LEGACY_COUNTDOWN_PREFS_KEY)
  } catch { /* storage disabled — nothing was persisted */ }
}
