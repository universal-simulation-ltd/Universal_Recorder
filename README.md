# Universal Recorder

Record audio in your browser — **microphone**, **system audio**, or **both** — and
save it as **WebM**, **MP3** or **WAV**. Local-first: recordings are captured,
encoded and stored entirely on your device (IndexedDB); nothing is uploaded.

Part of the open-source **Universal Apps** family (sibling to Universal PDF /
Images / QR / Signatures). Served at `opensource.unisim.co.uk/recorder`.

## Features

- **Three sources** — microphone (`getUserMedia`), system audio
  (`getDisplayMedia`, Chrome/Edge — tick *Share audio*), or a real mix of both
  through one Web Audio graph.
- **Transport** — record / pause / resume / stop, a live level meter and an
  elapsed timer.
- **Device picker** — choose which microphone to capture.
- **Playback** — listen back to the finished clip in-page.
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

## Privacy

Everything runs client-side. The Universal ID session only drives the shared
navbar/profile — there is **no** upload path. MIT licensed.
