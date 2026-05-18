'use client'

import { getSession, signOut } from 'next-auth/react'
import { useEffect } from 'react'

const TAB_MARKER_KEY = 'trusthire.tab-alive'
const SIGNOUT_GUARD_KEY = 'trusthire.signout-attempted'
const CHANNEL_NAME = 'trusthire.auth-tab'

export default function SessionExpiryOnClose() {
  useEffect(() => {
    let channel: BroadcastChannel | null = null
    let otherTabDetected = false
    const pingId = `${Date.now()}-${Math.random().toString(16).slice(2)}`

    const isFreshTab = sessionStorage.getItem(TAB_MARKER_KEY) !== '1'
    sessionStorage.setItem(TAB_MARKER_KEY, '1')

    const alreadyTriedSignOut = sessionStorage.getItem(SIGNOUT_GUARD_KEY) === '1'

    const detectOtherTabs = async () => {
      if (typeof BroadcastChannel === 'undefined') return false

      channel = new BroadcastChannel(CHANNEL_NAME)

      channel.onmessage = (event) => {
        const data = event.data
        if (!data || typeof data !== 'object') return

        if (data.type === 'ping') {
          channel?.postMessage({ type: 'pong', pingId: data.pingId })
        }

        if (data.type === 'pong' && data.pingId === pingId) {
          otherTabDetected = true
        }
      }

      // Ask any existing tabs to identify themselves.
      channel.postMessage({ type: 'ping', pingId })

      await new Promise((resolve) => setTimeout(resolve, 150))
      return otherTabDetected
    }

    const run = async () => {
      try {
        const hasOtherTabs = await detectOtherTabs()
        if (hasOtherTabs) return
        if (!isFreshTab) return
        if (alreadyTriedSignOut) return

        const session = await getSession()
        if (!session) return

        // Best-effort: clear the NextAuth session if the browser/tab was reopened.
        sessionStorage.setItem(SIGNOUT_GUARD_KEY, '1')
        await signOut({ redirect: false })
        window.location.reload()
      } catch {
        // Best-effort; ignore failures (offline, blocked requests, etc.)
      } finally {
        channel?.close()
      }
    }

    void run()

    return () => {
      channel?.close()
    }
  }, [])

  return null
}
