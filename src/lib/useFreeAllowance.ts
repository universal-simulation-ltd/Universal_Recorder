import { useCallback, useEffect, useState } from 'react'
import { useUniversal } from '@unisim/sdk'

// How much of the free allowance the caller's workspace has used, from
// `free_allowance_status` (platform migration 0199). Recorder draws on the
// shared "files" pool — the same 250 MB that Universal PDF, Images and Exports
// use — so the numbers here are the pool's, not Recorder's alone.
//
// Read-only and purely informational: gating still goes through
// `useAppFreeToken`, whose 'held' flag the platform keeps in step with this.
// Any failure (signed out, no workspace, offline, older platform) leaves
// `status` null and the app says nothing.

export interface FreeAllowanceStatus {
  ok: boolean
  app: string
  budget: string
  unlimited: boolean
  used: number
  limit: number | null
  bytes_used: number
  bytes_limit: number | null
  month_used: number
  month_limit: number | null
  has_room: boolean
}

export function useFreeAllowance(app: string) {
  const { supabase, session, activeOrgId } = useUniversal()
  const signedIn = !!session?.user && session.user.is_anonymous !== true
  const [status, setStatus] = useState<FreeAllowanceStatus | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!signedIn) {
      setStatus(null)
      return
    }
    let cancelled = false
    Promise.resolve(supabase.rpc('free_allowance_status', { p_app: app }))
      .then(({ data, error }) => {
        if (cancelled) return
        const s = data as FreeAllowanceStatus | null
        setStatus(!error && s && s.ok ? s : null)
      })
      .catch(() => {
        if (!cancelled) setStatus(null)
      })
    return () => {
      cancelled = true
    }
  }, [supabase, signedIn, activeOrgId, app, tick])

  const refresh = useCallback(() => setTick(t => t + 1), [])
  return { status, refresh }
}

/** Bytes → whole megabytes (1 MB = 1,048,576 bytes), for the usage line. */
export function toMB(bytes: number): number {
  return Math.round(bytes / 1_048_576)
}
