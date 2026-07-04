import { useCallback, useEffect, useRef, useState } from 'react'
import { AudioRecorder, listMicrophones } from '../lib/recorder'
import { FORMAT_META, toFormat } from '../lib/encode'
import { deleteRecording, listRecordings, saveRecording } from '../lib/localRecordings'
import type { ExportFormat, SourceMode, StoredRecording } from '../lib/types'

type Status = 'idle' | 'recording' | 'paused' | 'done'

const SOURCES: { id: SourceMode; label: string; blurb: string; icon: string }[] = [
  { id: 'mic',    label: 'Microphone',    blurb: 'Your voice / mic input',        icon: '🎙️' },
  { id: 'system', label: 'System audio',  blurb: 'What is playing on this device', icon: '🔊' },
  { id: 'both',   label: 'Both (mixed)',  blurb: 'Mic + system in one track',      icon: '🎧' },
]

const FORMATS: ExportFormat[] = ['webm', 'mp3', 'wav']

// Mobile browsers don't support system-audio capture (`getDisplayMedia` audio),
// so those sources are unavailable there — only the microphone can be recorded.
function isMobileBrowser(): boolean {
  if (typeof navigator === 'undefined') return false
  const uaData = (navigator as Navigator & { userAgentData?: { mobile?: boolean } }).userAgentData
  if (uaData && typeof uaData.mobile === 'boolean') return uaData.mobile
  return /Android|iPhone|iPad|iPod|IEMobile|BlackBerry|Opera Mini|Mobile|Silk/i.test(navigator.userAgent)
}

