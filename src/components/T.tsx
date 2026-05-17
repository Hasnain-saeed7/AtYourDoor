'use client'

import { useLanguage } from '@/context/LanguageContext'

export default function T({ k, className }: { k: string; className?: string }) {
  const { t } = useLanguage()
  return <span className={className}>{t(k as any)}</span>
}
