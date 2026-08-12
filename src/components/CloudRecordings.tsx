import { useEffect, useRef, useState } from 'react'
import { SignInDialog, useUniversal, type HostedUpload } from '@unisim/sdk'
import RecordingPlayer from './RecordingPlayer'
import { downloadHostedRecording, fmtBytes, hostedRecordingUrl } from '../lib/hostedRecordings'
import type { Cloud } from '../lib/useCloud'

const HUB_LOGIN_URL = 'https://app.unisim.co.uk/login'
const GET_TOKENS_URL = 'https://www.unisim.co.uk/subscription.html'

interface Props {
  cloud: Cloud
  /** Live 0–1 level / playing flag from a cloud clip, so the studio visualiser
   *  dances for these too (same wiring as the on-device player). */
  onLevel: (level: number) => void
  onPlayingChange: (playing: boolean) => void
}

// "In the cloud" — the sibling of the "On this device" list. Recording stays
// local-first and free; this panel is the opt-in copy kept online against a
// Universal ID, costing this app's one free "Everyday" token (refunded when the
// cloud copy is deleted). A guest sees the invitation to create an ID.
//
// The sign-in dialog lives here but is mounted whether or not the panel is open,
// because a Save-to-cloud press on a device recording opens it too.
export default function CloudRecordings({ cloud, onLevel, onPlayingChange }: Props) {
  const { supabase } = useUniversal()
  const [open, setOpen] = useState(false)
  const [playing, setPlaying] = useState<{ id: string; url: string; hasVideo: boolean } | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [playError, setPlayError] = useState<string | null>(null)

  // The open clip's object URL is revoked explicitly whenever it's replaced or
  // closed; the ref exists only so unmount can revoke the last one. (A
  // `[playing]`-keyed cleanup would revoke the URL we just created under
  // StrictMode's double-invoke.)
  const urlRef = useRef<string | null>(null)
  useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current) }, [])

  function openClip(next: { id: string; url: string; hasVideo: boolean } | null) {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    urlRef.current = next?.url ?? null
    setPlaying(next)
  }

  // A signed-out user has nothing in the cloud, so the count is only meaningful
  // once signed in.
  const count = cloud.signedIn ? cloud.uploads.length : 0

  async function onPlay(upload: HostedUpload) {
    if (loadingId) return
    setPlayError(null)
    if (playing?.id === upload.id) {
      openClip(null)
      return
    }
    setLoadingId(upload.id)
    try {
      const { url, hasVideo } = await hostedRecordingUrl(supabase, upload)
      openClip({ id: upload.id, url, hasVideo })
    } catch (err) {
      setPlayError((err as Error).message)
    } finally {
      setLoadingId(null)
    }
  }

  async function onDownload(upload: HostedUpload) {
    if (loadingId) return
    setPlayError(null)
    setLoadingId(upload.id)
    try {
      await downloadHostedRecording(supabase, upload)
    } catch (err) {
      setPlayError((err as Error).message)
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <section className="mt-6">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="text-xs uppercase tracking-wide text-slate-500 font-medium">
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            aria-expanded={open}
            aria-controls="cloud-list"
            className="inline-flex items-center gap-1.5 uppercase tracking-wide hover:text-slate-700"
          >
            <span
              aria-hidden
              className={`text-[10px] leading-none transition-transform ${open ? 'rotate-90' : ''}`}
            >
              ▶
            </span>
            In the cloud{count > 0 ? ` (${count})` : ''}
          </button>
        </h2>
        {cloud.signedIn && open && (
          <span className="text-xs text-slate-400">
            {cloud.freeToken === 'available'
              ? `Free token${cloud.tokens > 0 ? ` + ${cloud.tokens} purchased` : ' available'}`
              : `${cloud.tokens} token${cloud.tokens === 1 ? '' : 's'}`}
          </span>
        )}
      </div>

      <div id="cloud-list" hidden={!open}>
        {!cloud.signedIn ? (
          /* Guest — the whole point of opening this panel. */
          <div className="rounded-xl border border-orange-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">
              Create a Universal ID to save a recording to cloud
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Your recordings live in this browser only. A free Universal ID lets you keep one
              recording online — reach it from any device, and get your token straight back when
              you delete it.
            </p>
            <button
              type="button"
              onClick={() => cloud.setSignInOpen(true)}
              className="mt-3 inline-flex rounded-lg bg-orange-700 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-800"
            >
              Create a free Universal ID →
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">
              Saved online against <strong className="font-medium text-slate-700">{cloud.email}</strong>.
              One token per recording — delete the cloud copy and your token comes straight back.
            </p>

            {cloud.loading ? (
              <p className="mt-3 text-xs text-slate-400">Loading…</p>
            ) : cloud.uploads.length === 0 ? (
              <p className="mt-3 text-xs text-slate-400">
                Nothing here yet — press <strong className="font-medium text-slate-500">☁ Save to cloud</strong> on
                any recording under “On this device”.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {cloud.uploads.map(u => (
                  <li key={u.id} className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                    <div className="flex items-center gap-2">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-slate-700">
                          {u.file_name || 'recording'}
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          {new Date(u.created_at).toLocaleDateString()}
                          {u.size_bytes > 0 && ` · ${fmtBytes(u.size_bytes)}`}
                        </span>
                      </span>
                      <button
                        onClick={() => void onPlay(u)}
                        disabled={loadingId !== null}
                        className="shrink-0 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:border-orange-400 disabled:opacity-50"
                      >
                        {loadingId === u.id ? 'Loading…' : playing?.id === u.id ? 'Close' : '▶ Play'}
                      </button>
                      <button
                        onClick={() => void onDownload(u)}
                        disabled={loadingId !== null}
                        className="shrink-0 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:border-orange-400 disabled:opacity-50"
                      >
                        ⬇
                      </button>
                      <button
                        onClick={() => void cloud.remove(u)}
                        disabled={cloud.busy}
                        title="Delete the cloud copy and refund the token"
                        className="shrink-0 rounded-md px-2 py-1.5 text-xs font-medium text-slate-400 hover:text-red-600 disabled:opacity-50"
                      >
                        {cloud.busyId === u.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                    {playing?.id === u.id && (
                      <RecordingPlayer
                        key={playing.url}
                        url={playing.url}
                        hasVideo={playing.hasVideo}
                        onLevel={onLevel}
                        onPlayingChange={onPlayingChange}
                      />
                    )}
                  </li>
                ))}
              </ul>
            )}

            {!cloud.canSave && cloud.freeToken !== null && (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm text-amber-800">
                  {cloud.freeToken === 'held'
                    ? 'Your free Recorder token is in use — delete the cloud recording above to get it back, or add tokens.'
                    : 'You have no tokens left.'}
                </p>
                <a
                  href={GET_TOKENS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex rounded-lg bg-orange-700 px-3.5 py-2 text-sm font-semibold text-white hover:bg-orange-800"
                >
                  Get tokens →
                </a>
              </div>
            )}

            {playError && <p className="mt-2 text-sm text-red-700">{playError}</p>}
          </div>
        )}
      </div>

      {/* Outside the collapsible: a Save to cloud press on a device recording can
          fail while this panel is shut, and the reason must still be readable. */}
      {cloud.error && (
        <p className="mt-2 text-sm text-red-700" role="status" aria-live="polite">
          {cloud.error}
        </p>
      )}

      {/* Mounted regardless of the panel state — Save to cloud on a device
          recording opens this too. */}
      <SignInDialog
        open={cloud.signInOpen}
        onClose={() => cloud.setSignInOpen(false)}
        hubLoginHref={HUB_LOGIN_URL}
        initialMode="signup"
      />
    </section>
  )
}
