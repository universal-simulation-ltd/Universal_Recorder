import { useCallback, useEffect, useState } from 'react'
import {
  useAppFreeToken,
  useCredits,
  useOrg,
  useOrgMembers,
  useUniversal,
  useUser,
  type HostedUpload,
} from '@unisim/sdk'
import {
  MAX_CLOUD_BYTES,
  PRODUCT,
  deleteHostedRecording,
  setRecordingShared,
  storeRecording,
} from './hostedRecordings'
import { safeStem } from './hostedPaths'
import type { StoredRecording } from './types'

// All the "save to cloud" state in one place, so the Save-to-cloud button on each
// on-device recording and the "In the cloud" panel share one view of the token
// wall and one list of cloud recordings. Called once, in RecorderStudio, and
// handed to both.
//
// A guest has no Universal ID, so there is nothing to charge and nowhere to put
// the file — asking to save opens the sign-up dialog instead of erroring.

/** A cloud recording row, plus the per-recording share flag (migration 0194).
 *  Private to the person who saved it unless `shared_with_org`. */
export type CloudUpload = HostedUpload & { shared_with_org: boolean }

export interface Cloud {
  /** A real (non-anonymous) Universal ID session is present. */
  signedIn: boolean
  email: string | null | undefined
  /** Purchased wallet tokens. */
  tokens: number
  /** This app's free "Everyday" token: 'available' | 'held' | 'spent' | null. */
  freeToken: 'available' | 'held' | 'spent' | null
  /** A token is available from either pool. */
  canSave: boolean
  /** Your own cloud recordings, plus any a colleague has shared with the
   *  company (RLS, migration 0194, decides which rows come back). */
  uploads: CloudUpload[]
  loading: boolean
  /** The signed-in user's id — a row with another user_id is a colleague's
   *  shared recording: playable, never deletable or re-shareable. */
  myUserId: string | null
  /** The workspace has other people in it, so "Share with your company"
   *  means something. A one-person workspace never sees the option. */
  inCompany: boolean
  /** The company's name, for the share toggle's label. */
  companyName: string | null
  /** The recording id currently uploading, the upload id currently being
   *  removed, or null. */
  busyId: string | null
  busy: boolean
  /** The recording id that just landed in the cloud (drives the ✓ flash). */
  savedId: string | null
  error: string | null
  clearError: () => void
  /** Whether the sign-up / sign-in dialog is open. */
  signInOpen: boolean
  setSignInOpen: (open: boolean) => void
  /** Too big to ever fit in the cloud — the button explains instead of failing. */
  tooBig: (rec: StoredRecording) => boolean
  /** True once this recording has a cloud copy (matched on the stored filename,
   *  which carries the recording's name). */
  isStored: (rec: StoredRecording) => boolean
  /** Save one recording to the cloud, spending a token. Guests get the sign-up
   *  dialog. */
  save: (rec: StoredRecording) => Promise<void>
  /** Delete a cloud recording and get the token back. */
  remove: (upload: HostedUpload) => Promise<void>
  /** Share one of your own recordings with your company, or stop sharing. */
  setShared: (upload: CloudUpload, shared: boolean) => Promise<void>
}

// The list is read here rather than through the SDK's `useHostedUploads`,
// because that hook's column list predates `shared_with_org` (0194).
const UPLOAD_COLUMNS =
  'id, org_id, user_id, product, storage_path, file_name, size_bytes, created_at, shared_with_org'

