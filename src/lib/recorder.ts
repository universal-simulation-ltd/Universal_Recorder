// Capture engine. Any combination of {microphone, system audio, screen} can be
// recorded at once. Audio routes through one Web Audio graph
//   sources → gain → analyser → MediaStreamDestination
// so metering and the recorded audio stay in sync, and mic + system audio become
// a real mix in a single track. When "screen" is chosen the screen video track is
// muxed in alongside that audio. Recording uses MediaRecorder (WebM); nothing
// leaves the browser.
import type { RecordingBlobResult, Source } from './types'

function pickMime(hasVideo: boolean): string {
  // For screen video, prefer MP4 (H.264/AAC) — it plays in QuickTime, PowerPoint,
  // Windows Media Player and most editors, unlike WebM. Recent Chrome/Edge/Safari
  // can record it natively; Firefox can't, so we fall back to WebM there.
  const candidates = hasVideo
    ? [
        'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
        'video/mp4;codecs=avc1,mp4a',
        'video/mp4',
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
      ]
    : ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus']
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
  sources: Source[]
  deviceId?: string
  onLevel?: (level: number) => void
  /** Fired if a shared stream ends on its own (the browser's "Stop sharing"). */
  onEnded?: () => void
  /** Non-fatal notice, e.g. system audio wasn't shared but we started anyway. */
  onWarning?: (message: string) => void
}

export class AudioRecorder {
  private recorder?: MediaRecorder
  private chunks: Blob[] = []
  private tracks: MediaStreamTrack[] = []
  private ctx?: AudioContext
  private analyser?: AnalyserNode
  private raf = 0
  private onLevel?: (n: number) => void
  private onEnded?: () => void
  private endedFired = false
  private mime = ''
  private hasVideo = false
  private startedAt = 0
  private pausedAt = 0
  private pausedTotal = 0

  get mimeType(): string { return this.mime }

  async start(opts: StartOptions): Promise<void> {
    const wantMic = opts.sources.includes('mic')
    const wantSystem = opts.sources.includes('system')
    const wantScreen = opts.sources.includes('screen')
    if (!wantMic && !wantSystem && !wantScreen) {
      throw new Error('Choose at least one source to record.')
    }

    this.onLevel = opts.onLevel
    this.onEnded = opts.onEnded
    this.endedFired = false

    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctor()
    this.ctx = ctx

    const destination = ctx.createMediaStreamDestination()
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 1024
    analyser.connect(destination)
    this.analyser = analyser

    let audioConnected = false
    const addAudio = (stream: MediaStream) => {
      stream.getTracks().forEach(t => this.trackForCleanup(t))
      const src = ctx.createMediaStreamSource(stream)
      src.connect(analyser)
      audioConnected = true
    }

    let videoTrack: MediaStreamTrack | undefined

    try {
      // Microphone
      if (wantMic) {
        const mic = await navigator.mediaDevices.getUserMedia({
          audio: opts.deviceId ? { deviceId: { exact: opts.deviceId } } : true,
        })
        addAudio(mic)
      }

      // Screen video and/or system audio come from one getDisplayMedia prompt.
      // Chrome only exposes a system/tab audio track when video is also requested,
      // so we request video even for system-audio-only and drop it afterwards.
      if (wantSystem || wantScreen) {
        const display = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: wantSystem })
        const vids = display.getVideoTracks()
        const auds = display.getAudioTracks()

        if (wantScreen && vids.length > 0) {
          videoTrack = vids[0]
          this.trackForCleanup(videoTrack)
          vids.slice(1).forEach(t => t.stop())
          this.hasVideo = true
        } else {
          vids.forEach(t => t.stop())
        }

        if (wantSystem && auds.length > 0) {
          addAudio(new MediaStream(auds))
        } else if (wantSystem) {
          // No system-audio track came back (the picker's "Share audio" wasn't
          // ticked, or this source can't share audio).
          if (!wantScreen && !audioConnected) {
            this.cleanup()
            throw new Error('No audio was shared. When the picker opens, choose a tab or screen and tick “Share audio”.')
          }
          opts.onWarning?.('System audio wasn’t shared, so it isn’t included — tick “Share audio” in the picker next time.')
        } else {
          auds.forEach(t => t.stop())
        }
      }
    } catch (err) {
      // A permission denial / cancelled picker leaves the graph half-built.
      this.cleanup()
      throw err
    }

    await ctx.resume()
    this.mime = pickMime(this.hasVideo)

    // The recorded stream = the screen video (if any) + the single mixed audio
    // track from the graph (only when something was actually connected).
    const recordedTracks: MediaStreamTrack[] = []
    if (videoTrack) recordedTracks.push(videoTrack)
    if (audioConnected) recordedTracks.push(...destination.stream.getAudioTracks())
    const recordStream = new MediaStream(recordedTracks)

    // If the user stops sharing via the browser bar, end the recording cleanly.
    recordedTracks.forEach(t => t.addEventListener('ended', this.handleTrackEnded))

    this.recorder = new MediaRecorder(recordStream, this.mime ? { mimeType: this.mime } : undefined)
    this.chunks = []
    this.recorder.ondataavailable = e => { if (e.data.size > 0) this.chunks.push(e.data) }
    this.recorder.start(250)
    this.startedAt = performance.now()
    this.pausedTotal = 0
    this.meter()
  }

  private trackForCleanup(t: MediaStreamTrack) { this.tracks.push(t) }

  private handleTrackEnded = () => {
    if (this.endedFired) return
    this.endedFired = true
    this.onEnded?.()
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
    const fallback = this.hasVideo ? 'video/webm' : 'audio/webm'
    const blob: Blob = await new Promise(resolve => {
      // A shared stream ending on its own (browser "Stop sharing") auto-stops the
      // recorder — by the time we're here it's already inactive with its final
      // chunk buffered, so build straight from the chunks instead of re-stopping.
      if (rec.state === 'inactive') {
        resolve(new Blob(this.chunks, { type: this.mime || fallback }))
        return
      }
      rec.onstop = () => resolve(new Blob(this.chunks, { type: this.mime || fallback }))
      rec.stop()
    })
    this.cleanup()
    return { blob, mimeType: this.mime || fallback, durationSec, hasVideo: this.hasVideo }
  }

  private cleanup(): void {
    cancelAnimationFrame(this.raf)
    this.tracks.forEach(t => {
      t.removeEventListener('ended', this.handleTrackEnded)
      t.stop()
    })
    this.tracks = []
    if (this.ctx && this.ctx.state !== 'closed') void this.ctx.close()
    this.ctx = undefined
    this.analyser = undefined
    this.recorder = undefined
  }
}
