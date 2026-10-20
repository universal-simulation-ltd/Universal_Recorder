# What Universal Recorder does with your recordings

This page is written to be checked: every claim below names the file in this
repository that makes it true, and you are welcome to go and read it.

The short version: **your recording is captured, encoded and kept by your own
browser.** It is not uploaded to us, and there is never a copy of it on our servers.

---

## What happens when you record

You choose what to record: your microphone, your system audio, your screen,
your webcam, or any mix of them. Your browser asks you for permission first,
and everything after that happens on your machine:

| Step | Where it happens | The code |
|---|---|---|
| Capturing the microphone, camera and screen | your browser (`getUserMedia`, `getDisplayMedia`) | [`src/lib/recorder.ts`](src/lib/recorder.ts) |
| Mixing the audio and placing the webcam over the screen | your browser (Web Audio and a canvas) | [`src/lib/recorder.ts`](src/lib/recorder.ts) |
| Recording | your browser (`MediaRecorder`) | [`src/lib/recorder.ts`](src/lib/recorder.ts) |
| Converting to MP3 or WAV | your browser | [`src/lib/encode.ts`](src/lib/encode.ts) |
| Saving a file | your browser's download | [`src/components/RecorderStudio.tsx`](src/components/RecorderStudio.tsx) |

**Finished recordings stay on your device.** The app keeps them in IndexedDB,
which is storage inside your own browser. See
[`src/lib/localRecordings.ts`](src/lib/localRecordings.ts). Clearing your
browser data deletes them. Nobody else can read them, including us. Your
countdown and webcam overlay choices are kept in your browser's local storage
in the same way.

---

## What the app talks to a server for, even though your recording doesn't

If you open your browser's Network tab you will see some requests. Here is
what they are:

- **No sign-in, and no open count.** The app has no sign-in (since
  2026-10-20; it only ever unlocked "Save to cloud", which is gone too), and it
  stays signed out even if your browser is signed in to UNI·SIM elsewhere.
  With no sign-in, the suite's anonymous daily open count is off too, so
  nothing records that you opened it. See `noAccounts` in
  [`src/main.tsx`](src/main.tsx).
- **The changelog and update notice**, which is just fetching a list of
  releases.

**There is no third-party analytics, no tracking pixel, and no advertising
script.** The site's Content-Security-Policy
([`public/_headers`](public/_headers)) only lets the page run its own code and
Google's sign-in script, so anything else injected into the page is refused.

---

## How to prove it to yourself in about a minute

1. Open the app, then open your browser's developer tools (F12) on the
   **Network** tab.
2. Make a recording, play it back and download it.
3. Watch the list. Your recording is never in it.

---

## If you find this page is wrong

Please tell us. Open an issue on
[the repository](https://github.com/universal-simulation-ltd/Universal_Recorder/issues),
or email inbox@unisim.co.uk.
