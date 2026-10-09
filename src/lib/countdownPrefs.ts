// Pre-record countdown prefs (beep mute + seconds), persisted on this device.
//
// ⚠️ This module imports NOTHING, so `npm run test:countdown-prefs` can load it
// under Node's type-stripping (same rule as hostedPaths.ts).
//
// Once the screen picker is confirmed, an on-screen "Recording starts in N…"
// counts down before MediaRecorder starts. The beep is the audible half of it —
// so the start cue is heard even when the user has switched to the app they're
// demoing. The seconds picker is Off / 3 / 5 / 10s: `seconds: 0` is "No
// countdown" (recording starts the moment the picker is confirmed, no count, no
// beep). The checkbox "Mute the countdown beep" only silences the beeps; the
// visual count and its timing are unchanged. It is hidden when the countdown is
// Off (there is nothing to mute) but its value is kept.
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
// - v3 `seconds: 0` = "No countdown" (James, 2026-10-10). Before the old v2
//   option became a mute, turning it off meant recording started INSTANTLY, so
//   a v2 `{enabled:false}` now migrates to Off (`{muted:false, seconds:0}`),
//   not to a muted 3s count.
//   Known gap: anyone whose v2 value was already migrated by the 2026-10-09
//   build has v3 `{muted:true, seconds:N}`, which is indistinguishable from a
//   real "mute the beep" choice made since. It is kept as-is (a silent count) —
//   overriding a possibly-deliberate choice is worse, and Off is one click away.
export const COUNTDOWN_PREFS_KEY = 'universal-recorder:countdown:v3'
export const LEGACY_COUNTDOWN_PREFS_KEY = 'universal-recorder:countdown:v2'

export interface CountdownPrefs {
  muted: boolean
  seconds: number
}

/** Seconds-picker values; 0 is "No countdown" (Off). */
export const COUNTDOWN_CHOICES = [0, 3, 5, 10]
export const DEFAULT_COUNTDOWN_PREFS: CountdownPrefs = { muted: false, seconds: 3 }

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

function validSeconds(s: unknown): number {
  return typeof s === 'number' && s >= 0 && Number.isFinite(s) ? s : DEFAULT_COUNTDOWN_PREFS.seconds
}

/**
 * Read the prefs, migrating a v2 `{enabled, seconds}` value to v3 on first read:
 * `enabled:false` → Off (`seconds: 0`, unmuted), `enabled:true` → unmuted with
 * its seconds kept.
 */
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
    const migrated: CountdownPrefs = old.enabled === false
      ? { muted: false, seconds: 0 }
      : { muted: DEFAULT_COUNTDOWN_PREFS.muted, seconds: validSeconds(old.seconds) }
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
