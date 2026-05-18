'use client'

import { useLanguage } from '@/context/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="py-12 px-6 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">A</span>
          </div>
          <span className="text-black font-bold">{t('atYourDoor')}</span>
        </div>
        <p className="text-black text-md">© 2026 {t('atYourDoor')}. Built for Pakistan.</p>
        <div className="flex gap-6">
          <a href="#" className="text-black- hover:text-black">Privacy</a>
          <a href="#" className="text-black hover:text-black">Terms</a>
          <a href="#" className="text-black hover:text-black">Contact</a>
        </div>
      </div>
    </footer>
  )
}
