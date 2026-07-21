import { useEffect, useRef, useState } from 'react'
import type { PipPosition, PipShape, PipSize } from '../lib/types'

// A live, WYSIWYG preview of the webcam picture-in-picture BEFORE recording.
// The camera turns on so you can drag it anywhere on a stand-in "screen" and see
// the chosen shape/size exactly as it will be composited. The box maths mirror
// the recorder's canvas compositor (same size fractions, same 3% margin, same
// clamping) so what you place here is what gets recorded.

interface Props {
  /** Live camera stream for the preview (null before permission / while off). */
  stream: MediaStream | null
  /**
   * A frozen still of the user's real screen (data URL) used as the stage
   * backdrop, so the camera can be placed over the actual screen. A STILL frame
   * (not a live feed) is deliberate: it can't recurse into a mirror-tunnel the
   * way a live view of the screen you're capturing would. null → a plain
   * placeholder is shown instead.
   */
  backdrop: string | null
  shape: PipShape
  size: PipSize
  position: PipPosition
  /** Free centre placement (0..1). null → fall back to the corner `position`. */
  x: number | null
  y: number | null
  /**
   * true when a screen is also being captured → the camera is a draggable PiP.
   * false → the camera records full-frame, so there's nothing to place.
   */
  isPip: boolean
  onDrag: (x: number, y: number) => void
}

// Keep in step with PipCompositor.sizeFraction() in lib/recorder.ts.
const SIZE_FRACTION: Record<PipSize, number> = { sm: 0.16, md: 0.23, lg: 0.3 }
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi)

export default function OverlayDesigner({ stream, backdrop, shape, size, position, x, y, isPip, onDrag }: Props) {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [stage, setStage] = useState({ w: 0, h: 0 })
  const [camHW, setCamHW] = useState(0.75) // camera height/width; 4:3 until known
  const [bgAspect, setBgAspect] = useState('16 / 9') // stage aspect; matches the screenshot once loaded
  const [dragging, setDragging] = useState(false)

  // Bind the live camera stream to whichever <video> is mounted.
  useEffect(() => {
    const el = videoRef.current
    if (el && el.srcObject !== stream) el.srcObject = stream
  }, [stream, isPip])

  // Track the stage's pixel size so the overlay-box maths match the compositor.
  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const measure = () => setStage({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const frac = SIZE_FRACTION[size]
  const boxW = stage.w * frac
  const boxH = shape === 'rounded' ? boxW * camHW : boxW // circle/square are 1:1
  const margin = Math.max(8, Math.min(stage.w, stage.h) * 0.03)
  let bx: number
  let by: number
  if (x != null && y != null) {
    bx = clamp(x * stage.w - boxW / 2, margin, Math.max(margin, stage.w - boxW - margin))
    by = clamp(y * stage.h - boxH / 2, margin, Math.max(margin, stage.h - boxH - margin))
  } else {
    bx = position === 'bl' || position === 'tl' ? margin : stage.w - boxW - margin
    by = position === 'tl' || position === 'tr' ? margin : stage.h - boxH - margin
  }

  const radius = shape === 'circle' ? '9999px' : shape === 'square' ? '2px' : `${Math.min(24, boxW * 0.08)}px`

  function onLoadedMetadata(e: React.SyntheticEvent<HTMLVideoElement>) {
    const v = e.currentTarget
    if (v.videoWidth > 0) setCamHW(v.videoHeight / v.videoWidth)
  }

  function onPointerDown(e: React.PointerEvent) {
    if (!isPip) return
    e.preventDefault()
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* capture unsupported / stale pointer */ }
    setDragging(true)
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging || !isPip) return
    const rect = stageRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return
    onDrag(
      clamp((e.clientX - rect.left) / rect.width, 0, 1),
      clamp((e.clientY - rect.top) / rect.height, 0, 1),
    )
  }
  function endDrag(e: React.PointerEvent) {
    if (!isPip) return
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch { /* already released */ }
    setDragging(false)
  }

  return (
    <div className="mb-2">
      <div
        ref={stageRef}
        className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-900"
        style={{ aspectRatio: backdrop && isPip ? bgAspect : '16 / 9' }}
      >
        {isPip ? (
          <>
            {backdrop ? (
              // A frozen still of the real screen — placement is against exactly
              // what will be recorded, with no live mirror-tunnel.
              <img
                src={backdrop}
                alt="Your screen"
                onLoad={e => {
                  const im = e.currentTarget
                  if (im.naturalWidth > 0) setBgAspect(`${im.naturalWidth} / ${im.naturalHeight}`)
                }}
                className="pointer-events-none absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              // Stand-in "screen" until the user grabs a real screenshot.
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium uppercase tracking-wide text-white/20">Your screen</span>
              </div>
            )}
            <div
              role="button"
              tabIndex={0}
              aria-label="Drag to position the webcam overlay"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              className={`absolute touch-none select-none ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              style={{
                left: `${bx}px`,
                top: `${by}px`,
                width: `${boxW}px`,
                height: `${boxH}px`,
                borderRadius: radius,
                boxShadow: '0 6px 16px rgba(0,0,0,.45)',
                border: '2px solid rgba(255,255,255,.9)',
                boxSizing: 'border-box',
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                onLoadedMetadata={onLoadedMetadata}
                className="h-full w-full object-cover"
                style={{ borderRadius: 'inherit' }}
              />
            </div>
          </>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            onLoadedMetadata={onLoadedMetadata}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>
      <p className="mt-1.5 text-[11px] text-slate-500">
        {isPip
          ? backdrop
            ? 'Drag the camera to place it over your screen. Pick a shape and size — your layout is remembered on this device.'
            : 'Drag the camera to place it, then pick a shape and size. Use “Live preview” to drop in a still of your real screen.'
          : 'Full-frame preview. Add Screen to overlay the camera as a draggable picture-in-picture.'}
      </p>
    </div>
  )
}
