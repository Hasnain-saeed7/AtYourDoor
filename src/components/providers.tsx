'use client'

import { SessionProvider } from 'next-auth/react'
import SessionExpiryOnClose from './SessionExpiryOnClose'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionExpiryOnClose />
      {children}
    </SessionProvider>
  )
}