function fmtTime(sec: number): string {
  const s = Math.floor(sec)
  const m = Math.floor(s / 60)
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.floor(performance.now()).toString(36)}`
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

export default function RecorderStudio() {
  const [isMobile] = useState(isMobileBrowser)
  const sources = isMobile ? SOURCES.filter(s => s.id === 'mic') : SOURCES
  const [mode, setMode] = useState<SourceMode>('mic')
  const [mics, setMics] = useState<MediaDeviceInfo[]>([])
  const [micId, setMicId] = useState<string>('')
  const [status, setStatus] = useState<Status>('idle')
  const [level, setLevel] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [current, setCurrent] = useState<StoredRecording | null>(null)
  const [currentUrl, setCurrentUrl] = useState<string | null>(null)
  const [recents, setRecents] = useState<StoredRecording[]>([])
  const [busyFormat, setBusyFormat] = useState<string | null>(null)

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

  async function handleStart() {
    setError(null)
    const rec = new AudioRecorder()
    recorderRef.current = rec
    try {
      await rec.start({ mode, deviceId: micId || undefined, onLevel: setLevel })
      setStatus('recording')
      setElapsed(0)
      startTick()
      void refreshMics() // labels resolve once mic permission is granted
    } catch (err) {
      recorderRef.current = null
      const msg = (err as Error).message || 'Could not start recording.'
      setError(
        (err as Error).name === 'NotAllowedError'
          ? 'Permission denied. Allow microphone / screen-audio access and try again.'
          : msg,
      )
    }
  }

  function handlePause() { recorderRef.current?.pause(); setStatus('paused'); stopTick() }
  function handleResume() { recorderRef.current?.resume(); setStatus('recording'); startTick() }

  async function handleStop() {
    const rec = recorderRef.current
    if (!rec) return
    stopTick()
    setLevel(0)
    try {
      const result = await rec.stop()
      const stored: StoredRecording = {
        id: uid(),
        name: `Recording ${new Date().toLocaleString()}`,
        createdAt: Date.now(),
        durationSec: result.durationSec,
        mimeType: result.mimeType,
        source: mode,
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
    } finally {
      recorderRef.current = null
    }
  }

  function handleNew() {
    setCurrent(null)
    if (currentUrl) URL.revokeObjectURL(currentUrl)
    setCurrentUrl(null)
    setElapsed(0)
    setStatus('idle')
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

  const recording = status === 'recording'
  const paused = status === 'paused'
  const live = recording || paused
  const needsMic = mode === 'mic' || mode === 'both'

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <header className="mb-7">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
          Record audio that <span className="text-orange-600">stays on your device</span>.
        </h1>
        <p className="mt-3 text-slate-600 max-w-xl">
          Capture your microphone, your system audio, or both — then save it as WebM, MP3 or WAV.
          Nothing is uploaded.
        </p>
      </header>

      {/* Source picker */}
      <section className={`grid grid-cols-1 gap-3 mb-4 ${isMobile ? '' : 'sm:grid-cols-3'}`}>
        {sources.map(s => {
          const active = mode === s.id
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => !live && setMode(s.id)}
              disabled={live}
              aria-pressed={active}
              className={[
                'text-left rounded-xl border p-4 transition-colors disabled:opacity-60 disabled:cursor-not-allowed',
                active
                  ? 'border-orange-500 bg-orange-50/60 ring-1 ring-orange-500/30'
                  : 'border-slate-200 bg-white hover:border-orange-300',
              ].join(' ')}
            >
              <div className="text-2xl">{s.icon}</div>
              <div className="mt-1 font-semibold text-slate-900">{s.label}</div>
              <div className="text-xs text-slate-500">{s.blurb}</div>
            </button>
          )
        })}
      </section>

      {/* Mic device picker */}
      {needsMic && (
        <div className="mb-4 flex items-center gap-2 text-sm">
          <label htmlFor="mic" className="text-slate-500 shrink-0">Microphone</label>
          <select
            id="mic"
            value={micId}
            onChange={e => setMicId(e.target.value)}
            disabled={live}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-60"
          >
            <option value="">Default microphone</option>
            {mics.map((m, i) => (
              <option key={m.deviceId || i} value={m.deviceId}>
                {m.label || `Microphone ${i + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {isMobile && (
        <p className="mb-4 text-xs text-slate-500">
          On mobile, only microphone recording is available — system-audio capture isn’t supported by
          mobile browsers.
        </p>
      )}

      {!isMobile && mode !== 'mic' && (
        <p className="mb-4 text-xs text-slate-500">
          System audio needs Chrome or Edge — when the share picker opens, choose a tab or screen and
          tick <strong>Share audio</strong>. Safari and Firefox restrict it.
        </p>
      )}

      {/* Transport */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
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
        </div>

        {/* Level meter */}
        <div className="mt-4 h-3 rounded-full bg-slate-100 overflow-hidden" aria-hidden="true">
          <div
            className="h-full rounded-full transition-[width] duration-75"
            style={{
              width: `${Math.min(100, Math.round(level * 140))}%`,
              background: level > 0.8 ? '#dc2626' : level > 0.5 ? '#f59e0b' : '#f97316',
            }}
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {!live && status !== 'done' && (
            <button
              onClick={handleStart}
              className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-500"
            >
              ● Start recording
            </button>
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

        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      </section>

      {/* Result */}
      {status === 'done' && current && (
        <section className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-slate-900">Your recording — {fmtTime(current.durationSec)}</h2>
            <button onClick={handleNew} className="text-sm font-medium text-slate-600 hover:text-slate-900">
              + New recording
            </button>
          </div>
          {currentUrl && <audio controls src={currentUrl} className="mt-3 w-full" />}
          <div className="mt-4">
            <div className="text-xs uppercase tracking-wide text-slate-500 font-medium mb-1.5">Download as</div>
            <div className="flex flex-wrap gap-2">
              {FORMATS.map(f => (
                <button
                  key={f}
                  onClick={() => handleDownload(current, f)}
                  disabled={busyFormat !== null}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-orange-400 disabled:opacity-60 disabled:cursor-wait"
                  title={FORMAT_META[f].hint}
                >
                  {busyFormat === `${current.id}:${f}` ? 'Encoding…' : `⬇ ${FORMAT_META[f].label}`}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recents */}
      {recents.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xs uppercase tracking-wide text-slate-500 font-medium mb-2">
            On this device ({recents.length})
          </h2>
          <ul className="space-y-2">
            {recents.map(r => (
              <li key={r.id} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-slate-800 truncate">{r.name}</div>
                    <div className="text-xs text-slate-500">
                      {fmtTime(r.durationSec)} · {SOURCES.find(s => s.id === r.source)?.label ?? r.source}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="shrink-0 text-xs text-slate-400 hover:text-red-600"
                    aria-label={`Delete ${r.name}`}
                  >
                    Delete
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {FORMATS.map(f => (
                    <button
                      key={f}
                      onClick={() => handleDownload(r, f)}
                      disabled={busyFormat !== null}
                      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:border-orange-400 disabled:opacity-60 disabled:cursor-wait"
                    >
                      {busyFormat === `${r.id}:${f}` ? 'Encoding…' : FORMAT_META[f].label}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
