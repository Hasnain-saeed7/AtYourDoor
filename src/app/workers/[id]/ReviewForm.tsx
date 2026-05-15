'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ReviewForm({
  workerId,
  bookingId,
}: {
  workerId: string
  bookingId: string
}) {
  const router = useRouter()
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
      setError(data.error || 'Could not submit review')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    router.refresh()
  }

  if (success) {
    return (
      <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3">
        <p className="text-green-700 text-sm font-semibold">Thanks for your review!</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
        <p className="text-sm font-semibold text-gray-900">Rating is assigned automatically</p>
        <p className="text-xs text-gray-500 mt-1">
          Worker ratings are based on completed jobs and rank.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Comment (optional)
        </label>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-400 text-sm resize-none"
          placeholder="Share your experience with this worker"
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
        className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}
