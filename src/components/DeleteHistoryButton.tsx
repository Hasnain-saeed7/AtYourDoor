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
      className="text-sm text-red-600 hover:underline flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <span>{t('deleting')}...</span>
        </>
      ) : (
        t('deleteHistory')
      )}
    </button>
  )
}
