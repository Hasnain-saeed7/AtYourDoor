'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, Language, TranslationKey } from '@/lib/translations'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  isRTL: boolean
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
  isRTL: false,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    const saved = localStorage.getItem('trusthire-language') as Language
    if (saved === 'en' || saved === 'ur') setLanguageState(saved)
  }, [])

  useEffect(() => {
    document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr'
    document.documentElement.lang = language
    if (language === 'ur') {
      document.documentElement.style.fontFamily = "'Noto Nastaliq Urdu', serif"
    } else {
      document.documentElement.style.fontFamily = ''
    }
  }, [language])

  function setLanguage(lang: Language) {
    setLanguageState(lang)
    localStorage.setItem('trusthire-language', lang)
  }

  function t(key: string): string {
    return (translations[language] as any)[key] || (translations['en'] as any)[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL: language === 'ur' }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
