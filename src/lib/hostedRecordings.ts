import {
  storeHostedFile,
  deleteHostedUpload,
  downloadHostedObject,
  hostedObjectUrl,
  type HostedUpload,
} from '@unisim/sdk'
import {
  HOSTED_PRODUCT,
  hostedRecordingPath,
  hostedRecordingPathCandidates,
  newObjectId,
  safeStem,
} from './hostedPaths'
import type { StoredRecording } from './types'

// "Hosted by UNI·SIM" cloud storage for Universal Recorder. Recording, encoding
// and the on-device library stay free and local — this is the opt-in path that
// keeps ONE recording online against the user's Universal ID. It spends the
// org's free per-app Recorder token (migration 0045) or one purchased wallet
// credit, and deleting the cloud copy returns the token.
//
// Backend: migration 0041 (bucket + ledger + consume/refund RPCs), 0045 (per-app
// free tokens), 0095 (audio/video MIME types on the bucket), 0194 (private to
// the saver until shared), 0226 (new saves may go to Cloudflare R2).
//
// Where the bytes live is the ROW's call, not this app's (0226): new saves
// offer R2 and the server picks, and every row says which in
// `storage_backend`. Older recordings — and anything an older native build
// saves — are on Supabase Storage and stay there, so every read and delete goes
// through the SDK helpers with the row's own backend. The saver-only rule
// holds on both: the R2 signer asks the same question the bucket's policies do.

type Supabase = Parameters<typeof storeHostedFile>[0]

/** SDK product code — must match `product` in main.tsx and the usage enum.
 *  Re-exported from `hostedPaths` so the object path and the product code can
 *  never disagree. */
export const PRODUCT = HOSTED_PRODUCT

/** The bucket's per-file ceiling (0041), which is also the Supabase Free-plan
 *  project-wide upload limit. Checked before the token is reserved so an
 *  over-size recording never costs a token. */
export const MAX_CLOUD_BYTES = 50 * 1024 * 1024

export function fmtBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export interface StoreResult {
  ok: boolean
  error?: string
  creditsRemaining?: number
}

/** Spend one token and store a recording in the cloud. The token is reserved
 *  first, then the blob is uploaded; a failed upload refunds it, so the user is
 *  never charged for a recording that isn't there. */
export async function storeRecording(
  supabase: Supabase,
  orgId: string,
  rec: StoredRecording,
): Promise<StoreResult> {
  if (rec.blob.size > MAX_CLOUD_BYTES) {
    return {
      ok: false,
      error: `This recording is ${fmtBytes(rec.blob.size)} — cloud saves are capped at ${fmtBytes(MAX_CLOUD_BYTES)}. Download it to your device instead.`,
    }
  }

  const fileName = `${safeStem(rec.name)}.${nativeExt(rec)}`

  // ⚠️ NAME THE OBJECT FIRST. This used to reserve the row with a placeholder
  // `storagePath: 'pending'`, upload, then UPDATE the row with the real path —
  // and that update silently did nothing on every account that isn't the
  // platform admin, because `hosted_uploads` grants members SELECT and nothing
  // else (0041). So the ledger kept saying `pending`, the panel listed a cloud
  // recording, and Play asked storage for an object named `pending`: "Object
  // not found", for a file that had uploaded perfectly. See `hostedPaths.ts`
  // for the full write-up and the legacy recovery.
  //
  // A client-side object id removes the round trip the RLS was blocking: the
  // path is known before the token is reserved, so the RPC records the truth
  // at insert time and there is no second write to fail.
  const path = hostedRecordingPath(orgId, newObjectId(), fileName)

  // Reserve the token, then upload to whichever backend the server chose;
  // storeHostedFile refunds the token itself if the upload fails.
  const stored = await storeHostedFile(supabase, {
    product: PRODUCT,
    storagePath: path,
    fileName,
    body: rec.blob,
    contentType: contentType(rec),
  })
  if (!stored.ok || !stored.upload_id) {
    return { ok: false, error: stored.error ?? 'Could not save this recording to the cloud.' }
  }

  return { ok: true, creditsRemaining: stored.credits }
}

/** Share one of your own cloud recordings with your company, or stop sharing
 *  (migration 0194). A cloud recording is private to the person who saved it
 *  until they choose this; only the saver can change it, and sharing lets
 *  colleagues play and download it — never delete it. */
export async function setRecordingShared(
  supabase: Supabase,
  uploadId: string,
  shared: boolean,
): Promise<StoreResult> {
  const { data, error } = await supabase.rpc('hosted_set_shared', {
    p_upload_id: uploadId,
    p_shared: shared,
  })
  if (error) return { ok: false, error: error.message }
  const res = (data ?? {}) as { ok?: boolean; error?: string }
  if (!res.ok) {
    return {
      ok: false,
      error: res.error === 'not_found' ? 'Only the person who saved a recording can share it.' : res.error,
    }
  }
  return { ok: true }
}

/** Delete a cloud recording — the storage object first (the saver's storage RLS allows it, 0194),
 *  then the ledger row, which refunds the token. An R2 row is removed and
 *  refunded in one call to the hosted-files function, which applies the same
 *  saver-only rule.
 *
 *  Removes EVERY path the bytes could be under, not just the one the ledger
 *  names: a legacy row says `pending`, so deleting only that would refund the
 *  token and leave the real recording — up to 50 MB of it — orphaned in the
 *  bucket forever, with the row that pointed at it gone. */
