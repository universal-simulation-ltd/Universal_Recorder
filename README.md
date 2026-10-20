# Universal Recorder

Record in your browser — **microphone**, **system audio**, your **screen**, and your
**webcam** — in any combination. The webcam composites onto the screen as a
picture-in-picture overlay. Save as **MP4/WebM** (screen/webcam) or **WebM/MP3/WAV**
(audio-only). Local-first: recordings are captured, encoded and stored entirely on
your device (IndexedDB) — nothing is uploaded. No sign-in.

Part of the open-source **Universal Apps** family (sibling to Universal PDF /
Images / QR / Signatures). Served at `opensource.unisim.co.uk/recorder`.

## Features

- **Four sources** — microphone (`getUserMedia`), system audio
  (`getDisplayMedia`, Chrome/Edge — tick *Share audio*), the screen as video,
  and the webcam (`getUserMedia`) — any combination. Audio mixes through one
  Web Audio graph.
- **Webcam overlay** — the camera is composited onto the screen as a
  **picture-in-picture** (choose the corner + size, adjustable live) via
  `<canvas>.captureStream()`, or recorded full-frame when no screen is shared.
- **Transport** — record / pause / resume / stop, a live level meter, a live
  self-view of the video, and an elapsed timer.
- **Device pickers** — choose which microphone and camera to capture.
- **Playback** — listen back / watch the finished clip in-page.
- **Save as** — WebM/Opus (native `MediaRecorder`), plus WAV (PCM muxer) and MP3
  (`lamejs`) transcoded on-device from the decoded audio.
- **Local-first recents** — finished recordings are kept in IndexedDB; play,
  re-download in any format, or delete.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build  → dist/
npm run typecheck
```

Production is served under `/recorder/` (Vite `base`); `public/_redirects`
rewrites the flat `dist/` output for the Cloudflare Pages prefix.

Each build bakes the commit SHA into a `<meta name="build-sha">` tag and logs
`build: <sha>` to the console at startup, so you can tell which build is live
in-browser. On Cloudflare Pages the SHA comes from `CF_PAGES_COMMIT_SHA`; locally
it falls back to the git short SHA (or `dev`).

## Privacy

The full, checkable account is in [PRIVACY.md](PRIVACY.md).

Recording, compositing, encoding and storage all run client-side, and nothing
— no recording, no preview, no screen still, no webcam frame, no telemetry about
the audio — leaves the browser. A recording leaves your device only when you
download it.

There is no sign-in (`noAccounts: true` in `src/main.tsx`, 2026-10-20). Signing
in only ever unlocked an opt-in "Save to cloud" (one recording in the shared
`hosted-uploads` bucket, optionally shared with a company); that was removed at
the same time, with no Recorder cloud recordings on prod to strand.
