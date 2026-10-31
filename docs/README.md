# Universal Recorder — docs

## What this repo is

Universal Recorder records in the browser — **microphone, system audio
(Chrome/Edge tab/screen share audio), the screen as video, and the webcam** —
any combination at once. Audio mixes through one Web Audio graph; the webcam is
composited onto the screen as a **picture-in-picture overlay** on a `<canvas>`
(or recorded full-frame when no screen is shared). Screen/webcam captures save
as **MP4/WebM**; audio-only saves as **WebM, MP3 or WAV**. Local-first:
recordings are captured, encoded and stored entirely on-device (IndexedDB) and
nothing is uploaded. There is no account of its own (`noAccounts: true`,
2026-10-20); since `@unisim/sdk` 0.211.0 a suite session the browser already
holds is read and followed, and Tune this app offers a discreet Sign in.

- **Live:** [opensource.unisim.co.uk/recorder](https://opensource.unisim.co.uk/recorder)
  — served by path via the `opensource-portal` Worker, which proxies
  `/recorder` to the `universal-recorder` Cloudflare Pages project
  (Direct-Upload; deploy with
  `wrangler pages deploy dist --project-name=universal-recorder`).
- **Stack:** Vite + React 18 + TypeScript. Native `MediaRecorder` for
  WebM/Opus, a PCM muxer for WAV, and `lamejs` for on-device MP3 transcoding.
- **Features:** record/pause/resume/stop transport, live level meter, mic +
  camera device pickers, a **webcam picture-in-picture overlay** (corner +
  size, adjustable live) composited via `<canvas>.captureStream()`, a live
  self-view while recording, in-page playback, and local-first recents (play,
  re-download in any format, delete).
- **Pre-record countdown (beeps):** a configurable run-in (No countdown / 3 /
  5 / 10s, default 3s; "No countdown" starts recording the moment the picker is
  confirmed) — an on-screen "Recording starts in N…" plus one beep a second —
  played *after* the screen picker is confirmed and *before* `MediaRecorder`
  starts, so the start cue is audible even when the user has switched to the
  app they're demoing. The beeps go to the speakers only and are never
  recorded. The option is **Mute the countdown beep** (unticked by default, so
  the beep plays); ticking it silences the beeps only — the count and its
  timing are unchanged; it is hidden when the countdown is Off. Persisted in
  `localStorage['universal-recorder:countdown:v3']` (`{muted, seconds}`),
  written only on a real change; a v2 `{enabled, seconds}` value from the old
  "Beep countdown before recording" option is migrated once (`enabled:false`
  → Off, `{muted:false, seconds:0}`, because switching that option off used to
  start recording instantly). `seconds: 0` = Off. A v3 `{muted:true}` written
  by the 2026-10-09 build's migration can't be told apart from a real choice,
  so it is kept. Logic + key history in `src/lib/countdownPrefs.ts`; tested by
  `npm run test:countdown-prefs`.
- **Preview gate:** for screen / webcam recordings nothing turns on until the
  user presses the prominent **Preview** button — one action that lights up
  whatever's ticked (live camera + a frozen still of the real screen for the PiP
  backdrop). Start is blocked until a preview has run at least once; audio-only
  recordings start straight away. The gate re-arms when the selected sources (or
  camera) change.

- **No own accounts, no cloud (2026-10-20).** `noAccounts: true` in `src/main.tsx`
  (Docs_UNI_SIM/login-free-plan.md, bucket A). Signing in only ever unlocked
  the opt-in **Save to cloud** (2026-07-30 to 2026-10-20: one recording in the
  shared private `hosted-uploads` bucket for the per-app `recorder` token,
  optionally shared with a company), so that went too — `hostedRecordings.ts`,
  `hostedPaths.ts`, `useCloud.ts`, `useFreeAllowance.ts`, `CloudRecordings.tsx`
  and `scripts/hostedPath.test.mjs`. Prod held **0** `hosted_uploads` rows for
  `recorder` when it was removed, so nothing was stranded. The git history has
  the code, including the `pending`-path repair notes, if it ever comes back.

Nothing — no recording, preview, screen still, webcam frame or telemetry —
leaves the browser. AGPL-3.0-or-later — free and open source, like all
Universal Apps.

## Suite context

This repo is one part of the **Universal Simulation suite** (the open-source
Universal Apps family). For cross-repo context — how the `@unisim/sdk`, edge
routing, and the suite changelog wire together — see the suite docs repo:
[`universal-simulation-ltd/docs`](https://github.com/universal-simulation-ltd/docs)
(private; checked out at the umbrella root as `Docs_UNI_SIM/` for suite
contributors). Start with `ARCHITECTURE.md` (the cross-repo map).
