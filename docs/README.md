# Universal Recorder — docs

## What this repo is

Universal Recorder records in the browser — **microphone, system audio
(Chrome/Edge tab/screen share audio), the screen as video, and the webcam** —
any combination at once. Audio mixes through one Web Audio graph; the webcam is
composited onto the screen as a **picture-in-picture overlay** on a `<canvas>`
(or recorded full-frame when no screen is shared). Screen/webcam captures save
as **MP4/WebM**; audio-only saves as **WebM, MP3 or WAV**. Local-first:
recordings are captured, encoded and stored entirely on-device (IndexedDB) and
nothing is uploaded unless the user explicitly presses **Save to cloud** on one.

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
- **Pre-record countdown (beeps):** an optional, configurable audible beep
  run-in (default 3s, off by default) played *after* the screen picker is
  confirmed and *before* `MediaRecorder` starts — so the start cue is audible
  even when the user has switched to the app they're demoing. The beeps go to
  the speakers only and are never recorded. Persisted in
  `localStorage['universal-recorder:countdown']` (`{enabled, seconds}`).
- **Preview gate:** for screen / webcam recordings nothing turns on until the
  user presses the prominent **Preview** button — one action that lights up
  whatever's ticked (live camera + a frozen still of the real screen for the PiP
  backdrop). Start is blocked until a preview has run at least once; audio-only
  recordings start straight away. The gate re-arms when the selected sources (or
  camera) change.

- **Save to cloud (opt-in, 2026-07-30):** a collapsible **"In the cloud"**
  section sits below "On this device", and each on-device recording carries a
  **☁ Save to cloud** button beside its download buttons. A guest is invited to
  create a Universal ID (the SDK's in-app `SignInDialog` in `signup` mode — no
  bounce to the hub); a signed-in user's press spends the org's free per-app
  `recorder` "Everyday" token (or a purchased wallet credit) and uploads the blob
  to the shared private `hosted-uploads` bucket. The panel lists cloud
  recordings with **Play / ⬇ / Delete**, and deleting refunds the token.
  - Code: `src/lib/hostedRecordings.ts` (consume → upload → patch
    `storage_path`; refund on a failed upload) + `src/lib/useCloud.ts` (one
    shared token/list state, so the row buttons and the panel can't disagree) +
    `src/components/CloudRecordings.tsx`.
  - Backend: universal-platform migrations **0041** (bucket, `hosted_uploads`
    ledger, `hosted_consume_and_record` / `hosted_refund_and_delete`), **0045**
    (per-app free tokens) and **0095** — 0095 exists *because of this app*: the
    bucket's `allowed_mime_types` was an allow-list of image/pdf/zip/text, so
    every recorder upload failed at the storage layer **after** the token had
    been reserved. It now also permits `audio/webm|ogg|mpeg|wav|mp4` and
    `video/webm|mp4`.
  - ⚠️ **50 MB per cloud save** (`MAX_CLOUD_BYTES`) — the bucket's
    `file_size_limit` *and* the Supabase **Free-plan** project ceiling, so
    raising one without the other (or without Pro) achieves nothing. Checked
    before the token is reserved, so an over-size recording never costs a token.
    That's hours of Opus audio but only ~2 minutes of screen video.

The Universal ID session drives the shared `@unisim/sdk` navbar/profile and the
single opt-in upload path described above — nothing else (no preview, screen
still, webcam frame or telemetry) leaves the browser. MIT licensed — free and
open source, like all Universal Apps.

## Cloud recordings — and the `pending` path that broke every one of them

**☁ Save to cloud** keeps one recording in the private `hosted-uploads` bucket
against the user's Universal ID for a token, refunded on delete.
`src/lib/hostedRecordings.ts` does the work; `src/lib/hostedPaths.ts` owns the
object names.

### ⚠️ `hosted_uploads` grants members SELECT and nothing else

Migration 0041 enables RLS on `public.hosted_uploads` and creates exactly two
policies: `hosted_uploads_member_read` (`for select`) and a platform-admin
`for all`. There is **no member UPDATE policy in 0041–0127**, on purpose — the
consume/refund RPCs are meant to be the only writers.

The store flow ignored that and was written in three steps:

1. `consumeHostedUpload({ storagePath: 'pending' })` — reserve the token,
2. upload the blob to `<org_id>/recorder/<upload_id>-<file_name>`,
3. `UPDATE hosted_uploads SET storage_path = <the real path>`.

**Step 3 matched zero rows on every account that isn't the platform admin**, and
PostgREST reports that as a perfectly ordinary success — no error, just `0`.
The call site never looked at the result. So the ledger kept saying `pending`
for every cloud recording ever saved: "In the cloud" listed it, and Play (or the
⬇ download) asked storage for an object literally named `pending`, which does
not exist and never did — while the real file sat safely in the bucket the whole
time. `pending` also has no org-id first segment, so it fails the bucket's read
policy (`storage.foldername(name)[1]`) as well as being absent.

### What the fix does

* **Name the object before reserving the token.** `hostedRecordingPath(orgId,
  newObjectId(), fileName)` is computed first and passed to
  `consumeHostedUpload`, so the RPC's own insert records the truth and the
  update that RLS was blocking no longer exists.
* **Recover the rows already filed as `pending`.** The old path was fully
  determined by data still on the row — `<org_id>/recorder/<id>-<file_name>` —
  so `hostedRecordingPathCandidates()` rebuilds it and both Play and Download go
  through `downloadHostedBlob`, which tries each candidate in turn. Existing
  broken recordings play; nothing has to be migrated or re-uploaded.
  ⚠️ **This is why `safeStem` must never drift** — it names new objects *and* is
  how `useCloud.isStored` matches a cloud row back to its on-device recording,
  so a change there would break the ✓ marker too. It now lives in `hostedPaths`
  and is imported by both (there used to be a second copy in `useCloud`). It is
  pinned by `npm run test:hosted-paths`.
* **Fail honestly when there really is nothing there.** Only then does
  `downloadHostedBlob` throw `HostedObjectMissingError`, and `CloudRecordings`
  answers it against the row itself: which recording, that the upload never
  finished, and one button to clear the entry and take the token back. A network
  or session failure is deliberately NOT reported that way.
* **Delete every candidate.** `deleteHostedRecording` removes all of them, so
  refunding a legacy row cannot leave up to 50 MB orphaned in the bucket.

The same landmine was fixed in Universal PDF (`ffae15b`), Images, QR and
Exports — all five had copies of the identical three-step flow.

## Suite context

This repo is one part of the **Universal Simulation suite** (the open-source
Universal Apps family). For cross-repo context — how the `@unisim/sdk`, edge
routing, and the suite changelog wire together — see the suite docs repo:
[`universal-simulation-ltd/docs`](https://github.com/universal-simulation-ltd/docs)
(private; checked out at the umbrella root as `Docs_UNI_SIM/` for suite
contributors). Start with `ARCHITECTURE.md` (the cross-repo map).
