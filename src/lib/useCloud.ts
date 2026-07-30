import { useCallback, useState } from 'react'
import {
  useAppFreeToken,
  useCredits,
  useHostedUploads,
  useUniversal,
  useUser,
  type HostedUpload,
} from '@unisim/sdk'
import {
  MAX_CLOUD_BYTES,
  PRODUCT,
  deleteHostedRecording,
  storeRecording,
} from './hostedRecordings'
import type { StoredRecording } from './types'

// All the "save to cloud" state in one place, so the Save-to-cloud button on each
// on-device recording and the "In the cloud" panel share one view of the token
// wall and one list of cloud recordings. Called once, in RecorderStudio, and
// handed to both.
//
// A guest has no Universal ID, so there is nothing to charge and nowhere to put
// the file — asking to save opens the sign-up dialog instead of erroring.

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
  uploads: HostedUpload[]
  loading: boolean
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
}

/** Match a cloud row back to the on-device recording it came from — the object
 *  name is `<upload_id>-<slugged recording name>.<ext>`, and the ledger keeps
 *  the same `<slug>.<ext>` as `file_name`. */
function slugOf(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 60) || 'recording'
  )
}

export function useCloud(): Cloud {
  const { supabase, session, activeOrgId } = useUniversal()
  const { user } = useUser()
  const { credits, refresh: refreshCredits } = useCredits()
  const { status: freeToken, refresh: refreshFreeToken } = useAppFreeToken(PRODUCT)
  const { uploads, loading, refresh: refreshList } = useHostedUploads(PRODUCT)

  const [busyId, setBusyId] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [signInOpen, setSignInOpen] = useState(false)

  const signedIn = !!session?.user && session.user.is_anonymous !== true
  const tokens = credits ?? 0
  const canSave = freeToken === 'available' || tokens > 0

  const clearError = useCallback(() => setError(null), [])

  const isStored = useCallback(
    (rec: StoredRecording) => {
      const stem = slugOf(rec.name)
      return uploads.some(u => (u.file_name ?? '').replace(/\.[^.]+$/, '') === stem)
    },
    [uploads],
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

  return {
    signedIn,
    email: user?.email,
    tokens,
    freeToken,
    canSave,
    uploads,
    loading,
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
  }
}
