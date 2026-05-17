"use client"

import { useLanguage } from '@/context/LanguageContext'

export default function Counted({ k, count, className }: { k: string; count: number; className?: string }) {
  const { t } = useLanguage()
  const template = t(k as any)
  const text = template.replace('{count}', String(count))
  return <span className={className}>{text}</span>
}
