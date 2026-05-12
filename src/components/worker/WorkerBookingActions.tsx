'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function WorkerBookingActions({
  bookingId,
  status,
}: {
  bookingId: string
  status: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function updateStatus(newStatus: string) {
    setLoading(newStatus)
    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    setLoading(null)
    if (res.ok) router.refresh()
  }

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      {status === 'PENDING' && (
        <>
          <button
            onClick={() => updateStatus('ACCEPTED')}
            disabled={loading !== null}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
          >
            {loading === 'ACCEPTED' ? '...' : 'Accept'}
          </button>
          <button
            onClick={() => updateStatus('CANCELLED')}
            disabled={loading !== null}
            className="bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold px-4 py-2 rounded-xl border border-red-100 transition-all"
          >
            {loading === 'CANCELLED' ? '...' : 'Decline'}
          </button>
        </>
      )}
      {status === 'ACCEPTED' && (
        <button
          onClick={() => updateStatus('IN_PROGRESS')}
          disabled={loading !== null}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
        >
          {loading === 'IN_PROGRESS' ? '...' : 'Start Job'}
        </button>
      )}
      {status === 'IN_PROGRESS' && (
        <button
          onClick={() => updateStatus('COMPLETED')}
          disabled={loading !== null}
          className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
        >
          {loading === 'COMPLETED' ? '...' : 'Mark Complete'}
        </button>
      )}
    </div>
  )
}