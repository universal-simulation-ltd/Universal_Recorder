// GENERATED FILE — do not edit by hand.
// Source: backoffice/universal-platform/scripts/app-marks/marks.mjs
// Regenerate: node scripts/app-marks/build.mjs (from backoffice/universal-platform)
// Mark: Universal Recorder — A microphone in its cradle.
// Hover: It picks up — level arcs open either side of the capsule.
//
// Icon-only by design: the SDK's UniversalAppsNavBar renders the product name
// from its catalogue beside this slot, so a wordmark here would print it twice.

const CSS = `
  /* Resting states */
  .uam-recorder-level { opacity: 0; transform: translateX(6px); transition: opacity .4s ease, transform .45s cubic-bezier(0.16,1,0.3,1); }
  .uam-recorder-level2 { opacity: 0; transform: translateX(-6px); transition: opacity .4s ease .06s, transform .45s cubic-bezier(0.16,1,0.3,1) .06s; }

  /* Active states */
  .uam-host-recorder:hover .uam-recorder-level,
  .uam-host-recorder:focus-visible .uam-recorder-level { opacity: 1; transform: translateX(0); }
  .uam-host-recorder:hover .uam-recorder-level2,
  .uam-host-recorder:focus-visible .uam-recorder-level2 { opacity: 1; transform: translateX(0); }

  @media (prefers-reduced-motion: reduce) {
    .uam-recorder-level,
    .uam-recorder-level2 { transition: none !important; }
  }
`

export default function ProductLogo() {
  return (
    <span
      className="uam-host-recorder inline-flex h-6 w-6 shrink-0 items-center justify-center"
      aria-hidden="true"
    >
      <style>{CSS}</style>
      <svg viewBox="0 0 64 64" className="h-6 w-6" aria-hidden="true">
        <rect x="0" y="0" width="64" height="64" rx="14" fill="#0f172a" />
        <rect x={25} y={11} width={14} height={26} rx={7} fill="none" strokeWidth={4.4} stroke="#fe8c01" />
        <path d="M18 28a14 14 0 0 0 28 0" fill="none" strokeWidth={4.4} strokeLinecap="round" stroke="#fe8c01" className="uam-recorder-cradle" />
        <path d="M32 43V51" strokeWidth={4.4} strokeLinecap="round" stroke="#fe8c01" fill="none" />
        <path d="M23 51h18" strokeWidth={4.4} strokeLinecap="round" stroke="#ff9a1f" fill="none" />
        <path d="M11 22a22 22 0 0 0 0 20" fill="none" strokeWidth={3.4} strokeLinecap="round" stroke="#ff9a1f" className="uam-recorder-level" />
        <path d="M53 22a22 22 0 0 1 0 20" fill="none" strokeWidth={3.4} strokeLinecap="round" stroke="#ff9a1f" className="uam-recorder-level2" />
      </svg>
    </span>
  )
}
