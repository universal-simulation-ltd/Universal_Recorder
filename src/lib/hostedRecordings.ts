import {
  consumeHostedUpload,
  refundHostedUpload,
  HOSTED_BUCKET,
  type HostedUpload,
} from '@unisim/sdk'
import type { StoredRecording } from './types'

// "Hosted by UNI·SIM" cloud storage for Universal Recorder. Recording, encoding
// and the on-device library stay free and local — this is the opt-in path that
// keeps ONE recording online against the user's Universal ID. It spends the
// org's free per-app Recorder token (migration 0045) or one purchased wallet
// credit, and deleting the cloud copy returns the token.
//
// Backend: migration 0041 (bucket + ledger + consume/refund RPCs), 0045 (per-app
// free tokens), 0095 (audio/video MIME types on the bucket).

type Supabase = Parameters<typeof consumeHostedUpload>[0]

/** SDK product code — must match `product` in main.tsx and the usage enum. */
export const PRODUCT = 'recorder'

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
  const consumed = await consumeHostedUpload(supabase, {
    product: PRODUCT,
    storagePath: 'pending',
    fileName,
    sizeBytes: rec.blob.size,
  })
  if (!consumed.ok || !consumed.upload_id) {
    return { ok: false, error: consumed.error ?? 'Could not reserve a token.' }
  }

  const path = `${orgId}/${PRODUCT}/${consumed.upload_id}-${fileName}`
  const { error: upErr } = await supabase.storage
    .from(HOSTED_BUCKET)
    .upload(path, rec.blob, { contentType: contentType(rec), upsert: true })

  if (upErr) {
    await refundHostedUpload(supabase, consumed.upload_id)
    return { ok: false, error: upErr.message }
  }

  await supabase.from('hosted_uploads').update({ storage_path: path }).eq('id', consumed.upload_id)
  return { ok: true, creditsRemaining: consumed.credits }
}

/** Delete a cloud recording — the storage object first (member RLS allows it),
 *  then the ledger row, which refunds the token. */
export async function deleteHostedRecording(
  supabase: Supabase,
  upload: HostedUpload,
): Promise<StoreResult> {
  await supabase.storage.from(HOSTED_BUCKET).remove([upload.storage_path])
  const res = await refundHostedUpload(supabase, upload.id)
  if (!res.ok) return { ok: false, error: res.error ?? 'Could not refund the token.' }
  return { ok: true, creditsRemaining: res.credits }
}

/** Download a cloud recording and hand back an object URL for playback. The
 *  bucket is private, so this goes through the authenticated download rather
 *  than a public URL. The caller owns the URL and must revoke it. */
export async function hostedRecordingUrl(
  supabase: Supabase,
  upload: HostedUpload,
): Promise<{ url: string; hasVideo: boolean }> {
  const { data, error } = await supabase.storage.from(HOSTED_BUCKET).download(upload.storage_path)
  if (error || !data) throw new Error(error?.message ?? 'Could not download the recording.')
  // We upload with an explicit `video/*` or `audio/*` Content-Type (see
  // `contentType` below), so the downloaded blob's type tells us which element
  // to render. `.webm` alone can't — it's both containers.
  return { url: URL.createObjectURL(data), hasVideo: data.type.startsWith('video/') }
}

/** Save a cloud recording straight to the device. */
export async function downloadHostedRecording(
  supabase: Supabase,
  upload: HostedUpload,
): Promise<void> {
  const { data, error } = await supabase.storage.from(HOSTED_BUCKET).download(upload.storage_path)
  if (error || !data) throw new Error(error?.message ?? 'Could not download the recording.')
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

/** Keep the object name to a safe slug (the recording's default name is a
 *  locale date string, which is full of separators). */
function safeStem(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 60) || 'recording'
  )
}
