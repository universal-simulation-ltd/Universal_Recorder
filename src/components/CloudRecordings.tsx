import { useEffect, useRef, useState } from 'react'
import { SignInDialog, useUniversal, type HostedUpload } from '@unisim/sdk'
import RecordingPlayer from './RecordingPlayer'
import { HostedObjectMissingError, downloadHostedRecording, fmtBytes, hostedRecordingUrl } from '../lib/hostedRecordings'
import type { Cloud, CloudUpload } from '../lib/useCloud'
import { toMB } from '../lib/useFreeAllowance'

const HUB_LOGIN_URL = 'https://app.unisim.co.uk/login'
// Was /subscription.html until 2026-09-07, when the marketing site split its
// one pricing page in two. The token card moved to /everyday; /subscription is
// now the Assess Suite's seats and licences and sells no tokens at all — so a
// link left pointing there sends someone who wants one upload to a £5,000/year
// enterprise plan. Not a 404: it renders fine, which is why it needed finding.
const GET_TOKENS_URL = 'https://www.unisim.co.uk/everyday'
// Where a signed-in Universal ID with no company sets one up. Opened in a new
// tab so nothing recorded in this one is lost.
const SET_UP_COMPANY_URL = 'https://app.unisim.co.uk/branding'

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
// cloud copy is deleted). A guest sees the invitation to create an ID; a
// signed-in ID with no company sees why it can't save yet and where to set
// one up.
//
// The sign-in dialog lives here but is mounted whether or not the panel is open,
// because a Save-to-cloud press on a device recording opens it too.
export default function CloudRecordings({ cloud, onLevel, onPlayingChange }: Props) {
  const { supabase } = useUniversal()
  const [open, setOpen] = useState(false)
  const [playing, setPlaying] = useState<{ id: string; url: string; hasVideo: boolean } | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [playError, setPlayError] = useState<string | null>(null)
  // The one listed cloud recording that turned out to have no file behind it.
  const [missingId, setMissingId] = useState<string | null>(null)

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

  // Deleting clears the dead-entry notice with the row it belongs to.
  async function onRemove(upload: HostedUpload) {
    await cloud.remove(upload)
    setMissingId(id => (id === upload.id ? null : id))
  }

  // A signed-out user has nothing in the cloud, so the count is only meaningful
  // once signed in.
  const count = cloud.signedIn ? cloud.uploads.length : 0

  // A quiet heads-up once the shared free pool is 80% full — but only while
  // there is still room; at the limit the amber "used your free storage"
  // notice below takes over. Never for guests or unlimited plans.
  const a = cloud.allowance
  const nearFreeLimit =
    cloud.signedIn &&
    !!a &&
    !a.unlimited &&
    a.has_room &&
    !!a.bytes_limit &&
    a.bytes_limit > 0 &&
    a.bytes_used / a.bytes_limit >= 0.8

  async function onPlay(upload: HostedUpload) {
    if (loadingId) return
    setPlayError(null)
    setMissingId(null)
    if (playing?.id === upload.id) {
      openClip(null)
      return
    }
    setLoadingId(upload.id)
    try {
      const { url, hasVideo } = await hostedRecordingUrl(supabase, upload)
      openClip({ id: upload.id, url, hasVideo })
    } catch (err) {
      reportError(upload, err)
    } finally {
      setLoadingId(null)
    }
  }

  // A genuinely absent file is not an error to shrug at the user — it is a dead
  // entry, and the only useful thing to say is which one and what to do about
  // it. Anything else (offline, session expired) still surfaces as an ordinary
  // message, because deleting the recording would be the wrong advice.
  function reportError(upload: HostedUpload, err: unknown) {
    if (err instanceof HostedObjectMissingError) setMissingId(upload.id)
    else setPlayError((err as Error).message)
  }

  async function onDownload(upload: HostedUpload) {
    if (loadingId) return
    setPlayError(null)
    setMissingId(null)
    setLoadingId(upload.id)
    try {
      await downloadHostedRecording(supabase, upload)
    } catch (err) {
      reportError(upload, err)
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <section className="mt-6">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="text-xs uppercase tracking-wide text-slate-500 font-medium dark:text-slate-400">
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            aria-expanded={open}
            aria-controls="cloud-list"
            className="inline-flex items-center gap-1.5 uppercase tracking-wide hover:text-slate-700 dark:hover:text-slate-200"
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
        {/* No allowance talk while within it — only a purchased balance, if any. */}
        {cloud.signedIn && open && cloud.tokens > 0 && (
          <span className="text-xs text-slate-400">
            {`${cloud.tokens} purchased token${cloud.tokens === 1 ? '' : 's'}`}
          </span>
        )}
      </div>

      <div id="cloud-list" hidden={!open}>
        {!cloud.signedIn ? (
          /* Guest — the whole point of opening this panel. */
          <div className="rounded-xl border border-orange-200 bg-white p-4 dark:border-orange-900/60 dark:bg-slate-900">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Create a Universal ID to save recordings to the cloud for FREE.
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Your recordings live in this browser only. With a Universal ID you can keep them
              online too, and reach them from any device.
            </p>
            <button
              type="button"
              onClick={() => cloud.setSignInOpen(true)}
              className="mt-3 inline-flex rounded-lg bg-orange-700 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-800"
            >
              Create a free Universal ID →
            </button>
          </div>
        ) : cloud.noCompany ? (
          /* Signed in, no company — nothing can be saved until there is one. */
          <div className="rounded-xl border border-orange-200 bg-white p-4 dark:border-orange-900/60 dark:bg-slate-900">
            <NoCompanyNotice />
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Saved online against <strong className="font-medium text-slate-700 dark:text-slate-200">{cloud.email}</strong>.
              Only you can see your cloud recordings{cloud.inCompany ? ' unless you share one with your company' : ''}.
            </p>

            {cloud.loading ? (
              <p className="mt-3 text-xs text-slate-400">Loading…</p>
            ) : cloud.uploads.length === 0 ? (
              <p className="mt-3 text-xs text-slate-400">
                Nothing here yet — press <strong className="font-medium text-slate-500 dark:text-slate-300">☁ Save to cloud</strong> on
                any recording under “On this device”.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {cloud.uploads.map(u => {
                  const mine = u.user_id === cloud.myUserId
                  return (
                  <li key={u.id} className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center gap-2">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                          {u.file_name || 'recording'}
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          {new Date(u.created_at).toLocaleDateString()}
                          {u.size_bytes > 0 && ` · ${fmtBytes(u.size_bytes)}`}
                          {!mine && ' · Shared by a colleague'}
                        </span>
                      </span>
                      <button
                        onClick={() => void onPlay(u)}
                        disabled={loadingId !== null}
                        className="shrink-0 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:border-orange-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-orange-500 disabled:opacity-50"
                      >
                        {loadingId === u.id ? 'Loading…' : playing?.id === u.id ? 'Close' : '▶ Play'}
                      </button>
                      <button
                        onClick={() => void onDownload(u)}
                        disabled={loadingId !== null}
                        className="shrink-0 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:border-orange-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-orange-500 disabled:opacity-50"
                      >
                        ⬇
                      </button>
                      {mine && (
                        <button
                          onClick={() => void onRemove(u)}
                          disabled={cloud.busy}
                          title="Delete the cloud copy"
                          className="shrink-0 rounded-md px-2 py-1.5 text-xs font-medium text-slate-400 hover:text-red-600 disabled:opacity-50 dark:hover:text-red-400"
                        >
                          {cloud.busyId === u.id ? 'Deleting…' : 'Delete'}
                        </button>
                      )}
                    </div>
                    {/* Private by default (0194). The option only appears in a
                        workspace with other people in it — or on a recording
                        that is already shared, so it can always be stopped. */}
                    {mine && (cloud.inCompany || u.shared_with_org) && (
                      <ShareToggle upload={u} cloud={cloud} />
                    )}
                    {/* A cloud recording with nothing behind it. Say which one,
                        say plainly that the upload never finished, and make
                        clearing it up one click — there is nothing to lose by
                        tidying. This replaces
                        storage's bare "Object not found", which read like the
                        app had mislaid the user's recording. */}
                    {missingId === u.id && (
                      <div
                        role="alert"
                        data-testid="hosted-missing"
                        className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-2 dark:border-amber-900/60 dark:bg-amber-950/40"
                      >
                        <p className="text-[11px] leading-snug text-amber-900 dark:text-amber-200">
                          <strong className="font-semibold">{u.file_name || 'This recording'}</strong> is listed here,
                          but there is no file behind it — this upload never finished, so nothing was ever
                          saved. Remove the entry to tidy it away.
                        </p>
                        {mine && (
                          <button
                            type="button"
                            onClick={() => void onRemove(u)}
                            disabled={cloud.busy}
                            className="mt-2 inline-flex rounded-md bg-amber-700 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-amber-800 disabled:opacity-50"
                          >
                            Remove this entry
                          </button>
                        )}
                      </div>
                    )}
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
                  )
                })}
              </ul>
            )}

            {nearFreeLimit && cloud.allowance && (
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400" data-testid="free-allowance-usage">
                You’ve used {toMB(cloud.allowance.bytes_used)} MB of your {toMB(cloud.allowance.bytes_limit ?? 0)} MB
                of free online storage. It’s shared by Universal PDF, Images, Exports and Recorder.
              </p>
            )}

            {!cloud.canSave && cloud.freeToken !== null && (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/60 dark:bg-amber-950/40">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  {cloud.freeToken === 'held'
                    ? 'You’ve used your free cloud storage for recordings. Delete a cloud recording to make room, or get more.'
                    : 'You’ve used your free cloud storage for recordings. Get more to keep saving recordings to the cloud.'}
                </p>
                <a
                  href={GET_TOKENS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex rounded-lg bg-orange-700 px-3.5 py-2 text-sm font-semibold text-white hover:bg-orange-800"
                >
                  Get more →
                </a>
              </div>
            )}

            {playError && <p className="mt-2 text-sm text-red-700 dark:text-red-400">{playError}</p>}
          </div>
        )}
      </div>

      {/* Outside the collapsible: a Save to cloud press on a device recording can
          fail while this panel is shut, and the reason must still be readable. */}
      {cloud.error && (
        <p className="mt-2 text-sm text-red-700 dark:text-red-400" role="status" aria-live="polite">
          {cloud.error}
        </p>
      )}
      {/* Save to cloud pressed with no company. With the panel open the same
          notice is already showing inside it. */}
      {cloud.noCompany && cloud.noCompanyPrompt && !open && (
        <div
          className="mt-2 rounded-xl border border-orange-200 bg-white p-4 dark:border-orange-900/60 dark:bg-slate-900"
          role="status"
          aria-live="polite"
        >
          <NoCompanyNotice />
        </div>
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

/** Why a signed-in ID with no company can't save to the cloud, and the way out. */
function NoCompanyNotice() {
  return (
    <div data-testid="cloud-no-company">
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        Cloud recordings are saved with your company.
      </p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Your Universal ID doesn’t have a company yet, and setting one up is free. Your recordings
        stay safe in this browser meanwhile — once the company is set up, reload this page to save
        them to the cloud.
      </p>
      <a
        href={SET_UP_COMPANY_URL}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex rounded-lg bg-orange-700 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-800"
      >
        Set up a company →
      </a>
    </div>
  )
}

/** "Share with <company>" on one of your own cloud recordings. Unticked by
 *  default: a cloud recording is private to the person who saved it. */
function ShareToggle({ upload, cloud }: { upload: CloudUpload; cloud: Cloud }) {
  const company = cloud.companyName || 'your company'
  return (
    <label
      className="mt-1.5 flex cursor-pointer items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400"
      title={
        upload.shared_with_org
          ? `Everyone in ${company} can play and download this recording. Untick to make it private again.`
          : `Only you can see this recording. Tick to let everyone in ${company} play and download it.`
      }
    >
      <input
        type="checkbox"
        data-testid="share-with-company"
        checked={upload.shared_with_org}
        disabled={cloud.busy}
        onChange={e => void cloud.setShared(upload, e.target.checked)}
        className="h-3.5 w-3.5 accent-orange-700"
      />
      <span>
        Share with {company}
        {cloud.busyId === upload.id && ' …'}
      </span>
    </label>
  )
}
