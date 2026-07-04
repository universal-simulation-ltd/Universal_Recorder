// On-device transcoding. MediaRecorder gives us WebM/Opus natively; WAV and MP3
// are produced by decoding that to PCM and re-encoding — nothing is uploaded.
import { Mp3Encoder } from '@breezystack/lamejs'
import type { ExportFormat } from './types'

export const FORMAT_META: Record<ExportFormat, { label: string; ext: string; mime: string; hint: string }> = {
  webm: { label: 'WebM', ext: 'webm', mime: 'audio/webm', hint: 'Native · smallest' },
  mp3:  { label: 'MP3',  ext: 'mp3',  mime: 'audio/mpeg', hint: 'Universal · 128 kbps' },
  wav:  { label: 'WAV',  ext: 'wav',  mime: 'audio/wav',  hint: 'Uncompressed · largest' },
}

// Decode any recorded blob (WebM/Opus, etc.) to PCM via the Web Audio API.
async function decode(blob: Blob): Promise<AudioBuffer> {
  const ArrayCtor = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)
  const ctx = new ArrayCtor()
  try {
    return await ctx.decodeAudioData(await blob.arrayBuffer())
  } finally {
    void ctx.close()
  }
}

function floatToInt16(input: Float32Array): Int16Array {
  const out = new Int16Array(input.length)
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]))
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }
  return out
}

// 16-bit PCM WAV from an AudioBuffer (mono or stereo, interleaved).
function audioBufferToWav(buf: AudioBuffer): Blob {
  const numCh = Math.min(2, buf.numberOfChannels)
  const sampleRate = buf.sampleRate
  const frames = buf.length
  const bytesPerSample = 2
  const blockAlign = numCh * bytesPerSample
  const dataSize = frames * blockAlign
  const out = new ArrayBuffer(44 + dataSize)
  const view = new DataView(out)

  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i))
  }
  writeStr(0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeStr(8, 'WAVE')
  writeStr(12, 'fmt ')
  view.setUint32(16, 16, true)          // PCM chunk size
  view.setUint16(20, 1, true)           // audio format: PCM
  view.setUint16(22, numCh, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * blockAlign, true) // byte rate
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, 16, true)          // bits per sample
  writeStr(36, 'data')
  view.setUint32(40, dataSize, true)

  const channels: Float32Array[] = []
  for (let c = 0; c < numCh; c++) channels.push(buf.getChannelData(c))

  let offset = 44
  for (let i = 0; i < frames; i++) {
    for (let c = 0; c < numCh; c++) {
      const s = Math.max(-1, Math.min(1, channels[c][i]))
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
      offset += 2
    }
  }
  return new Blob([out], { type: 'audio/wav' })
}

// MP3 from an AudioBuffer via lamejs (CBR 128 kbps).
function audioBufferToMp3(buf: AudioBuffer, kbps = 128): Blob {
  const numCh = Math.min(2, buf.numberOfChannels)
  const sampleRate = buf.sampleRate
  const encoder = new Mp3Encoder(numCh, sampleRate, kbps)
  const left = floatToInt16(buf.getChannelData(0))
  const right = numCh > 1 ? floatToInt16(buf.getChannelData(1)) : left

  const chunks: Uint8Array[] = []
  const blockSize = 1152
  for (let i = 0; i < left.length; i += blockSize) {
    const l = left.subarray(i, i + blockSize)
    const r = right.subarray(i, i + blockSize)
    const mp3 = numCh > 1 ? encoder.encodeBuffer(l, r) : encoder.encodeBuffer(l)
    if (mp3.length > 0) chunks.push(new Uint8Array(mp3))
  }
  const flush = encoder.flush()
  if (flush.length > 0) chunks.push(new Uint8Array(flush))
  return new Blob(chunks as BlobPart[], { type: 'audio/mpeg' })
}

// Produce a blob in the requested format. WebM passes through (already the
// recorded container); WAV/MP3 decode to PCM then re-encode.
export async function toFormat(recorded: Blob, format: ExportFormat): Promise<Blob> {
  if (format === 'webm') return recorded
  const pcm = await decode(recorded)
  return format === 'wav' ? audioBufferToWav(pcm) : audioBufferToMp3(pcm)
}
