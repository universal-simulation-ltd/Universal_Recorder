// Where the audio comes from.
export type SourceMode = 'mic' | 'system' | 'both'

// Save-as formats. WebM/Opus is what MediaRecorder produces natively; WAV and
// MP3 are transcoded from the decoded PCM entirely on-device.
export type ExportFormat = 'webm' | 'mp3' | 'wav'

export interface RecordingBlobResult {
  blob: Blob
  /** MediaRecorder's native container mime (e.g. audio/webm;codecs=opus). */
  mimeType: string
  durationSec: number
}

// A finished recording kept in local-first storage (IndexedDB). The webm blob
// is the source of truth; WAV/MP3 are transcoded on demand at download time.
export interface StoredRecording {
  id: string
  name: string
  createdAt: number
  durationSec: number
  mimeType: string
  source: SourceMode
  blob: Blob
}
