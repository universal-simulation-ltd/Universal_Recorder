// Capture engine. Any combination of {microphone, system audio, screen, webcam}
// can be recorded at once. Audio routes through one Web Audio graph
//   sources → gain → analyser → MediaStreamDestination
// so metering and the recorded audio stay in sync, and mic + system audio become
// a real mix in a single track. When "screen" is chosen the screen video track is
// muxed in alongside that audio. When "webcam" is also on, the screen and camera
// are composited on a <canvas> (camera as a picture-in-picture overlay) and the
// canvas's captureStream video is recorded instead of the raw screen track. With
// webcam but no screen the camera is recorded full-frame. Recording uses
// MediaRecorder; everything stays on-device, nothing is uploaded.
import type { RecordingBlobResult, Source, WebcamOverlay } from './types'

// The picture-in-picture overlay: draws the screen full-bleed on a canvas, then
// the webcam on top in one corner. Reads a live-mutable overlay config each frame
// so the corner/size can be changed while recording. captureStream() gives the
// composited video track that gets muxed into the recording.
class PipCompositor {
  private canvas = document.createElement('canvas')
  private ctx: CanvasRenderingContext2D
  private screenVideo = document.createElement('video')
  private webcamVideo = document.createElement('video')
  private stream: MediaStream
  private raf = 0
  private overlay: WebcamOverlay

  constructor(screenTrack: MediaStreamTrack, webcamTrack: MediaStreamTrack, overlay: WebcamOverlay) {
    this.overlay = overlay
    const s = screenTrack.getSettings()
    this.canvas.width = s.width && s.width > 0 ? s.width : 1280
    this.canvas.height = s.height && s.height > 0 ? s.height : 720
    const ctx = this.canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D context is unavailable in this browser.')
    this.ctx = ctx

    for (const [el, track] of [
      [this.screenVideo, screenTrack],
      [this.webcamVideo, webcamTrack],
    ] as const) {
      el.srcObject = new MediaStream([track])
      el.muted = true
      el.playsInline = true
      // Kept out of the layout but on-screen: display:none pauses frame delivery
      // in some browsers, so we park it off to the side instead.
      el.style.cssText = 'position:fixed;left:-9999px;top:0;width:2px;height:2px;opacity:0;pointer-events:none'
      document.body.appendChild(el)
      void el.play().catch(() => {})
    }

    this.stream = this.canvas.captureStream(30)
    this.raf = requestAnimationFrame(this.draw)
  }

  setOverlay(overlay: WebcamOverlay) { this.overlay = overlay }

  get videoTrack(): MediaStreamTrack { return this.stream.getVideoTracks()[0] }

  private sizeFraction(): number {
    return this.overlay.size === 'lg' ? 0.30 : this.overlay.size === 'sm' ? 0.16 : 0.23
  }

  private draw = () => {
    const { ctx, canvas, screenVideo: sv, webcamVideo: wv } = this

    // Track the real screen resolution once it's known (a window/tab share can
    // report its size only after the first frame).
    if (sv.videoWidth > 0 && sv.videoHeight > 0) {
      if (canvas.width !== sv.videoWidth || canvas.height !== sv.videoHeight) {
        canvas.width = sv.videoWidth
        canvas.height = sv.videoHeight
      }
      ctx.drawImage(sv, 0, 0, canvas.width, canvas.height)
    } else {
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    if (wv.videoWidth > 0 && wv.videoHeight > 0) {
      const margin = Math.max(16, Math.round(Math.min(canvas.width, canvas.height) * 0.03))
      const boxW = Math.round(canvas.width * this.sizeFraction())
      const boxH = Math.round(boxW * (wv.videoHeight / wv.videoWidth))
      const pos = this.overlay.position
      const x = pos === 'bl' || pos === 'tl' ? margin : canvas.width - boxW - margin
      const y = pos === 'tl' || pos === 'tr' ? margin : canvas.height - boxH - margin
      const r = Math.min(24, Math.round(boxW * 0.08))

      ctx.save()
      // Drop shadow so the overlay reads as a distinct panel over any background.
      ctx.shadowColor = 'rgba(0,0,0,0.45)'
      ctx.shadowBlur = Math.round(boxW * 0.05)
      ctx.shadowOffsetY = Math.round(boxW * 0.02)
      this.roundRect(x, y, boxW, boxH, r)
      ctx.fillStyle = '#000'
      ctx.fill()
      ctx.restore()

      ctx.save()
      this.roundRect(x, y, boxW, boxH, r)
      ctx.clip()
      // "Cover" the box: crop the camera frame to the box's aspect, no stretching.
      const scale = Math.max(boxW / wv.videoWidth, boxH / wv.videoHeight)
      const dw = wv.videoWidth * scale
      const dh = wv.videoHeight * scale
      ctx.drawImage(wv, x + (boxW - dw) / 2, y + (boxH - dh) / 2, dw, dh)
      ctx.restore()

      // Hairline border to lift the overlay off the screen content.
      ctx.save()
      this.roundRect(x, y, boxW, boxH, r)
      ctx.lineWidth = Math.max(2, Math.round(boxW * 0.012))
      ctx.strokeStyle = 'rgba(255,255,255,0.9)'
      ctx.stroke()
      ctx.restore()
    }

    this.raf = requestAnimationFrame(this.draw)
  }

  private roundRect(x: number, y: number, w: number, h: number, r: number) {
    const ctx = this.ctx
    ctx.beginPath()
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, w, h, r)
      return
    }
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
    ctx.closePath()
  }

  stop() {
    cancelAnimationFrame(this.raf)
    this.stream.getTracks().forEach(t => t.stop())
    for (const el of [this.screenVideo, this.webcamVideo]) {
      el.srcObject = null
      el.remove()
    }
  }
}

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

