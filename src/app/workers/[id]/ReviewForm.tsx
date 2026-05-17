'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'

export default function ReviewForm({
  workerId,
  bookingId,
}: {
  workerId: string
  bookingId: string
}) {
  const router = useRouter()
  const { t } = useLanguage()
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workerId,
        bookingId,
        comment: comment.trim() || null,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || t('couldNotSubmitReview'))
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    router.refresh()
  }

  if (success) {
    return (
      <div className="rounded-xl border border-teal-100 bg-teal-50 px-4 py-3">
        <p className="text-teal-700 text-sm font-semibold">{t('thanksForYourReview')}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
        <p className="text-sm font-semibold text-gray-900">{t('ratingIsAssignedAutomatically')}</p>
        <p className="text-xs text-gray-500 mt-1">{t('workerRatingsAreBasedOnCompletedJobsAndRank')}</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('commentOptional')}</label>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 placeholder-gray-400 text-sm resize-none"
          placeholder={t('shareYourExperienceWithThisWorker')}
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
      >
        {loading ? t('submitting') : t('submitReview')}
      </button>
    </form>
  )
}
