"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'

export default function DeleteHistoryButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { t } = useLanguage()

  async function handleDelete() {
    try {
      setLoading(true)
      const res = await fetch('/api/bookings/delete-history', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || 'Failed')
      }
      router.refresh()
    } catch (err) {
      alert(String(err) || t('couldNotDeleteHistory') || 'Could not delete history')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-sm text-red-600 hover:underline"
    >
      {loading ? t('deleting') : t('deleteHistory')}
    </button>
  )
}
