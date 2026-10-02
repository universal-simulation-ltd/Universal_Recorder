import type { Article } from './types'

const articles: Article[] = [
  {
    id: 'how-digital-audio-works',
    title: 'How digital audio works',
    summary: 'Sample rate, bit depth and channels, in plain English.',
    group: 'The basics',
    body: `Sound is a wave of changing air pressure. A microphone turns that wave into a changing electrical signal, and your device turns the signal into numbers so that it can be stored.

## Sample rate

To do that, the device measures the signal many thousands of times a second. Each measurement is called a sample, and the number taken each second is the sample rate, measured in hertz (Hz) or kilohertz (kHz).

- 44.1 kHz, or 44,100 samples a second, is the rate used on audio CDs.
- 48 kHz is the usual rate for video and for most computer audio hardware.

A sample rate can capture sounds up to about half its own value. Human hearing tops out at around 20 kHz, which is why rates in the 40s are enough for listening.

## Bit depth

Each sample is stored as a number, and the bit depth decides how precise that number can be. 16-bit audio, as used on CDs, allows 65,536 different levels for each sample. More bits give a lower background hiss and more room between the quietest and loudest sounds, which matters more in a studio than for a voice note.

## Channels

Mono has one channel and stereo has two. A stereo recording holds twice as much data as a mono one of the same length.

## Why this matters for file size

Uncompressed audio adds up quickly. One minute of stereo at 48 kHz and 16-bit comes to about 11.5 MB. That is why most formats compress audio, which the next article explains.

In Universal Recorder, a WAV download keeps the sample rate your recording was decoded at, which is set by your device's audio hardware and is usually 48 kHz, and stores it at 16-bit.`,
  },
  {
    id: 'audio-formats',
    title: 'Audio and video formats explained',
    summary: 'WebM, MP3, WAV and MP4, and which one to choose.',
    group: 'The basics',
    body: `Universal Recorder can give you a recording in several formats. They differ in size, in quality and in how widely they play.

## Compressed and uncompressed

Uncompressed audio keeps every sample exactly as it is, which makes it large. Compressed formats use a codec to leave out detail that is hard to hear, which makes files many times smaller. This is called lossy compression: once detail has been left out, it cannot be put back.

## The formats

- **WebM** is what most browsers record audio to directly, using a codec called Opus. It is the smallest of the three. Opus sounds very good at low bitrates, especially for speech. Modern browsers and many media players play it, though some older software does not.
- **MP3** is the most widely supported audio format there is. Almost every device, car stereo and editing program will play it. The app makes it at 128 kbps, a good everyday quality, though larger than WebM for the same sound.
- **WAV** is uncompressed 16-bit audio. It is by far the largest, but it opens in virtually any audio editor, so it is the one to choose if you plan to edit the recording.

## Where MP3 and WAV come from

Your browser records directly in one format only. When you download as MP3 or WAV, the app decodes the original recording and encodes it again, on your device, at the moment you download it.

Two things follow from that:
- Converting to WAV does not add quality that the original recording did not have. It makes the recording easier to edit, not better.
- MP3 is a second round of lossy compression on top of the first. For most voice recordings you will not hear it, but the original is always the most faithful copy.

## Screen and webcam recordings

Recordings with video are saved as video files. Where the browser can do it, that is MP4 with H.264 video and AAC sound, which plays in most video players and presentation software. Where it cannot, the recording is WebM. MP3 and WAV are offered only for recordings without video.`,
  },
  {
    id: 'permissions',
    title: 'Microphone, camera and screen permissions',
    summary: 'Why your browser asks, and what to do if you said no.',
    group: 'How it works',
    body: `A website cannot use your microphone, camera or screen until you allow it. Your browser asks you the first time Universal Recorder needs each one, and it shows an indicator while they are in use.

## What is asked for, and when

- **Microphone**: when you start a recording that includes the microphone.
- **Camera**: when you preview or start a recording that includes the webcam.
- **Screen**: whenever you preview or record your screen or system audio, the browser shows its own picker so that you can choose a whole screen, a window or a single tab. The app cannot make that choice for you.

Until you have allowed the microphone or camera, the lists of devices may show generic names. Browsers only reveal the real names of your devices to sites you have given permission to.

## Recording system audio

System audio is the sound your computer is playing, such as a call or a video. In Chrome and Edge it comes through the screen-sharing picker: tick the option to share audio before you confirm. Firefox and Safari do not offer sound in their screen picker, so they can record your microphone but not your system audio. If you ask for system audio alone, the browser still shows the screen picker, because that is the only way it offers the sound, but the app does not keep the picture.

On phones and tablets, browsers do not offer screen or system audio capture, so the microphone is what can be recorded there.

## If you said no

If you blocked a permission, the browser remembers that choice and the app cannot ask again. To change it, open the site settings in your browser, usually from the icon to the left of the web address, allow the microphone or camera for this site, and then reload the page.

On a computer, the operating system may also need to allow your browser to use them:
- **macOS**: open System Settings, then Privacy & Security, then Microphone, Camera or Screen Recording, and turn your browser on.
- **Windows**: open Settings, then Privacy & security, then Microphone or Camera, and make sure desktop apps are allowed access.`,
  },
  {
    id: 'how-recording-works',
    title: 'How recording works',
    summary: 'What happens between pressing record and having a file.',
    group: 'How it works',
    body: `Everything in Universal Recorder happens inside your browser, on your device.

## Choosing what to record

You can record any mix of four sources: your microphone, your system audio, your screen and your webcam. When you record more than one sound source, they are mixed into a single soundtrack.

When you record your screen and webcam together, the camera is placed over the screen as a small picture-in-picture. You can choose its corner, size and shape, or drag it into place. With the webcam on its own, the camera fills the frame.

## While you record

Your browser's built-in recorder captures the sources and encodes them as it goes. You can pause and resume, keep an eye on a live level meter to check the microphone is picking you up, and see a preview of any video.

Keep the tab open until you press stop. The recording is built up inside the tab while it runs, so closing or reloading the page before you stop loses it.

## When you stop

The finished recording is saved in your browser's storage on this device. From there you can play it back, rename it, download it or delete it. It is not in your downloads folder until you download it.

Downloading as WebM, or as MP4 for a video recording, gives you the file exactly as it was recorded. Choosing MP3 or WAV converts it on your device at that moment.

## Tips for a better recording

- Choose the right microphone from the list before you start. A headset or a microphone close to your mouth usually sounds clearer than a laptop's built-in one.
- Record a few seconds and play them back before anything important.
- If you are recording your microphone and system audio together, wear headphones so that the microphone does not also pick up the sound from your speakers.
- Screen recordings grow quickly. Audio-only recordings stay small.`,
  },
  {
    id: 'where-recordings-are-kept',
    title: 'Where your recordings are kept',
    summary: 'In your browser, on this device, until you delete them.',
    group: 'Privacy and security',
    body: `When you stop recording, the recording is saved in your browser's own storage on this device, using a feature called IndexedDB. It is not uploaded anywhere.

## What that means

- **It belongs to this browser on this device.** A recording made in Chrome on your laptop will not appear in another browser, on your phone or on another computer.
- **It is not a file in your folders yet.** To get a copy you can send, edit or back up, use the download button and choose a format.
- **Clearing your browser data removes it.** If you clear the stored data for this site, or use a clean-up tool that does, your saved recordings go with it. Private or incognito windows usually discard their storage when you close them.
- **Browsers limit storage.** Each site is allowed a share of your free disk space, and long screen recordings can use a lot of it.

## Deleting

You can delete any recording from the list, or use **Delete all**, which asks you to confirm first. Because these recordings exist only on your device, a deleted recording cannot be recovered.

## Keeping a copy safe

Browser storage is convenient, but it is not a backup. For anything that matters, download it and keep the file somewhere safe. If you are signed in with a Universal ID, you can also keep a recording online, as the article on saving to the cloud explains.`,
  },
  {
    id: 'saving-to-the-cloud',
    title: 'Saving a recording to the cloud',
    summary: 'The one optional way a recording can leave your device.',
    group: 'Privacy and security',
    body: `Recording, converting and storing all happen on your device. There is exactly one way a recording can leave it: pressing **Save to cloud** on that recording. Nothing is uploaded unless you do.

## How it works

- You need to be signed in with a Universal ID. Creating one is free.
- Saving recordings to the cloud is free with a Universal ID. Free accounts have a generous limit — if you ever reach it, delete a cloud recording you no longer need. If you need more, tell us at unisim.co.uk/support.
- Each cloud save is limited to 50 MB. That is hours of audio but only a few minutes of screen video, so long video recordings stay download-only. The size is checked before the upload starts.
- If an upload fails, it does not count towards your limit.

## Who can reach it

The cloud copy is kept in private storage and has no public link. Only you can reach it, by signing in with the Universal ID you saved it with. If your Universal ID belongs to a company with other people in it, each cloud recording has a **Share with** tick box in the **In the cloud** panel. It starts unticked. Tick it and everyone in your company can play and download that recording, but only you can delete it. Untick it to make the recording private again. It travels to and from storage over an encrypted connection.

## Using it from another device

Once a recording is in the cloud, you can sign in on another device and play or download it from the **In the cloud** panel. It stays there until you delete it.

## What it is not

A cloud save is a copy of one recording, not a sync of your whole library. Your other recordings stay on the device where you made them. Deleting a recording from this device does not delete its cloud copy, and deleting the cloud copy does not delete the one on this device.`,
  },
  {
    id: 'what-leaves-your-device',
    title: 'What leaves your device',
    summary: 'Nothing you record, unless you choose to save it to the cloud.',
    group: 'Privacy and security',
    body: `Your microphone, camera and screen are captured, recorded and saved by your own browser. Unless you press **Save to cloud** on a recording, none of it is sent anywhere: no audio, no video, no preview and no screenshot.

The app does not transcribe or analyse your recordings, and it has no speech recognition.

## What the app does use the internet for

- **Loading the app**, and the notes on what has changed in each update.
- **Signing in with a Universal ID**, only if you choose to. You can record, convert and download without an account.
- **A note that the app was opened**, sent once per visit if you are signed in. It includes nothing about your recordings.
- **An “in use” signal**, sent every 45 seconds while the app is open and on screen, so the app can show how many people are using it. It holds the app's name, a random ID created on this device, and your account if you are signed in.
- **Cloud saves**, only when you ask for one, as described in the article on saving to the cloud.

## Converting formats

Turning a recording into MP3 or WAV happens on your device too. The conversion runs in the page, and nothing is uploaded to do it.

## Checking for yourself

Your browser shows an indicator whenever a site is using your microphone, camera or screen, and you can stop sharing from there at any time. If you want to be sure nothing is being sent, open your browser's developer tools, switch to the Network tab and make a recording. It never appears there.`,
  },
]

export default articles
