# Universal Recorder

Record in your browser — **microphone**, **system audio**, your **screen**, and your
**webcam** — in any combination. The webcam composites onto the screen as a
picture-in-picture overlay. Save as **MP4/WebM** (screen/webcam) or **WebM/MP3/WAV**
(audio-only). Local-first: recordings are captured, encoded and stored entirely on
your device (IndexedDB) — nothing is uploaded unless you deliberately press
**Save to cloud** on one.

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
- **Save to cloud** (opt-in) — the collapsible **In the cloud** panel sits under
  *On this device*. A guest is invited to create a free Universal ID; a signed-in
  user can push any on-device recording to the shared `hosted-uploads` bucket for
  one reusable **Recorder** token, then play it back, download it, or delete it —
  deleting returns the token. Backend: `@unisim/sdk` hosted helpers +
  `hosted_consume_and_record` / `hosted_refund_and_delete` (universal-platform
  migrations 0041, 0045, 0095). Cloud saves are capped at **50 MB** per file
  (the bucket limit, and the Supabase Free-plan project ceiling) — hours of
  Opus audio, but only a couple of minutes of screen video, so long captures
  stay download-only.

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

Recording, compositing, encoding and storage all run client-side, and that is the
only path a guest ever uses. There is exactly **one** upload path and it is
explicit: pressing **Save to cloud** on a recording, while signed in with a
Universal ID, uploads that recording's blob to the private `hosted-uploads`
bucket. Nothing else — no preview, no screen still, no webcam frame, no
telemetry about the audio — leaves the browser. Deleting the cloud copy removes
the object and returns the token. MIT licensed.