// List the available cameras (labels populate only after camera permission).
export async function listCameras(): Promise<MediaDeviceInfo[]> {
  if (!navigator.mediaDevices?.enumerateDevices) return []
  const devices = await navigator.mediaDevices.enumerateDevices()
  return devices.filter(d => d.kind === 'videoinput')
}

export interface StartOptions {
  sources: Source[]
  deviceId?: string
  /** Which camera to use for the webcam overlay (when `webcam` is a source). */
  webcamDeviceId?: string
  /** Webcam picture-in-picture placement (when `webcam` is a source). */
  webcam?: WebcamOverlay
  /** Chrome hint that pre-selects the screen-picker pane: monitor | window | browser. */
  displaySurface?: 'monitor' | 'window' | 'browser'
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
  private compositor?: PipCompositor
  private preview?: MediaStream

  get mimeType(): string { return this.mime }

  /** Video-only, muted stream for a live self-view while recording (or undefined
   *  when there's no video source). Shares tracks with the recording. */
  get previewStream(): MediaStream | undefined { return this.preview }

  /** Move/resize the webcam overlay live while recording. No-op without a webcam. */
  setWebcamOverlay(overlay: WebcamOverlay): void { this.compositor?.setOverlay(overlay) }

  async start(opts: StartOptions): Promise<void> {
    const wantMic = opts.sources.includes('mic')
    const wantSystem = opts.sources.includes('system')
    const wantScreen = opts.sources.includes('screen')
    const wantWebcam = opts.sources.includes('webcam')
    if (!wantMic && !wantSystem && !wantScreen && !wantWebcam) {
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

    // The raw screen-share video track (if any) and the raw webcam track (if any),
    // resolved below. The video that actually gets recorded is decided afterwards:
    // screen+webcam → composited canvas; webcam only → the camera full-frame.
    let screenTrack: MediaStreamTrack | undefined
    let webcamTrack: MediaStreamTrack | undefined

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
        // `displaySurface` pre-selects the picker pane in Chrome (a hint — the
        // user still confirms; Firefox ignores it). We always request video (even
        // for system-audio-only) because Chrome only exposes system audio with it.
        const video: boolean | MediaTrackConstraints =
          opts.displaySurface ? ({ displaySurface: opts.displaySurface } as MediaTrackConstraints) : true
        const display = await navigator.mediaDevices.getDisplayMedia({ video, audio: wantSystem })
        const vids = display.getVideoTracks()
        const auds = display.getAudioTracks()

        if (wantScreen && vids.length > 0) {
          screenTrack = vids[0]
          this.trackForCleanup(screenTrack)
          vids.slice(1).forEach(t => t.stop())
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

      // Webcam (getUserMedia video). Captured last so the screen picker comes
      // first, then the camera prompt.
      if (wantWebcam) {
        const cam = await navigator.mediaDevices.getUserMedia({
          video: opts.webcamDeviceId ? { deviceId: { exact: opts.webcamDeviceId } } : true,
        })
        const camVids = cam.getVideoTracks()
        if (camVids.length > 0) {
          webcamTrack = camVids[0]
          this.trackForCleanup(webcamTrack)
        }
      }
    } catch (err) {
      // A permission denial / cancelled picker leaves the graph half-built.
      this.cleanup()
      throw err
    }

    // Decide the recorded video track:
    //   screen + webcam → composite the camera onto the screen as a PiP overlay
    //   webcam only     → the camera full-frame
    //   screen only     → the raw screen track (unchanged behaviour)
    let videoTrack: MediaStreamTrack | undefined
    // The real capture tracks whose ending should stop the recording (the browser
    // "Stop sharing" bar / a camera being unplugged). The composited canvas track
    // never "ends" on its own, so we watch the sources instead.
    const endWatch: MediaStreamTrack[] = []
    if (screenTrack && webcamTrack) {
      this.compositor = new PipCompositor(screenTrack, webcamTrack, opts.webcam ?? { position: 'br', size: 'md' })
      videoTrack = this.compositor.videoTrack
      endWatch.push(screenTrack, webcamTrack)
    } else if (webcamTrack) {
      videoTrack = webcamTrack
      endWatch.push(webcamTrack)
    } else if (screenTrack) {
      videoTrack = screenTrack
      endWatch.push(screenTrack)
    }
    this.hasVideo = !!videoTrack

    await ctx.resume()
    this.mime = pickMime(this.hasVideo)

    // The recorded stream = the video (composite / camera / screen, if any) + the
    // single mixed audio track from the graph (only when something was connected).
    const recordedTracks: MediaStreamTrack[] = []
    if (videoTrack) recordedTracks.push(videoTrack)
    if (audioConnected) recordedTracks.push(...destination.stream.getAudioTracks())
    const recordStream = new MediaStream(recordedTracks)

    // Video-only, muted self-view for the UI while recording (shares the track).
    this.preview = videoTrack ? new MediaStream([videoTrack]) : undefined

    // If the user stops sharing via the browser bar, end the recording cleanly.
    endWatch.forEach(t => t.addEventListener('ended', this.handleTrackEnded))

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
    this.compositor?.stop()
    this.compositor = undefined
    this.preview = undefined
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
