'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BookingForm({
  workerId,
  categoryId,
  workerName,
}: {
  workerId: string
  categoryId: string
  workerName: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workerId,
        categoryId,
        description: formData.get('description'),
        address: formData.get('address'),
        city: formData.get('city'),
        scheduledAt: formData.get('scheduledAt'),
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Something went wrong')
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  if (success) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-bold text-gray-900 mb-1">Booking Confirmed!</h3>
        <p className="text-gray-500 text-sm">Redirecting to your dashboard...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Describe your problem
        </label>
        <textarea
          name="description"
          required
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-400 text-sm resize-none"
          placeholder="e.g. Kitchen tap is leaking badly..."
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Your Address
        </label>
        <input
          name="address"
          type="text"
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-400 text-sm"
          placeholder="House no, street, area"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          City
        </label>
        <input
          name="city"
          type="text"
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-400 text-sm"
          placeholder="Karachi"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Preferred Date & Time
        </label>
        <input
          name="scheduledAt"
          type="datetime-local"
          required
          min={new Date().toISOString().slice(0, 16)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 text-sm"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-green-100 hover:-translate-y-0.5"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Booking...
          </span>
        ) : `Book ${workerName.split(' ')[0]}`}
      </button>

      <p className="text-xs text-gray-400 text-center">
        You will only be charged after the job is completed
      </p>
    </form>
  )
}