export async function deleteHostedRecording(
  supabase: Supabase,
  upload: HostedUpload,
): Promise<StoreResult> {
  const res = await deleteHostedUpload(supabase, upload, hostedRecordingPathCandidates(upload))
  if (!res.ok) return { ok: false, error: res.error ?? 'Could not delete this cloud recording.' }
  return { ok: true, creditsRemaining: res.credits }
}

/**
 * Thrown when a listed cloud recording has no object behind it anywhere we know
 * to look.
 *
 * A distinct type so the panel can answer honestly — name the recording, say
 * the upload never completed, and offer to clear the entry and take the token
 * back — instead of surfacing storage's bare "Object not found", which reads
 * like the app has lost the user's recording.
 */
export class HostedObjectMissingError extends Error {
  readonly fileName: string
  constructor(fileName: string) {
    super(`"${fileName}" is listed as saved to the cloud, but there is no file behind it.`)
    this.name = 'HostedObjectMissingError'
    this.fileName = fileName
  }
}

/**
 * Fetch a cloud recording's bytes, trying every candidate path in turn (see
 * `hostedRecordingPathCandidates`), so the recordings the old three-step store
 * flow filed as `pending` still play: their bytes are in the bucket under the
 * name the uploader used, which is fully recoverable from the row itself. Only
 * when nothing is there does this throw `HostedObjectMissingError`, so the
 * caller can offer the cleanup.
 */
async function downloadHostedBlob(supabase: Supabase, upload: HostedUpload): Promise<Blob> {
  let lastError: string | null = null

  for (const path of hostedRecordingPathCandidates(upload)) {
    const { data, error } = await downloadHostedObject(supabase, { backend: upload.storage_backend, path })
    if (data && !error) return data
    lastError = error?.message ?? null
  }

  // Every candidate missed. Distinguish "not there" from "could not ask" — a
  // dropped connection or an expired session must NOT be reported as a dead
  // recording, or the user is invited to delete one that is perfectly fine.
  if (lastError && !/not.?found|does not exist|404/i.test(lastError)) {
    throw new Error(lastError)
  }
  throw new HostedObjectMissingError(upload.file_name || 'recording')
}

/** How long an R2 playback link lasts: the hosted-files function's ceiling,
 *  long enough to listen to (and seek around) a recording left open. */
const PLAYBACK_TTL_S = 6 * 60 * 60

/** Hand back a URL for playback. The caller owns the URL and must revoke it
 *  (a no-op for the R2 link, which is not an object URL).
 *
 *  - Supabase rows: the bucket is private, so this downloads through the
 *    authenticated client and returns an object URL, as it always has.
 *  - R2 rows (0226): a short-lived signed link straight to the recording, so
 *    the player streams it and seeks with Range requests instead of pulling up
 *    to 50 MB down first. A HEAD on the same link tells audio from video and
 *    turns a missing object into the same `HostedObjectMissingError`. */
export async function hostedRecordingUrl(
  supabase: Supabase,
  upload: HostedUpload,
): Promise<{ url: string; hasVideo: boolean }> {
  if (upload.storage_backend === 'r2') return hostedR2RecordingUrl(supabase, upload)
  const data = await downloadHostedBlob(supabase, upload)
  // We upload with an explicit `video/*` or `audio/*` Content-Type (see
  // `contentType` below), so the downloaded blob's type tells us which element
  // to render. `.webm` alone can't — it's both containers.
  return { url: URL.createObjectURL(data), hasVideo: data.type.startsWith('video/') }
}

async function hostedR2RecordingUrl(
  supabase: Supabase,
  upload: HostedUpload,
): Promise<{ url: string; hasVideo: boolean }> {
  const missing = () => new HostedObjectMissingError(upload.file_name || 'recording')
  const path = hostedRecordingPathCandidates(upload)[0]
  if (!path) throw missing()
  const { data: url, error } = await hostedObjectUrl(supabase, { backend: 'r2', path, expiresIn: PLAYBACK_TTL_S })
  if (error || !url) {
    if (!error || /not.?found|does not exist|404/i.test(error.message)) throw missing()
    throw new Error(error.message)
  }
  const head = await fetch(url, { method: 'HEAD' })
  if (head.status === 404) throw missing()
  if (!head.ok) throw new Error(`Could not open this recording (${head.status}).`)
  return { url, hasVideo: (head.headers.get('Content-Type') ?? '').startsWith('video/') }
}

/** Save a cloud recording straight to the device. */
export async function downloadHostedRecording(
  supabase: Supabase,
  upload: HostedUpload,
): Promise<void> {
  const data = await downloadHostedBlob(supabase, upload)
  const url = URL.createObjectURL(data)
  const a = document.createElement('a')
  a.href = url
  a.download = upload.file_name || 'recording.webm'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** The recording's real container extension — MP4 where the browser recorded
 *  it, else WebM (matching the studio's own `nativeExt`). */
function nativeExt(rec: StoredRecording): string {
  return rec.mimeType.includes('mp4') ? 'mp4' : 'webm'
}

/** A bucket-safe Content-Type: the bare type/subtype, without MediaRecorder's
 *  `;codecs=…` suffix, and never `audio/*` for a video recording. */
function contentType(rec: StoredRecording): string {
  const ext = nativeExt(rec)
  if (rec.hasVideo) return ext === 'mp4' ? 'video/mp4' : 'video/webm'
  return ext === 'mp4' ? 'audio/mp4' : 'audio/webm'
}

