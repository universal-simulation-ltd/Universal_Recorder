import { useCallback, useEffect, useRef, useState } from 'react'
import RecordingPlayer from './RecordingPlayer'
import { AudioRecorder, listMicrophones } from '../lib/recorder'
import { FORMAT_META, toFormat } from '../lib/encode'
import { clearRecordings, deleteRecording, listRecordings, saveRecording } from '../lib/localRecordings'
import type { ExportFormat, Source, StoredRecording } from '../lib/types'

type Status = 'idle' | 'recording' | 'paused' | 'done'

const SOURCES: { id: Source; label: string; blurb: string; icon: string }[] = [
  { id: 'mic',    label: 'Microphone',   blurb: 'Your voice / mic input',         icon: '🎙️' },
  { id: 'system', label: 'System audio', blurb: 'What is playing on this device',  icon: '🔊' },
  { id: 'screen', label: 'Screen',       blurb: 'Record your screen as video',     icon: '🖥️' },
]

const AUDIO_FORMATS: ExportFormat[] = ['webm', 'mp3', 'wav']

// The real container extension of a recording (video is MP4 where the browser
// could record it, else WebM; audio is WebM natively).
function nativeExt(rec: StoredRecording): string {
  return rec.mimeType.includes('mp4') ? 'mp4' : 'webm'
}

// Human label for a recording's sources, tolerant of older records that stored a
// single `source` string ('mic' | 'system' | 'both') before multi-select.
function sourceLabels(rec: StoredRecording): string {
  const legacy = (rec as unknown as { source?: string }).source
  const list: Source[] =
    rec.sources ?? (legacy === 'both' ? ['mic', 'system'] : legacy ? [legacy as Source] : [])
  return list.map(s => SOURCES.find(x => x.id === s)?.label ?? s).join(' + ') || '—'
}

// Mobile browsers don't support system-audio or screen capture (`getDisplayMedia`),
// so only the microphone can be recorded there.
function isMobileBrowser(): boolean {
  if (typeof navigator === 'undefined') return false
  const uaData = (navigator as Navigator & { userAgentData?: { mobile?: boolean } }).userAgentData
  if (uaData && typeof uaData.mobile === 'boolean') return uaData.mobile
  return /Android|iPhone|iPad|iPod|IEMobile|BlackBerry|Opera Mini|Mobile|Silk/i.test(navigator.userAgent)
}

// Screen *video* capture works wherever getDisplayMedia exists (incl. Firefox).
function screenSupported(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.mediaDevices?.getDisplayMedia === 'function'
}

// Capturing system/tab *audio* via getDisplayMedia is a Chromium-only capability —
// Firefox and Safari ignore the audio constraint (there's no "Share audio" option
// in their picker), so no track ever comes back. `userAgentData` is Chromium-only,
// which is a reliable positive signal for the browsers that support this.
function systemAudioSupported(): boolean {
  return screenSupported() && 'userAgentData' in navigator
}

