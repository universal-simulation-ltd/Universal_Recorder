// Cloud-recording object paths — the "object not found" regression.
//
//   npm run test:hosted-paths
//
// Runs under Node's type-stripping, so `hostedPaths.ts` is imported directly.
// ⚠️ That is why that module imports NOTHING: type-stripping cannot resolve the
// SDK or the React hooks, and any import of theirs would take this red for a
// reason unrelated to paths.
//
// What is being pinned. `hosted_uploads` grants members SELECT and no UPDATE
// (migration 0041), so the old store flow's third step — reserve with
// `storage_path: 'pending'`, upload, then UPDATE the row with the real path —
// matched zero rows and reported success. Every cloud recording's ledger row
// therefore said `pending`, and pressing Play asked storage for an object of
// that name.
//
// The bytes were never lost: the uploader's path was fully determined by the
// row's own `org_id`, `id` and `file_name`. These tests hold that
// reconstruction exact — it is the only thing standing between a user and the
// recordings already filed that way — and hold the new flow to naming the
// object before the token is reserved, so no such row is ever written again.
//
// `safeStem` is pinned here twice over: it names new objects AND it is how
// `useCloud.isStored` matches a cloud row back to the on-device recording, so a
// drift would break the ✓ marker as well as the legacy recovery.
//
// Negative control (2026-08-27, run): reverting
// `hostedRecordingPathCandidates` to `[upload.storage_path]` turns 3 of these
// red — both legacy-recovery cases and the recorded-path-first ordering. If a
// future edit makes them all pass trivially, check that first.

import {
  hostedRecordingPath,
  hostedRecordingPathCandidates,
  isUsableStoragePath,
  newObjectId,
  safeStem,
  FALLBACK_FILE_NAME,
  PENDING_PATH,
} from '../src/lib/hostedPaths.ts'

let pass = 0
let fail = 0
const eq = (actual, expected, label) => {
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  if (a === e) {
    pass++
    console.log(`  ok   ${label}  -> ${a}`)
  } else {
    fail++
    console.log(`  FAIL ${label}\n       expected ${e}\n       actual   ${a}`)
  }
}

const ORG = '11111111-1111-4111-8111-111111111111'
const UPLOAD = '22222222-2222-4222-8222-222222222222'

console.log('safeStem (must not drift — legacy paths AND the ✓ marker use it):')
eq(safeStem('Recording 27/08/2026, 14:03'), 'recording-27-08-2026-14-03', 'a locale date name slugs cleanly')
eq(safeStem('!!!'), 'recording', 'a name with nothing usable falls back')
eq(safeStem('-edges-'), 'edges', 'edge hyphens trimmed')
eq(safeStem('x'.repeat(80)).length, 60, 'capped at 60 characters, as it always was')

console.log('\nhostedRecordingPath (org id first — every storage policy reads segment 1):')
eq(
  hostedRecordingPath(ORG, UPLOAD, 'standup-notes.webm'),
  `${ORG}/recorder/${UPLOAD}-standup-notes.webm`,
  'org / product / id-filename',
)
eq(
  hostedRecordingPath(ORG, UPLOAD, null),
  `${ORG}/recorder/${UPLOAD}-${FALLBACK_FILE_NAME}`,
  'a nameless upload still gets a deterministic path',
)
eq(hostedRecordingPath(ORG, UPLOAD, '  ').startsWith(`${ORG}/`), true, 'always rooted at the org')

console.log('\nisUsableStoragePath (what may be handed to storage as-is):')
eq(isUsableStoragePath(`${ORG}/recorder/x-standup.webm`, ORG), true, 'a real path')
eq(isUsableStoragePath(PENDING_PATH, ORG), false, "the 'pending' placeholder is not a path")
eq(isUsableStoragePath('', ORG), false, 'empty')
eq(isUsableStoragePath(null, ORG), false, 'null')
eq(
  isUsableStoragePath(`${UPLOAD}/recorder/x-standup.webm`, ORG),
  false,
  "another org's prefix would fail the bucket's read policy anyway",
)

console.log('\nhostedRecordingPathCandidates (the actual repair):')
eq(
  hostedRecordingPathCandidates({ id: UPLOAD, org_id: ORG, storage_path: `${ORG}/recorder/${UPLOAD}-standup.webm`, file_name: 'standup.webm' }),
  [`${ORG}/recorder/${UPLOAD}-standup.webm`],
  'a healthy row yields exactly one candidate (no pointless second round trip)',
)
eq(
  hostedRecordingPathCandidates({ id: UPLOAD, org_id: ORG, storage_path: PENDING_PATH, file_name: 'standup-notes.mp4' }),
  [`${ORG}/recorder/${UPLOAD}-standup-notes.mp4`],
  "a 'pending' row rebuilds the path the uploader really used",
)
eq(
  hostedRecordingPathCandidates({ id: UPLOAD, org_id: ORG, storage_path: null, file_name: null }),
  [`${ORG}/recorder/${UPLOAD}-${FALLBACK_FILE_NAME}`],
  'a nameless pending row still resolves',
)
eq(
  hostedRecordingPathCandidates({ id: UPLOAD, org_id: ORG, storage_path: `${ORG}/recorder/moved-elsewhere.webm`, file_name: 'standup.webm' }),
  [`${ORG}/recorder/moved-elsewhere.webm`, `${ORG}/recorder/${UPLOAD}-standup.webm`],
  'a recorded path is tried FIRST, with the legacy guess as the fallback',
)
eq(
  hostedRecordingPathCandidates({ id: UPLOAD, org_id: ORG, storage_path: `${ORG}/recorder/${UPLOAD}-standup.webm`, file_name: 'standup.webm' }).length,
  1,
  'the two never duplicate when they agree',
)

console.log('\nnewObjectId:')
const idA = newObjectId()
const idB = newObjectId()
eq(typeof idA === 'string' && idA.length >= 16, true, 'long enough to be unique')
eq(idA === idB, false, 'two calls differ')
eq(/^[a-z0-9-]+$/.test(idA), true, 'safe in an object name')

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
