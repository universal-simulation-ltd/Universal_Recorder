// Capture engine. Every mode routes through one Web Audio graph
//   sources → gain → analyser → MediaStreamDestination
// so metering and the recorded stream stay in sync, and "both" is a real mix of
// microphone + system audio into a single track. Recording uses MediaRecorder
// (WebM/Opus); nothing leaves the browser.
import type { RecordingBlobResult, SourceMode } from './types'

function pickMime(): string {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus']
  for (const c of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(c)) return c
  }
  return ''
}

// List the available microphones (labels populate only after mic permission).
export async function listMicrophones(): Promise<MediaDeviceInfo[]> {
  if (!navigator.mediaDevices?.enumerateDevices) return []
  const devices = await navigator.mediaDevices.enumerateDevices()
  return devices.filter(d => d.kind === 'audioinput')
}

export interface StartOptions {
  mode: SourceMode
  deviceId?: string
  onLevel?: (level: number) => void
}

export class AudioRecorder {
  private recorder?: MediaRecorder
  private chunks: Blob[] = []
  private tracks: MediaStreamTrack[] = []
  private ctx?: AudioContext
  private analyser?: AnalyserNode
  private raf = 0
  private onLevel?: (n: number) => void
  private mime = ''
  private startedAt = 0
  private pausedAt = 0
  private pausedTotal = 0

  get mimeType(): string { return this.mime }

  async start(opts: StartOptions): Promise<void> {
    this.onLevel = opts.onLevel
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctor()
    this.ctx = ctx

    const destination = ctx.createMediaStreamDestination()
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 1024
    analyser.connect(destination)
    this.analyser = analyser

    const addSource = (stream: MediaStream) => {
      stream.getTracks().forEach(t => this.tracks.push(t))
      const src = ctx.createMediaStreamSource(stream)
      src.connect(analyser)
    }

    // Microphone
    if (opts.mode === 'mic' || opts.mode === 'both') {
      const mic = await navigator.mediaDevices.getUserMedia({
        audio: opts.deviceId ? { deviceId: { exact: opts.deviceId } } : true,
      })
      addSource(mic)
    }
    // System audio — Chrome only offers a tab/system audio track when video is
    // requested; we keep the audio and drop the video track immediately.
    if (opts.mode === 'system' || opts.mode === 'both') {
      const display = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
      const audio = display.getAudioTracks()
      display.getVideoTracks().forEach(t => t.stop())
      if (audio.length === 0) {
        this.cleanup()
        throw new Error('No system audio was shared. When the picker opens, choose a tab or screen and tick "Share audio".')
      }
      addSource(new MediaStream(audio))
    }

    await ctx.resume()
    this.mime = pickMime()
    this.recorder = new MediaRecorder(destination.stream, this.mime ? { mimeType: this.mime } : undefined)
    this.chunks = []
    this.recorder.ondataavailable = e => { if (e.data.size > 0) this.chunks.push(e.data) }
    this.recorder.start(250)
    this.startedAt = performance.now()
    this.pausedTotal = 0
    this.meter()
  }

  private meter = () => {
    if (!this.analyser) return
    const buf = new Uint8Array(this.analyser.fftSize)
    this.analyser.getByteTimeDomainData(buf)
    let peak = 0
    for (let i = 0; i < buf.length; i++) {
      const v = Math.abs(buf[i] - 128) / 128
      if (v > peak) peak = v
    }
    this.onLevel?.(peak)
    this.raf = requestAnimationFrame(this.meter)
  }

  pause(): void {
    if (this.recorder?.state === 'recording') {
      this.recorder.pause()
      this.pausedAt = performance.now()
      cancelAnimationFrame(this.raf)
      this.onLevel?.(0)
    }
  }

  resume(): void {
    if (this.recorder?.state === 'paused') {
      this.pausedTotal += performance.now() - this.pausedAt
      this.recorder.resume()
      this.meter()
    }
  }

  /** Elapsed recorded seconds, excluding paused time. */
  elapsedSec(): number {
    if (!this.startedAt) return 0
    const now = this.recorder?.state === 'paused' ? this.pausedAt : performance.now()
    return Math.max(0, (now - this.startedAt - this.pausedTotal) / 1000)
  }

  async stop(): Promise<RecordingBlobResult> {
    const durationSec = this.elapsedSec()
    const rec = this.recorder
    if (!rec) throw new Error('Not recording')
    const blob: Blob = await new Promise(resolve => {
      rec.onstop = () => resolve(new Blob(this.chunks, { type: this.mime || 'audio/webm' }))
      rec.stop()
    })
    this.cleanup()
    return { blob, mimeType: this.mime || 'audio/webm', durationSec }
  }

  private cleanup(): void {
    cancelAnimationFrame(this.raf)
    this.tracks.forEach(t => t.stop())
    this.tracks = []
    if (this.ctx && this.ctx.state !== 'closed') void this.ctx.close()
    this.ctx = undefined
    this.analyser = undefined
    this.recorder = undefined
  }
}
