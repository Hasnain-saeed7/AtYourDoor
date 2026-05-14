'use client'

import { signOut } from 'next-auth/react'

type SignOutButtonProps = {
  className?: string
}

export default function SignOutButton({ className }: SignOutButtonProps) {
  const baseClasses =
    'text-gray-500 hover:text-gray-900 text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-100 transition-all'

  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className={className ? `${baseClasses} ${className}` : baseClasses}
    >
      Sign Out
    </button>
  )
}








