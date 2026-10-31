import React from 'react'
import ReactDOM from 'react-dom/client'
import { UniversalProvider } from '@unisim/sdk'
import type { UniversalConfig } from '@unisim/sdk'
import App from './App'
import './index.css'

console.log(`build: ${import.meta.env.VITE_BUILD_SHA}`)

// Universal Recorder captures and encodes audio entirely client-side, and the
// on-device library (IndexedDB) is the only home for a finished recording —
// that and downloading it. We still mount <UniversalProvider> so the shared
// navbar works.
//
// No account of its own (James, 2026-10-20: no logins in first iterations unless
// they improve the experience; Docs_UNI_SIM/login-free-plan.md). Signing in only
// ever unlocked "Save to cloud" (one recording in the shared `hosted-uploads`
// bucket, optionally shared with a company); prod held no Recorder cloud
// recordings when it was removed, so nothing was stranded. `noAccounts: true`
// drops the account rows; since SDK 0.211.0 it no longer keeps the app signed
// out: a suite session the browser already holds is read and followed (Global
// Tuning comes with it) and Tune this app offers a discreet Sign in. With it
// the SDK's anonymous open count is off too (SDK 0.187), as in Video,
// Charts, Beam and the rest. <UsageTracker> went with it — it only ever
// recorded signed-in visits.
//
// The fallback is the REAL public suite project (publishable anon key — safe to
// ship; RLS is the security boundary). Env vars override it for other builds.
const universalConfig: UniversalConfig = {
  supabaseUrl: import.meta.env.VITE_PLATFORM_SUPABASE_URL || 'https://rygfxgalojojppxmhddo.supabase.co',
  supabaseAnonKey: import.meta.env.VITE_PLATFORM_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5Z2Z4Z2Fsb2pvanBweG1oZGRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NTY4MjUsImV4cCI6MjA5NDMzMjgyNX0.hLy_vt9vY_rdPKF3nL32yAuMCD604E3CH5VM7D7CaNE',
  product: 'recorder',
  cookieDomain: import.meta.env.PROD ? '.unisim.co.uk' : undefined,
  noAccounts: true,
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UniversalProvider config={universalConfig}>
      <App />
    </UniversalProvider>
  </React.StrictMode>
)
