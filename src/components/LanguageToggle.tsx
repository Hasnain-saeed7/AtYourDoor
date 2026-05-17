'use client'

import { useLanguage } from '@/context/LanguageContext'

export default function LanguageToggle({ dark = false }: { dark?: boolean }) {
  const { language, setLanguage } = useLanguage()

  return (
    <div className={`flex items-center gap-1 rounded-xl p-1 ${dark ? 'bg-white/10' : 'bg-gray-100'}`}>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
          language === 'en'
            ? 'bg-green-600 text-white shadow-sm'
            : dark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('ur')}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
          language === 'ur'
            ? 'bg-green-600 text-white shadow-sm'
            : dark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
        }`}
        style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}
      >
        اردو
      </button>
    </div>
  )
}
