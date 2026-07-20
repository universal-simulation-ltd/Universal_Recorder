// Capture sources. Any combination can be recorded at once:
//   mic    — the microphone (getUserMedia audio)
//   system — this device's audio (getDisplayMedia audio)
//   screen — the screen/window/tab as video (getDisplayMedia video)
//   webcam — the camera (getUserMedia video), composited as a picture-in-picture
//            overlay on the screen (or recorded full-frame when screen is off)
// `system` and `screen` both come from one screen-share prompt.
export type Source = 'mic' | 'system' | 'screen' | 'webcam'

// Where the webcam picture-in-picture overlay sits and how big it is (as a
// fraction of the screen width). Both can be changed live while recording.
export type PipPosition = 'br' | 'bl' | 'tr' | 'tl'
export type PipSize = 'sm' | 'md' | 'lg'
export interface WebcamOverlay {
  position: PipPosition
  size: PipSize
}

// Save-as formats. WebM is what MediaRecorder produces natively; WAV and MP3 are
// audio-only transcodes from the decoded PCM (so they're offered only for
// audio-only recordings — a screen capture has a video track).
export type ExportFormat = 'webm' | 'mp3' | 'wav'

export interface RecordingBlobResult {
  blob: Blob
  /** MediaRecorder's native container mime (e.g. audio/webm or video/webm). */
  mimeType: string
  durationSec: number
  /** True when the recording contains a screen video track. */
  hasVideo: boolean
}

// A finished recording kept in local-first storage (IndexedDB). The webm blob is
// the source of truth; WAV/MP3 are transcoded on demand at download time.
export interface StoredRecording {
  id: string
  name: string
  createdAt: number
  durationSec: number
  mimeType: string
  /** Which sources were mixed into this recording. */
  sources: Source[]
  /** True when the blob is a screen capture (video/webm). */
  hasVideo: boolean
  blob: Blob
}
