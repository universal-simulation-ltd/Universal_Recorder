// On-device transcoding. MediaRecorder gives us WebM/Opus natively; WAV and MP3
// are produced by decoding that to PCM and re-encoding — nothing is uploaded.
//
// The encoders themselves live in @unisim/media (0.4.0). Recorder had its own
// WAV writer and its own LAME loop, and so did Universal Converter and Universal
// Compress — three implementations of two encoders that no browser provides.
// §10.6 of Docs_UNI_SIM/next-products.md called for exactly this extraction and
// named Recorder as its second consumer.
//
// ⚠️ The move is a FIX, not just a tidy-up. Recorder's private `floatToInt16`
// scaled positives by 0x7fff and negatives by 0x8000 (correct) but then
// TRUNCATED — no rounding — so a value that had decoded as `v/32767` came back
// one LSB short. Measured in the package's self-tests: every positive int16
// value survives the shared conversion, while the truncating one loses over a
// thousand of them. Recorder's WAV export was not bit-exact against a decode of
// its own recording; it is now.
import { encodeMp3, encodeWav, nearestLameRate } from '@unisim/media'
import type { ExportFormat } from './types'

export const FORMAT_META: Record<ExportFormat, { label: string; ext: string; mime: string; hint: string }> = {
  webm: { label: 'WebM', ext: 'webm', mime: 'audio/webm', hint: 'Native · smallest' },
  mp3:  { label: 'MP3',  ext: 'mp3',  mime: 'audio/mpeg', hint: 'Universal · 128 kbps' },
  wav:  { label: 'WAV',  ext: 'wav',  mime: 'audio/wav',  hint: 'Uncompressed · largest' },
}

/** CBR bitrate for the MP3 export — matches the "128 kbps" the format chip promises. */
const MP3_KBPS = 128

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

/** The buffer's channels as the planar Float32 arrays both encoders take.
 *  Capped at two: LAME accepts no more, and a WAV beyond stereo would need a
 *  real downmix rather than dropping channels. MediaRecorder never gives us
 *  more than two from a microphone or a tab capture. */
function planar(buf: AudioBuffer): Float32Array[] {
  const numCh = Math.min(2, buf.numberOfChannels)
  const channels: Float32Array[] = []
  for (let c = 0; c < numCh; c++) channels.push(buf.getChannelData(c))
  return channels
}

/** Re-render at a sample rate LAME will accept.
 *
 *  `decodeAudioData` resamples to the AudioContext's rate, which is the audio
 *  hardware's — usually 48 kHz, but 88.2 or 96 kHz on a decent interface, and
 *  LAME takes neither. The old private encoder never checked and would have
 *  handed the rate straight to LAME; the shared one throws rather than write a
 *  file that plays at the wrong speed, so resample first, the same way
 *  Converter and Compress do. */
async function toLameRate(buf: AudioBuffer): Promise<AudioBuffer> {
  const target = nearestLameRate(buf.sampleRate)
  if (target === buf.sampleRate) return buf
  const channelCount = Math.min(2, buf.numberOfChannels)
  const ctx = new OfflineAudioContext(channelCount, Math.max(1, Math.ceil(buf.duration * target)), target)
  const source = ctx.createBufferSource()
  source.buffer = buf
  source.connect(ctx.destination)
  source.start(0)
  return ctx.startRendering()
}

// Produce a blob in the requested format. WebM passes through (already the
// recorded container); WAV/MP3 decode to PCM then re-encode.
export async function toFormat(recorded: Blob, format: ExportFormat): Promise<Blob> {
  if (format === 'webm') return recorded
  const pcm = await decode(recorded)
  // WAV carries whatever rate the recording has — no resample, so it stays a
  // lossless copy of what was captured.
  if (format === 'wav') return encodeWav(planar(pcm), pcm.sampleRate)
  const forMp3 = await toLameRate(pcm)
  return encodeMp3(planar(forMp3), forMp3.sampleRate, MP3_KBPS)
}
