import type { Source } from './types'

// The research, standards and reports behind each article, keyed by article
// id. The same in every language, so kept once here and attached by index.ts.
//
// Original research papers first, then the standards, then guidance — and
// only sources for what the app really does (checked against src/ on
// 2026-09-29): lib/recorder.ts captures with getUserMedia (microphone,
// webcam) and getDisplayMedia (screen, system audio), mixes sound sources in
// a Web Audio AudioContext and records with MediaRecorder — WebM/Opus for
// audio, MP4 (avc1 + mp4a.40.2) or WebM (VP9/VP8 + Opus) for video;
// lib/encode.ts decodes with decodeAudioData and re-encodes on the device
// with @unisim/media 0.4 (a 16-bit RIFF/WAVE writer, and 128 kbps MP3 through
// @breezystack/lamejs); lib/localRecordings.ts keeps recordings in IndexedDB;
// lib/hostedRecordings.ts uploads only on Save to cloud, to a private Supabase
// Storage bucket over HTTPS. There is no speech recognition or analysis, so
// nothing on those is cited.
//
// ⚠️ `pdf` (our hosted copy at opensource.unisim.co.uk/kb/papers/) ONLY where
// the licence allows redistribution: the Opus paper (the authors' arXiv
// version, released under CC BY 4.0) and RFC 9559. IEEE and AES papers link to
// the DOI or a university's free copy; RFC 6716 and RFC 8446 have no
// rfc-editor PDF, so they link the HTML.

const OPUS_RFC: Source = {
  kind: 'standard',
  title: 'Definition of the Opus Audio Codec (RFC 6716)',
  authors: 'Jean-Marc Valin, Koen Vos, Timothy B. Terriberry',
  publisher: 'IETF',
  year: 2012,
  href: 'https://www.rfc-editor.org/rfc/rfc6716.html',
}

const MEDIA_CAPTURE: Source = {
  kind: 'standard',
  title: 'Media Capture and Streams (getUserMedia)',
  publisher: 'W3C',
  href: 'https://www.w3.org/TR/mediacapture-streams/',
}

const SCREEN_CAPTURE: Source = {
  kind: 'standard',
  title: 'Screen Capture (getDisplayMedia)',
  publisher: 'W3C',
  href: 'https://www.w3.org/TR/screen-capture/',
}

const LOCAL_FIRST: Source = {
  kind: 'paper',
  title: 'Local-first software: You own your data, in spite of the cloud',
  authors: 'Martin Kleppmann, Adam Wiggins, Peter van Hardenberg, Mark McGranaghan',
  publisher: 'ACM Onward!',
  year: 2019,
  href: 'https://www.inkandswitch.com/local-first/static/local-first.pdf',
}

export const SOURCES: Record<string, Source[]> = {
  'how-digital-audio-works': [
    {
      kind: 'paper',
      title: 'Certain Topics in Telegraph Transmission Theory',
      authors: 'Harry Nyquist',
      publisher: 'Transactions of the American Institute of Electrical Engineers',
      year: 1928,
      href: 'https://doi.org/10.1109/T-AIEE.1928.5055024',
    },
    {
      kind: 'paper',
      title: 'Communication in the Presence of Noise',
      authors: 'Claude E. Shannon',
      publisher: 'Proceedings of the IRE',
      year: 1949,
      href: 'https://doi.org/10.1109/JRPROC.1949.232969',
    },
    {
      kind: 'paper',
      title: 'The Philosophy of PCM',
      authors: 'B. M. Oliver, J. R. Pierce, C. E. Shannon',
      publisher: 'Proceedings of the IRE',
      year: 1948,
      href: 'https://doi.org/10.1109/JRPROC.1948.231941',
    },
  ],
  'audio-formats': [
    {
      kind: 'paper',
      title: 'High-Quality, Low-Delay Music Coding in the Opus Codec',
      authors: 'Jean-Marc Valin, Gregory Maxwell, Timothy B. Terriberry, Koen Vos',
      publisher: 'AES Convention',
      year: 2013,
      href: 'https://arxiv.org/abs/1602.04845',
      pdf: 'papers/valin-2013-opus-music-coding.pdf',
      licence: 'CC BY 4.0 — Valin, Maxwell, Terriberry, Vos (authors\' version, arXiv:1602.04845)',
    },
    OPUS_RFC,
    {
      kind: 'paper',
      title: 'MP3 and AAC explained',
      authors: 'Karlheinz Brandenburg',
      publisher: 'AES 17th International Conference on High-Quality Audio Coding',
      year: 1999,
      href: 'https://www.ee.columbia.edu/~dpwe/papers/Brand99-mp3.pdf',
    },
    {
      kind: 'standard',
      title: 'Multimedia Programming Interface and Data Specifications 1.0 (RIFF and WAVE)',
      authors: 'IBM Corporation, Microsoft Corporation',
      publisher: 'IBM and Microsoft',
      year: 1991,
      href: 'https://mmsp.ece.mcgill.ca/Documents/AudioFormats/WAVE/Docs/riffmci.pdf',
    },
  ],
  'permissions': [
    MEDIA_CAPTURE,
    SCREEN_CAPTURE,
    {
      kind: 'standard',
      title: 'Permissions',
      publisher: 'W3C',
      href: 'https://www.w3.org/TR/permissions/',
    },
  ],
  'how-recording-works': [
    {
      kind: 'standard',
      title: 'MediaStream Recording (MediaRecorder)',
      publisher: 'W3C',
      href: 'https://www.w3.org/TR/mediastream-recording/',
    },
    {
      kind: 'standard',
      title: 'Web Audio API',
      publisher: 'W3C',
      href: 'https://www.w3.org/TR/webaudio/',
    },
    {
      kind: 'standard',
      title: 'Matroska Media Container Format Specification (RFC 9559) — the container WebM is built on',
      authors: 'Steve Lhomme, Moritz Bunkus, Dave Rice',
      publisher: 'IETF',
      year: 2024,
      href: 'https://www.rfc-editor.org/rfc/rfc9559.html',
      pdf: 'papers/rfc-9559-matroska.pdf',
      licence: 'IETF Trust — RFC, freely redistributable unmodified',
    },
  ],
  'where-recordings-are-kept': [
    {
      kind: 'standard',
      title: 'Indexed Database API 3.0',
      publisher: 'W3C',
      href: 'https://www.w3.org/TR/IndexedDB/',
    },
    {
      kind: 'standard',
      title: 'Storage Standard (quotas and persistence)',
      publisher: 'WHATWG',
      href: 'https://storage.spec.whatwg.org/',
    },
    LOCAL_FIRST,
  ],
  'saving-to-the-cloud': [
    {
      kind: 'standard',
      title: 'The Transport Layer Security (TLS) Protocol Version 1.3 (RFC 8446)',
      authors: 'Eric Rescorla',
      publisher: 'IETF',
      year: 2018,
      href: 'https://www.rfc-editor.org/rfc/rfc8446.html',
    },
    {
      kind: 'guidance',
      title: 'Storage Access Control — the private bucket rules cloud saves sit behind',
      publisher: 'Supabase',
      href: 'https://supabase.com/docs/guides/storage/security/access-control',
    },
  ],
  'what-leaves-your-device': [
    LOCAL_FIRST,
    { ...MEDIA_CAPTURE, title: 'Media Capture and Streams — privacy indicator requirements' },
    {
      kind: 'guidance',
      title: 'Principle (c): Data minimisation',
      publisher: 'Information Commissioner\'s Office',
      href: 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/data-minimisation/',
    },
  ],
}
