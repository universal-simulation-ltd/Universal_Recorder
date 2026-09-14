import { AdvancedMenu, MENU } from '@unisim/sdk'
// Generated — `npm run credits` after any dependency change. Never edit it by
// hand: it is read off the installed tree, so a hand-kept list drifts from the
// lockfile the first time anyone upgrades anything, and a credits list naming a
// package we removed is worse than no list at all.
import credits from '../../generated/credits.json'
import { useThemeStore, type ThemePref } from '../../stores/themeStore'

// The per-app rows that slot into <UniversalAppsNavBar />'s `actions` prop —
// ROWS ONLY, no trigger and no panel of its own. The SDK renders them inside
// the merged profile pill, so the bar carries one dropdown on the right.
//
// Styling is inline rather than Tailwind to match the SDK dropdown's own rows
// (the same 8px/14px rhythm and 13px label the profile and language rows use).
//
// ⚠️ THE COLOURS COME FROM THE SDK'S `MENU` PALETTE, NOT FROM LITERALS. The SDK
// paints the dropdown itself dark when the bar's `theme` is dark, but it cannot
// reach these rows — they are ours. A hardcoded light grey here would be
// unreadable on the dark panel, so every colour is read off `MENU[theme]`, the
// same table the panel uses, and the two can never disagree.

const THEMES: { pref: ThemePref; label: string; glyph: string }[] = [
  { pref: 'light', label: 'Light', glyph: '☀️' },
  { pref: 'dark', label: 'Dark', glyph: '🌙' },
  // 'system' is offered but is deliberately NOT the default — see themeStore.
  { pref: 'system', label: 'Match my device', glyph: '🖥️' },
]

export default function AppMenu({ theme }: { theme: 'light' | 'dark' }) {
  const pref = useThemeStore((s) => s.pref)
  const setPref = useThemeStore((s) => s.setPref)
  const m = MENU[theme]

  return (
    <>
      <div
        style={{
          padding: '8px 14px 4px',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: m.faint,
        }}
      >
        Appearance
      </div>
      {/* Choosing a theme leaves the menu open on purpose: the change is the
          feedback, and the panel repaints with it. */}
      {THEMES.map((t) => {
        const selected = pref === t.pref
        const rest = { bg: selected ? m.accentBg : 'transparent', fg: selected ? m.accentText : m.body }
        return (
          <button
            key={t.pref}
            type="button"
            role="menuitemradio"
            aria-checked={selected}
            onClick={() => setPref(t.pref)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: '8px 14px',
              fontSize: 13,
              fontFamily: 'inherit',
              textAlign: 'left',
              border: 0,
              background: rest.bg,
              color: rest.fg,
              cursor: 'pointer',
              transition: 'background 120ms, color 120ms',
            }}
            onMouseEnter={(e) => {
              if (selected) return
              e.currentTarget.style.background = m.rowHover
              e.currentTarget.style.color = m.rowHoverText
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = rest.bg
              e.currentTarget.style.color = rest.fg
            }}
          >
            <span aria-hidden>{t.glyph}</span>
            <span style={{ flex: 1, minWidth: 0, fontWeight: 500, lineHeight: 1.3 }}>{t.label}</span>
            {selected && <span aria-hidden style={{ color: m.accentText }}>✓</span>}
          </button>
        )
      })}
      <div role="separator" style={{ height: 1, margin: '4px 0', background: m.divider }} />

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