function useRecorderUploads(orgId: string | null | undefined, signedIn: boolean) {
  const { supabase } = useUniversal()
  const [uploads, setUploads] = useState<CloudUpload[]>([])
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!orgId || !signedIn) {
      setUploads([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    supabase
      .from('hosted_uploads')
      .select(UPLOAD_COLUMNS)
      .eq('org_id', orgId)
      .eq('product', PRODUCT)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return
        setUploads(error ? [] : ((data ?? []) as CloudUpload[]))
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [supabase, orgId, signedIn, tick])

  const refresh = useCallback(() => setTick(t => t + 1), [])
  return { uploads, loading, refresh }
}

// Matching a cloud row back to the on-device recording it came from uses the
// SAME slug the object name is built from (`<object_id>-<slug>.<ext>`, with
// `<slug>.<ext>` kept on the ledger as `file_name`) — hence `safeStem` from
// `hostedPaths`, rather than the second copy of it that used to live here.

export function useCloud(): Cloud {
  const { supabase, session, activeOrgId } = useUniversal()
  const { user } = useUser()
  const { credits, refresh: refreshCredits } = useCredits()
  const { status: freeToken, refresh: refreshFreeToken } = useAppFreeToken(PRODUCT)
  const { org } = useOrg()
  const { members } = useOrgMembers()

  const [busyId, setBusyId] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [signInOpen, setSignInOpen] = useState(false)

  const signedIn = !!session?.user && session.user.is_anonymous !== true
  const myUserId = session?.user?.id ?? null
  const { uploads, loading, refresh: refreshList } = useRecorderUploads(activeOrgId, signedIn)
  const inCompany = members.length > 1
  const tokens = credits ?? 0
  const canSave = freeToken === 'available' || tokens > 0

  const clearError = useCallback(() => setError(null), [])

  const isStored = useCallback(
    (rec: StoredRecording) => {
      const stem = safeStem(rec.name)
      // Only your own cloud copies: a colleague's shared recording that happens
      // to carry the same name is not a copy of yours.
      return uploads.some(
        u => u.user_id === myUserId && (u.file_name ?? '').replace(/\.[^.]+$/, '') === stem,
      )
    },
    [uploads, myUserId],
  )

  const tooBig = useCallback((rec: StoredRecording) => rec.blob.size > MAX_CLOUD_BYTES, [])

  const save = useCallback(
    async (rec: StoredRecording) => {
      setError(null)
      // Guest → there's no Universal ID to save against. Prompt to create one.
      if (!signedIn) {
        setSignInOpen(true)
        return
      }
      if (!activeOrgId) {
        setError('Your Universal ID has no workspace yet — open app.unisim.co.uk once to finish setting it up.')
        return
      }
      if (busyId) return
      setBusyId(rec.id)
      try {
        const res = await storeRecording(supabase, activeOrgId, rec)
        if (!res.ok) {
          setError(
            res.error === 'no_credits'
              ? freeToken === 'held'
                ? 'Your free Recorder token is in use — delete the recording already in the cloud to get it back, or add tokens.'
                : 'You have no tokens left. Get more to keep saving recordings to the cloud.'
              : res.error ?? 'Could not save this recording to the cloud.',
          )
        } else {
          setSavedId(rec.id)
          window.setTimeout(() => setSavedId(null), 2400)
          refreshCredits()
          refreshFreeToken()
          refreshList()
        }
      } finally {
        setBusyId(null)
      }
    },
    [signedIn, activeOrgId, busyId, supabase, freeToken, refreshCredits, refreshFreeToken, refreshList],
  )

  const remove = useCallback(
    async (upload: HostedUpload) => {
      if (busyId) return
      setError(null)
      setBusyId(upload.id)
      try {
        const res = await deleteHostedRecording(supabase, upload)
        if (!res.ok) setError(res.error ?? 'Could not delete this cloud recording.')
        else {
          refreshCredits()
          refreshFreeToken()
          refreshList()
        }
      } finally {
        setBusyId(null)
      }
    },
    [busyId, supabase, refreshCredits, refreshFreeToken, refreshList],
  )

  const setShared = useCallback(
    async (upload: CloudUpload, shared: boolean) => {
      if (busyId) return
      setError(null)
      setBusyId(upload.id)
      try {
        const res = await setRecordingShared(supabase, upload.id, shared)
        if (!res.ok) setError(res.error ?? 'Could not change who can see this recording.')
        refreshList()
      } finally {
        setBusyId(null)
      }
    },
    [busyId, supabase, refreshList],
  )

  return {
    signedIn,
    email: user?.email,
    tokens,
    freeToken,
    canSave,
    uploads,
    loading,
    myUserId,
    inCompany,
    companyName: org?.name ?? null,
    busyId,
    busy: busyId !== null,
    savedId,
    error,
    clearError,
    signInOpen,
    setSignInOpen,
    tooBig,
    isStored,
    save,
    remove,
    setShared,
  }
}
