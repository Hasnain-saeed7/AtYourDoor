// 'use client'

// import { signOut } from 'next-auth/react'

// type SignOutButtonProps = {
//   className?: string
// }

// export default function SignOutButton({ className }: SignOutButtonProps) {
//   const baseClasses =
//     'text-gray-500 hover:text-gray-900 text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-100 transition-all'

//   return (
//     <button
//       onClick={() => signOut({ callbackUrl: '/' })}
//       className={className ? `${baseClasses} ${className}` : baseClasses}
//     >
//       Sign Out
//     </button>
//   )
// }



'use client'

import { signOut } from 'next-auth/react'
import { useLanguage } from '@/context/LanguageContext'
import { LogOut } from 'lucide-react'

export default function SignOutButton() {
  const { t } = useLanguage()

  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="flex items-center gap-2  texy-black hover:text-gray-900 text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-100 transition-all"
    >
      <LogOut className="w-4 h-4" />
      <span className="hidden sm:block">{t('signOut')}</span>
    </button>
  )
}




