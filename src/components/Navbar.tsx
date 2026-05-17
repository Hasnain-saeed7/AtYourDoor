'use client'

import Link from 'next/link'
import SignOutButton from './signOutButton'
import LanguageToggle from './LanguageToggle'
import { useLanguage } from '@/context/LanguageContext'

export default function Navbar({ session, displayName }: { session: any; displayName: string }) {
  const { t } = useLanguage()

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <span className="text-gray-900 font-bold text-xl">{t('trusthire')}</span>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Link href="/workers" className="text-sm font-semibold px-4 py-2 rounded-full bg-amber-600 text-white shadow-sm hover:bg-emerald-700 transition-colors">
            {t('findWorkers')}
          </Link>
          <a href="#services" className="text-sm font-semibold px-4 py-2 rounded-full bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 transition-colors">{t('services')}</a>
          <a href="#how" className="text-sm font-semibold px-4 py-2 rounded-full bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100 transition-colors">{t('howItWorks')}</a>
          <a href="#workers" className="text-sm font-semibold px-4 py-2 rounded-full bg-teal-600 text-white border border-teal-100 hover:bg-teal-100 transition-colors">{t('forWorkers')}</a>
        </div>
        <div className="flex items-center gap-3">
          {session ? (
            <>
              <div className="flex items-center gap-2 bg-white/80 border border-gray-200 px-4 py-2 rounded-full text-sm font-semibold text-gray-700 shadow-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                {displayName}
              </div>
              <SignOutButton />
            </>
          ) : (
            <>
              <LanguageToggle />
              <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium px-4 py-2 transition-colors">{t('signIn')}</Link>
              <Link href="/register" className="bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-teal-100 hover:shadow-teal-200 hover:-translate-y-0.5">{t('getStarted')}</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
