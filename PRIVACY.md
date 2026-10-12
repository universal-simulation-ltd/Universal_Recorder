# What Universal Recorder does with your recordings

This page is written to be checked: every claim below names the file in this
repository that makes it true, and you are welcome to go and read it.

The short version: **your recording is captured, encoded and kept by your own
browser.** It is not uploaded to us, and there is no copy of it on our servers
unless you pressed **Save to cloud** on it.

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

## The one way a recording *can* leave: Save to cloud

**Save to cloud** keeps one recording online so you can play it or download it
on another device. It needs a free Universal ID, and it only ever happens when
you press the button on a recording.

- **What is uploaded:** that recording's file, nothing else. No preview, no
  screen still, no webcam frame. We also store a row that names the file, its
  size and the account that saved it, so the **In the cloud** panel can list it.
- **Where it goes:** a private bucket in Cloudflare R2, held in the EU, or (for
  older saves) a private bucket in our Supabase storage. Each saved recording
  remembers which.
- **Who can see it:** only you. If your workspace has other people in it, each
  cloud recording has a **Share with** tick box, unticked to start with.
  Ticking it lets the people in that workspace play and download it (never
  delete it). Unticking it makes it private again. The rule is enforced by the
  database and the storage, not only by the app.
- **How big:** up to 50 MB per recording. Larger recordings can only be
  downloaded.
- **Deleting it:** deleting the cloud copy removes the file and its row, and
  gives you back the token it used.
- The code: [`src/lib/hostedRecordings.ts`](src/lib/hostedRecordings.ts) and
  [`src/components/CloudRecordings.tsx`](src/components/CloudRecordings.tsx).

⚠️ **The cloud copy is ordinary cloud storage, not end-to-end encryption.** It
is encrypted in transit and at rest, and access is limited as described above,
but we hold the keys. So this is a promise about our conduct, not a
mathematical guarantee.

---

## What the app talks to a server for, even when your recording doesn't

If you open your browser's Network tab you will see some requests. Here is
what they are:

- **Signing in.** Only if you choose to. A Universal ID gets you the suite's
  shared account and settings, and Save to cloud. You can delete it from
  inside the app: **Delete my account** at the foot of Global Tuning, in the
  profile menu. That deletes it in every UNI·SIM app, not only this one.
- **"You opened the app".** When you are signed in, the app records one event
  saying the app was opened, so your account's activity page is accurate. It
  says nothing about what you recorded. See `UsageTracker` in `@unisim/sdk`,
  mounted in [`src/main.tsx`](src/main.tsx).
- **An anonymous daily open count.** Once a day, the first time you open the
  app (after your first click or key press), it adds one to that day's total
  for this app. It sends the app's name and the kind of platform ("web") and
  nothing else: no identifier, no account even if you are signed in, and
  nothing about what you are recording. A "counted today" mark stays in your
  browser and is never sent. The totals identify nobody and are kept
  indefinitely. See `countDailyOpen` in `presence.ts` in `@unisim/sdk`
  (Recorder is a website only and leaves `openCount` at its default, on). This
  replaced the old "this app is in use" signal, a random install ID sent every
  45 seconds, which `@unisim/sdk` 0.187.0 retired: no install ID is sent or
  kept any more.
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
