// 'use client'

// import { signOut } from 'next-auth/react'

// export default function SignOutButton() {
//   return (
//     <button
//       onClick={() => signOut({ callbackUrl: '/' })}
//       className="text-gray-500 hover:text-gray-900 text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-100 transition-all"
//     >
//       Sign Out
//     </button>
//   )
// }









'use client'

import { signOut } from 'next-auth/react'

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium px-3 py-2 rounded-xl hover:bg-white/10 transition-all"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      <span className="hidden sm:block">Sign Out</span>
    </button>
  )
}