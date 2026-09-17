import { AdvancedMenu } from '@unisim/sdk'
// Generated — `npm run credits` after any dependency change. Never edit it by
// hand: it is read off the installed tree, so a hand-kept list drifts from the
// lockfile the first time anyone upgrades anything, and a credits list naming a
// package we removed is worse than no list at all.
import credits from '../../generated/credits.json'

// The per-app rows that slot into <UniversalAppsNavBar />'s `actions` prop —
// ROWS ONLY, no trigger and no panel of its own. The SDK renders them inside
// the merged profile pill, so the bar carries one dropdown on the right.
//
// Styling is inline rather than Tailwind to match the SDK dropdown's own rows
// (the same 8px/14px rhythm and 13px label the profile and language rows use).
//
// ⚠️ ANY ROW ADDED HERE TAKES ITS COLOURS FROM THE SDK'S `MENU` PALETTE, NOT
// FROM LITERALS. The SDK paints the dropdown itself dark when the bar's `theme`
// is dark, but it cannot reach these rows — they are ours. A hardcoded light
// grey here would be unreadable on the dark panel, so read every colour off
// `MENU[theme]`, the same table the panel uses, and the two can never disagree.
//
// There is no Appearance section here any more. Since SDK 0.143 the colour
// scheme is a Global preference with a per-app override in the SDK's own App
// preferences dialog (App.tsx passes `themeStore`), so a second copy of the
// control here would only be a second place to disagree with it. What is left
// is the SDK's Advanced category.

export default function AppMenu({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <>
      {/* Advanced — the SDK's own category, so every app in the suite has one in
          the same place, and whatever goes in it next is one change rather than
          nineteen. "About this app" is always its last row. `theme` is required
          here too: its rows are inline-styled and cannot see the `.dark` class. */}
      <AdvancedMenu
        theme={theme}
        about={{
          repo:    'https://github.com/universal-simulation-ltd/Universal_Recorder',
          subject: 'Your recording',
          except:  'saving it to your account',
          headline: 'Other recorders upload your recording to their servers to process it.',
          version: __APP_VERSION__,
          credits,
          noticesHref: 'https://github.com/universal-simulation-ltd/Universal_Recorder/blob/main/THIRD-PARTY-NOTICES.md',
        }}
      />
    </>
  )
}