function fmtTime(sec: number): string {
  const s = Math.floor(sec)
  const m = Math.floor(s / 60)
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.floor(performance.now()).toString(36)}`
}

function defaultName(): string {
  return `Recording ${new Date().toLocaleString()}`
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// A small equalizer-style visualisation shown while recording. A travelling sine
// wave gives constant motion (so it dances even in silence, as requested), and the
// live mic/system level scales the bar heights — approximate, not a real spectrum.
function Visualizer({ level, active }: { level: number; active: boolean }) {
  const [, tick] = useState(0)
  useEffect(() => {
    if (!active) return
    let raf = 0
    const loop = () => { tick(n => (n + 1) % 1_000_000); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [active])

  const bars = 28
  const t = performance.now() / 1000
  const colour = level > 0.8 ? '#dc2626' : level > 0.5 ? '#f59e0b' : '#f97316'
  return (
    <div className="mt-4 flex items-center justify-center gap-[3px] h-10" aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => {
        const wobble = Math.sin(t * 5 + i * 0.5) * 0.5 + 0.5
        const h = active ? Math.min(1, 0.14 + 0.3 * wobble + level * 0.75) : 0.06
        return (
          <div
            key={i}
            className="w-1 rounded-full"
            style={{
              height: `${h * 100}%`,
              background: active ? colour : '#cbd5e1',
              transition: 'height 90ms linear',
            }}
          />
        )
      })}
    </div>
  )
}

export default function RecorderStudio() {
  const [isMobile] = useState(isMobileBrowser)
  const [canSystemAudio] = useState(systemAudioSupported)
  const [canScreen] = useState(screenSupported)
  // Which cards to show, and why any are unavailable in this browser.
  const sourceOptions = (isMobile ? SOURCES.filter(s => s.id === 'mic') : SOURCES).map(s => {
    if (s.id === 'system' && !canSystemAudio) return { ...s, disabled: true, note: 'Chrome or Edge only' }
    if (s.id === 'screen' && !canScreen) return { ...s, disabled: true, note: 'Not supported here' }
    return { ...s, disabled: false as boolean, note: undefined as string | undefined }
  })
  const [sources, setSources] = useState<Source[]>([])
  const [mics, setMics] = useState<MediaDeviceInfo[]>([])
  const [micId, setMicId] = useState<string>('')
  const [surface, setSurface] = useState<'monitor' | 'window' | 'browser'>('monitor')
  const [name, setName] = useState<string>(defaultName)
  const [status, setStatus] = useState<Status>('idle')
  const [level, setLevel] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [current, setCurrent] = useState<StoredRecording | null>(null)
  const [currentUrl, setCurrentUrl] = useState<string | null>(null)
  // Live level + playing flag sourced from the result player, so the studio
  // visualiser dances during playback too (not just while recording).
  const [playbackLevel, setPlaybackLevel] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [recents, setRecents] = useState<StoredRecording[]>([])
  const [busyFormat, setBusyFormat] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameDraft, setRenameDraft] = useState('')
  // The saved-recordings list is collapsed by default — it grows without bound
  // and pushes the recorder itself off-screen, which is the thing people come
  // here to use.
  const [recentsOpen, setRecentsOpen] = useState(false)
  // Two-step guard on Delete all: the blobs are local-only, so there is nothing
  // to restore them from.
  const [confirmingClearAll, setConfirmingClearAll] = useState(false)

  const recorderRef = useRef<AudioRecorder | null>(null)
  const tickRef = useRef<number | null>(null)

  const refreshMics = useCallback(async () => {
    try { setMics(await listMicrophones()) } catch { /* ignore */ }
  }, [])

  const refreshRecents = useCallback(async () => {
    try { setRecents(await listRecordings()) } catch { /* ignore */ }
  }, [])

  useEffect(() => { void refreshMics(); void refreshRecents() }, [refreshMics, refreshRecents])

  // Revoke the playback URL when it changes / unmounts.
  useEffect(() => () => { if (currentUrl) URL.revokeObjectURL(currentUrl) }, [currentUrl])

  const stopTick = () => {
    if (tickRef.current !== null) { window.clearInterval(tickRef.current); tickRef.current = null }
  }

  const startTick = () => {
    stopTick()
    tickRef.current = window.setInterval(() => {
      setElapsed(recorderRef.current?.elapsedSec() ?? 0)
    }, 200)
  }

  function toggleSource(id: Source) {
    setSources(prev => (prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]))
  }

  async function handleStart() {
    setError(null)
    setWarning(null)
    if (sources.length === 0) { setError('Choose at least one source to record.'); return }
    const rec = new AudioRecorder()
    recorderRef.current = rec
    try {
      await rec.start({
        sources,
        deviceId: micId || undefined,
        displaySurface: sources.includes('screen') ? surface : undefined,
        onLevel: setLevel,
        onWarning: setWarning,
        onEnded: () => { if (recorderRef.current) void handleStop() },
      })
      setStatus('recording')
      setElapsed(0)
      startTick()
      void refreshMics() // labels resolve once mic permission is granted
    } catch (err) {
      recorderRef.current = null
      const msg = (err as Error).message || 'Could not start recording.'
      setError(
        (err as Error).name === 'NotAllowedError'
          ? 'Permission denied. Allow microphone / screen access and try again.'
          : msg,
      )
    }
  }

  function handlePause() { recorderRef.current?.pause(); setStatus('paused'); stopTick() }
  function handleResume() { recorderRef.current?.resume(); setStatus('recording'); startTick() }

  async function handleStop() {
    const rec = recorderRef.current
    if (!rec) return
    recorderRef.current = null // claim it so a concurrent onEnded/Stop can't double-run
    stopTick()
    setLevel(0)
    try {
      const result = await rec.stop()
      const stored: StoredRecording = {
        id: uid(),
        name: name.trim() || defaultName(),
        createdAt: Date.now(),
        durationSec: result.durationSec,
        mimeType: result.mimeType,
        sources,
        hasVideo: result.hasVideo,
        blob: result.blob,
      }
      setCurrent(stored)
      setCurrentUrl(URL.createObjectURL(stored.blob))
      setStatus('done')
      await saveRecording(stored)
      void refreshRecents()
    } catch (err) {
      setError((err as Error).message || 'Could not finish the recording.')
      setStatus('idle')
    }
  }

  function handleNew() {
    setCurrent(null)
    if (currentUrl) URL.revokeObjectURL(currentUrl)
    setCurrentUrl(null)
    setElapsed(0)
    setWarning(null)
    setName(defaultName()) // fresh default for the next take
    setStatus('idle')
  }

  function startRename(rec: StoredRecording) { setRenamingId(rec.id); setRenameDraft(rec.name) }
  function cancelRename() { setRenamingId(null); setRenameDraft('') }

  async function saveRename(rec: StoredRecording) {
    const updated = { ...rec, name: renameDraft.trim() || rec.name }
    setRenamingId(null)
    setRenameDraft('')
    await saveRecording(updated)
    if (current?.id === rec.id) setCurrent(updated)
    void refreshRecents()
  }

  // Screen recordings are already in their final container (MP4/WebM) — just save
  // the blob with the right extension; there's no audio-only transcode for video.
  function handleDownloadNative(rec: StoredRecording) {
    const base = rec.name.replace(/[^\w.-]+/g, '_').replace(/_+/g, '_')
    download(rec.blob, `${base}.${nativeExt(rec)}`)
  }

  async function handleDownload(rec: StoredRecording, format: ExportFormat) {
    const key = `${rec.id}:${format}`
    setBusyFormat(key)
    try {
      const blob = await toFormat(rec.blob, format)
      const base = rec.name.replace(/[^\w.-]+/g, '_').replace(/_+/g, '_')
      download(blob, `${base}.${FORMAT_META[format].ext}`)
    } catch (err) {
      setError(`Could not export ${FORMAT_META[format].label}: ${(err as Error).message}`)
    } finally {
      setBusyFormat(null)
    }
  }

  async function handleDelete(id: string) {
    await deleteRecording(id)
    void refreshRecents()
    if (current?.id === id) handleNew()
  }

  async function handleDeleteAll() {
    await clearRecordings()
    setConfirmingClearAll(false)
    setRenamingId(null) // the row being renamed no longer exists
    void refreshRecents()
    // The loaded take is one of the rows we just dropped, so clear the player
    // too — otherwise it keeps playing a recording that is no longer saved.
    if (current) handleNew()
  }

  const recording = status === 'recording'
  const paused = status === 'paused'
  const live = recording || paused
  const needsMic = sources.includes('mic')
  const usesDisplay = sources.includes('system') || sources.includes('screen')

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <header className="mb-7">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
          Record audio &amp; screen that <span className="text-orange-600">stays on your device</span>.
        </h1>
        <p className="mt-3 text-slate-600 max-w-xl">
          Capture your microphone, your system audio and your screen — pick any combination — then
          save it. Nothing is uploaded.
        </p>
      </header>

      {/* Source picker — pick any combination */}
      <section className={`grid grid-cols-1 gap-3 mb-2 ${isMobile ? '' : 'sm:grid-cols-3'}`}>
        {sourceOptions.map(s => {
          const active = sources.includes(s.id) && !s.disabled
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => !live && !s.disabled && toggleSource(s.id)}
              disabled={live || s.disabled}
              role="checkbox"
              aria-checked={active}
              title={s.disabled ? s.note : undefined}
              className={[
                'relative text-left rounded-xl border p-4 transition-colors disabled:cursor-not-allowed',
                s.disabled ? 'opacity-50' : 'disabled:opacity-60',
                active
                  ? 'border-orange-500 bg-orange-50/60 ring-1 ring-orange-500/30'
                  : 'border-slate-200 bg-white hover:border-orange-300',
              ].join(' ')}
            >
              <span
                className={[
                  'absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded border text-[11px] font-bold',
                  active ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-300 text-transparent',
                ].join(' ')}
                aria-hidden="true"
              >
                ✓
              </span>
              <div className="text-2xl">{s.icon}</div>
              <div className="mt-1 font-semibold text-slate-900">{s.label}</div>
              <div className="text-xs text-slate-500">{s.blurb}</div>
              {s.disabled && s.note && (
                <div className="mt-1 text-[11px] font-medium text-amber-600">{s.note}</div>
              )}
            </button>
          )
        })}
      </section>

      {/* Per-source choosers — each sits directly under its card (mic → col 1,
          system → col 2, screen type → col 3), matching the source grid. */}
      {(needsMic || sources.includes('system') || (sources.includes('screen') && canScreen)) && (
        <div className={`grid gap-3 mb-2 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3'}`}>
          {needsMic && (
            <select
              aria-label="Microphone"
              value={micId}
              onChange={e => setMicId(e.target.value)}
              disabled={live}
              className="sm:col-start-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-60"
            >
              <option value="">Default microphone</option>
              {mics.map((m, i) => (
                <option key={m.deviceId || i} value={m.deviceId}>
                  {m.label || `Microphone ${i + 1}`}
                </option>
              ))}
            </select>
          )}
          {sources.includes('system') && (
            // System audio has no sub-choice — it's always everything playing on
            // the device. This matches the dropdowns' style but only ever reads
            // "All audio" (one option, nothing else to pick).
            <select
              aria-label="System audio"
              value="all"
              onChange={() => {}}
              disabled={live}
              title="System audio captures all sound playing on this device"
              className="sm:col-start-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-60"
            >
              <option value="all">All audio</option>
            </select>
          )}
          {sources.includes('screen') && canScreen && (
            <select
              aria-label="Screen type"
              value={surface}
              onChange={e => setSurface(e.target.value as 'monitor' | 'window' | 'browser')}
              disabled={live}
              title="Which surface the share picker opens on (Chrome — you still confirm)"
              className="sm:col-start-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-60"
            >
              <option value="monitor">Entire screen</option>
              <option value="window">A window</option>
              <option value="browser">A browser tab</option>
            </select>
          )}
        </div>
      )}

      <p className="mb-4 text-xs text-slate-500">Tip: tick more than one to record them together.</p>

      {isMobile && (
        <p className="mb-4 text-xs text-slate-500">
          On mobile, only microphone recording is available — system-audio and screen capture aren’t
          supported by mobile browsers.
        </p>
      )}

      {!isMobile && usesDisplay && (
        <p className="mb-4 text-xs text-slate-500">
          When the share picker opens, choose a tab, window or screen
          {sources.includes('system') && <> and tick <strong>Share audio</strong> to include system audio</>}.
          {sources.includes('system') && !sources.includes('screen') && (
            <> Chrome needs you to pick a screen or tab to grant audio — the screen itself isn’t recorded,
            only the sound.</>
          )}
        </p>
      )}

      {/* Transport — only once a source is chosen */}
      {sources.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white/50 p-6 text-center text-sm text-slate-500">
          Choose at least one source above to start recording.
        </p>
      ) : (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-center gap-3">
          <span
            className={[
              'inline-block w-3 h-3 rounded-full',
              recording ? 'bg-red-600 rec-dot' : paused ? 'bg-amber-500' : 'bg-slate-300',
            ].join(' ')}
            aria-hidden="true"
          />
          <span className="text-3xl font-semibold tabular-nums text-slate-900">{fmtTime(elapsed)}</span>
          <span className="text-xs uppercase tracking-wide text-slate-400">
            {recording ? 'Recording' : paused ? 'Paused' : status === 'done' ? 'Stopped' : 'Ready'}
          </span>
        </div>

        {/* Audio visualisation — animated while recording and while playing back. */}
        <Visualizer level={recording ? level : playbackLevel} active={recording || playing} />

        <div className={`mt-5 flex flex-wrap items-center gap-3 ${live ? 'justify-center' : ''}`}>
          {!live && status !== 'done' && (
            <>
              <input
                aria-label="Recording name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={defaultName()}
                className="flex-1 min-w-[10rem] rounded-lg border border-slate-300 px-3 py-2.5 text-sm bg-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <button
                onClick={handleStart}
                disabled={sources.length === 0}
                className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ● Start recording
              </button>
            </>
          )}
          {recording && (
            <button onClick={handlePause} className="rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200">
              ❚❚ Pause
            </button>
          )}
          {paused && (
            <button onClick={handleResume} className="rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200">
              ▶ Resume
            </button>
          )}
          {live && (
            <button onClick={handleStop} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">
              ■ Stop
            </button>
          )}
        </div>

        {warning && <p className="mt-4 text-sm text-amber-700">{warning}</p>}
        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      </section>
      )}

      {/* Result */}
      {status === 'done' && current && (
        <section className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-slate-900">Your recording — {fmtTime(current.durationSec)}</h2>
            <button
              onClick={handleNew}
              className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-500"
            >
              ＋ New recording
            </button>
          </div>
          {currentUrl && (
            <RecordingPlayer
              key={current.id}
              url={currentUrl}
              hasVideo={current.hasVideo}
              onLevel={setPlaybackLevel}
              onPlayingChange={setPlaying}
            />
          )}
          <div className="mt-4">
            <div className="text-xs uppercase tracking-wide text-slate-500 font-medium mb-1.5">Download as</div>
            <div className="flex flex-wrap gap-2">
              {current.hasVideo ? (
                <button
                  onClick={() => handleDownloadNative(current)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-orange-400"
                >
                  ⬇ {nativeExt(current).toUpperCase()} video
                </button>
              ) : (
                AUDIO_FORMATS.map(f => (
                  <button
                    key={f}
                    onClick={() => handleDownload(current, f)}
                    disabled={busyFormat !== null}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-orange-400 disabled:opacity-60 disabled:cursor-wait"
                    title={FORMAT_META[f].hint}
                  >
                    {busyFormat === `${current.id}:${f}` ? 'Encoding…' : `⬇ ${FORMAT_META[f].label}`}
                  </button>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* Recents */}
      {recents.length > 0 && (
        <section className="mt-8">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="text-xs uppercase tracking-wide text-slate-500 font-medium">
              <button
                type="button"
                onClick={() => setRecentsOpen(o => !o)}
                aria-expanded={recentsOpen}
                aria-controls="recents-list"
                className="inline-flex items-center gap-1.5 uppercase tracking-wide hover:text-slate-700"
              >
                <span
                  aria-hidden
                  className={`text-[10px] leading-none transition-transform ${recentsOpen ? 'rotate-90' : ''}`}
                >
                  ▶
                </span>
                On this device ({recents.length})
              </button>
            </h2>
            {confirmingClearAll ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">
                  Delete all {recents.length}? This can't be undone.
                </span>
                <button
                  onClick={() => void handleDeleteAll()}
                  className="font-semibold text-red-600 hover:text-red-700"
                >
                  Yes, delete
                </button>
                <button
                  onClick={() => setConfirmingClearAll(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmingClearAll(true)}
                className="text-xs text-slate-400 hover:text-red-600"
              >
                Delete all
              </button>
            )}
          </div>
          <ul id="recents-list" hidden={!recentsOpen} className="space-y-2">
            {recents.map(r => (
              <li key={r.id} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {renamingId === r.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          value={renameDraft}
                          onChange={e => setRenameDraft(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') void saveRename(r)
                            else if (e.key === 'Escape') cancelRename()
                          }}
                          className="min-w-0 flex-1 rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                        />
                        <button onClick={() => saveRename(r)} className="shrink-0 text-xs font-semibold text-orange-600 hover:text-orange-700">Save</button>
                        <button onClick={cancelRename} className="shrink-0 text-xs text-slate-400 hover:text-slate-600">Cancel</button>
                      </div>
                    ) : (
                      <div className="font-medium text-slate-800 truncate">{r.name}</div>
                    )}
                    <div className="text-xs text-slate-500">
                      {fmtTime(r.durationSec)} · {sourceLabels(r)}{r.hasVideo ? ' · video' : ''}
                    </div>
                  </div>
                  {renamingId !== r.id && (
                    <div className="shrink-0 flex items-center gap-2 text-xs">
                      <button
                        onClick={() => startRename(r)}
                        className="text-slate-400 hover:text-orange-600"
                        aria-label={`Rename ${r.name}`}
                      >
                        Rename
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-slate-400 hover:text-red-600"
                        aria-label={`Delete ${r.name}`}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {r.hasVideo ? (
                    <button
                      onClick={() => handleDownloadNative(r)}
                      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:border-orange-400"
                    >
                      {nativeExt(r).toUpperCase()} video
                    </button>
                  ) : (
                    AUDIO_FORMATS.map(f => (
                      <button
                        key={f}
                        onClick={() => handleDownload(r, f)}
                        disabled={busyFormat !== null}
                        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:border-orange-400 disabled:opacity-60 disabled:cursor-wait"
                      >
                        {busyFormat === `${r.id}:${f}` ? 'Encoding…' : FORMAT_META[f].label}
                      </button>
                    ))
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
