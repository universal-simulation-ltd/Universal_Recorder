import { useEffect, useRef, useState } from 'react'

interface Props {
  url: string
  hasVideo: boolean
  /** Live 0–1 audio level while the clip plays (drives the studio visualiser). */
  onLevel: (level: number) => void
  /** True while the clip is actively playing. */
  onPlayingChange: (playing: boolean) => void
}

// Plays back a finished recording. Two jobs beyond a plain <audio>/<video>:
//
//  1. Fix the WebM duration bug. MediaRecorder WebM blobs ship without a
//     duration, so the element reports `Infinity` and, played straight away,
//     shows a ~1s scrubber until the browser has scanned the whole file. We
//     force that scan by seeking to the end, then show a "Preparing…" overlay
//     until a real, finite duration is known.
//
//  2. Feed the studio visualiser. An AnalyserNode on the element turns playback
//     into the same live level the recorder emits, so the box dances during
//     playback too.
export default function RecordingPlayer({ url, hasVideo, onLevel, onPlayingChange }: Props) {
  const mediaRef = useRef<HTMLMediaElement | null>(null)
  const [ready, setReady] = useState(false)
  const fixing = useRef(false)

  const ctxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const rafRef = useRef<number | null>(null)

  // Reset the ready/duration-fix state whenever a new clip is loaded.
  useEffect(() => {
    setReady(false)
    fixing.current = false
  }, [url])

  // Tear everything down on unmount: stop the RAF, close the audio graph, and
  // make sure the studio visualiser doesn't get stuck "playing".
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      ctxRef.current?.close().catch(() => {})
      onPlayingChange(false)
      onLevel(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function markReadyIfFinite(el: HTMLMediaElement): boolean {
    if (Number.isFinite(el.duration) && el.duration > 0) {
      setReady(true)
      return true
    }
    return false
  }

  function onLoadedMetadata() {
    const el = mediaRef.current
    if (!el) return
    if (markReadyIfFinite(el)) return
    // Duration unknown (WebM) — force the browser to compute it by seeking way
    // past the end; it clamps and fires `durationchange` with the real value.
    if (!fixing.current) {
      fixing.current = true
      try { el.currentTime = 1e101 } catch { /* ignore */ }
    }
  }

  function onDurationChange() {
    const el = mediaRef.current
    if (!el) return
    if (fixing.current && Number.isFinite(el.duration) && el.duration > 0) {
      el.currentTime = 0
      fixing.current = false
    }
    markReadyIfFinite(el)
  }

  function ensureAnalyser() {
    if (analyserRef.current || !mediaRef.current) return
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AC()
    const source = ctx.createMediaElementSource(mediaRef.current)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 256
    source.connect(analyser)
    analyser.connect(ctx.destination) // keep the sound audible
    ctxRef.current = ctx
    analyserRef.current = analyser
  }

  function pump() {
    const analyser = analyserRef.current
    if (!analyser) return
    const data = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(data)
    let sum = 0
    for (const v of data) sum += v
    const level = Math.min(1, (sum / data.length / 255) * 1.8)
    onLevel(level)
    rafRef.current = requestAnimationFrame(pump)
  }

  function onPlay() {
    ensureAnalyser()
    ctxRef.current?.resume().catch(() => {})
    onPlayingChange(true)
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(pump)
  }

  function stopPump() {
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    onPlayingChange(false)
    onLevel(0)
  }

  const commonProps = {
    ref: mediaRef as never,
    src: url,
    controls: true,
    onLoadedMetadata,
    onDurationChange,
    onPlay,
    onPlaying: onPlay,
    onPause: stopPump,
    onEnded: stopPump,
  }

  return (
    <div className="relative mt-3">
      {hasVideo
        ? <video {...commonProps} className="w-full rounded-lg bg-black" />
        : <audio {...commonProps} className="w-full" />}
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-white/80 text-sm text-slate-600 backdrop-blur-sm">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-orange-500" />
          Preparing playback…
        </div>
      )}
    </div>
  )
}
