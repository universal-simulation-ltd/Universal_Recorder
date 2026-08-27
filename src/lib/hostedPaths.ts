// Object paths for cloud recordings — and the repair for the ones the old flow
// filed under a name that was never real.
//
// ⚠️ THE LANDMINE THIS MODULE EXISTS FOR. `hosted_uploads` (migration 0041) has
// RLS enabled and grants members exactly ONE policy: `for select`. There is no
// member UPDATE policy anywhere in 0041–0127 — deliberately, because the
// consume/refund RPCs are meant to be the only writers. But the store flow was
// written as three steps:
//
//   1. consumeHostedUpload({ storagePath: 'pending' })   ← reserves the token
//   2. upload the blob to `<org>/recorder/<upload_id>-<name>.<ext>`
//   3. UPDATE hosted_uploads SET storage_path = <the real path>
//
// Step 3 matches no rows under RLS. PostgREST answers that with a perfectly
// happy "0 rows updated", the call site never looked at the result, and so
// EVERY cloud recording's ledger row kept `storage_path = 'pending'`. The "In
// the cloud" panel reads the ledger, so the recording shows up; pressing Play
// asks storage for an object literally named `pending`, which does not exist
// and never did — "Object not found", against a file that is sitting safely in
// the bucket the whole time.
//
// So this module does two things:
//
//   * `hostedRecordingPath` names the object BEFORE the token is reserved, so
//     the ledger records the truth at insert time and step 3 disappears; and
//   * `hostedRecordingPathCandidates` rebuilds where a legacy row's bytes
//     actually went. The old path was fully determined by data still on the row
//     — `<org_id>/recorder/<id>-<file_name>` — so a 'pending' row is
//     recoverable, not lost. That is why the fix plays old recordings instead
//     of only apologising for them.
//
// Kept free of imports on purpose: `scripts/hostedPath.test.mjs` loads it under
// Node's type-stripping, which cannot resolve the SDK or the React hooks.

/** The `recorder` segment of every Universal Recorder object path. Also the SDK
 *  product code — it must match `product` in main.tsx and the usage enum. */
export const HOSTED_PRODUCT = 'recorder'

/** The placeholder the old three-step flow filed rows under. */
export const PENDING_PATH = 'pending'

/** What a nameless row is assumed to have been called. */
export const FALLBACK_FILE_NAME = 'recording.webm'

/**
 * Keep the object name to a safe slug (the recording's default name is a locale
 * date string, which is full of separators).
 *
 * ⚠️ Byte-for-byte what the store flow has always used, and what `useCloud`
 * matches a cloud row back to its on-device recording with. Changing it would
 * break both the legacy path reconstruction above — the only reason old cloud
 * recordings can be played at all — and the ✓ "already in the cloud" marker.
 */
export function safeStem(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 60) || 'recording'
  )
}

/**
 * A unique object id, generated on the client so the path can be known before
 * the ledger row exists.
 *
 * ⚠️ Not `crypto.randomUUID()` on its own. That one is gated on a secure
 * context; `getRandomValues` has no such gate, so it is the fallback rather
 * than the other way round, and a plain timestamp is the last resort.
 */
export function newObjectId(): string {
  const c = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined
  if (c?.randomUUID) {
    try {
      return c.randomUUID()
    } catch {
      // fall through
    }
  }
  if (c?.getRandomValues) {
    const bytes = new Uint8Array(16)
    c.getRandomValues(bytes)
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  }
  return `${Date.now().toString(16)}${Math.random().toString(16).slice(2, 14)}`
}

/**
 * Where a cloud recording lives:
 * `hosted-uploads/<org_id>/recorder/<object_id>-<file_name>`.
 *
 * `fileName` is already `<safeStem(name)>.<ext>` — the same string the ledger
 * stores as `file_name`, which is what makes a legacy row reconstructible.
 *
 * The first segment MUST be the org id — every storage policy on the bucket
 * (0041, re-cut in 0093) reads it as `storage.foldername(name)[1]` and checks
 * `is_org_member(…)`. A path without it, `pending` being the obvious example,
 * fails the read policy as well as being absent, which is the second reason the
 * old rows could never be opened.
 */
export function hostedRecordingPath(orgId: string, objectId: string, fileName: string | null | undefined): string {
  const name = fileName?.trim() || FALLBACK_FILE_NAME
  return `${orgId}/${HOSTED_PRODUCT}/${objectId}-${name}`
}

/**
 * True when a ledger row's `storage_path` can be handed to storage as-is:
 * non-empty, not the `pending` placeholder, and rooted at the row's own org so
 * the bucket's member-read policy will allow it.
 */
export function isUsableStoragePath(path: string | null | undefined, orgId: string | null | undefined): boolean {
  if (typeof path !== 'string') return false
  const trimmed = path.trim()
  if (!trimmed || trimmed === PENDING_PATH) return false
  if (!orgId) return false
  return trimmed.startsWith(`${orgId}/`)
}

/** The fields of a `hosted_uploads` row this module needs. */
export interface HostedUploadRef {
  id: string
  org_id: string
  storage_path: string | null
  file_name: string | null
}

/**
 * Every place this recording's bytes could be, best guess first: the path the
 * ledger records, then — for the 'pending' rows the old flow left behind — the
 * path the uploader would have used, rebuilt from the row's own id and name.
 *
 * De-duplicated, so a healthy row yields exactly one candidate and callers can
 * treat "all of them missed" as a genuine miss.
 */
export function hostedRecordingPathCandidates(upload: HostedUploadRef): string[] {
  const out: string[] = []
  const recorded = upload.storage_path?.trim()
  if (isUsableStoragePath(recorded, upload.org_id) && recorded) out.push(recorded)
  const legacy = hostedRecordingPath(upload.org_id, upload.id, upload.file_name)
  if (!out.includes(legacy)) out.push(legacy)
  return out
}
