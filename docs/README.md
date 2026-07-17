# Universal Recorder — docs

## What this repo is

Universal Recorder records audio in the browser — **microphone, system audio
(Chrome/Edge tab/screen share audio), or a real mix of both** through one Web
Audio graph — and saves the result as **WebM, MP3 or WAV**. Local-first:
recordings are captured, encoded and stored entirely on-device (IndexedDB);
nothing is uploaded.

- **Live:** [opensource.unisim.co.uk/recorder](https://opensource.unisim.co.uk/recorder)
  — served by path via the `opensource-portal` Worker, which proxies
  `/recorder` to the `universal-recorder` Cloudflare Pages project
  (Direct-Upload; deploy with
  `wrangler pages deploy dist --project-name=universal-recorder`).
- **Stack:** Vite + React 18 + TypeScript. Native `MediaRecorder` for
  WebM/Opus, a PCM muxer for WAV, and `lamejs` for on-device MP3 transcoding.
- **Features:** record/pause/resume/stop transport, live level meter, mic
  device picker, in-page playback, and local-first recents (play, re-download
  in any format, delete).

The Universal ID session only drives the shared `@unisim/sdk` navbar/profile —
there is no upload path. MIT licensed — free and open source, like all
Universal Apps.

## Suite context

This repo is one part of the **Universal Simulation suite** (the open-source
Universal Apps family). For cross-repo context — how the `@unisim/sdk`, edge
routing, and the suite changelog wire together — see the suite docs repo:
[`universal-simulation-ltd/docs`](https://github.com/universal-simulation-ltd/docs)
(private; checked out at the umbrella root as `Docs_UNI_SIM/` for suite
contributors). Start with `ARCHITECTURE.md` (the cross-repo map).
