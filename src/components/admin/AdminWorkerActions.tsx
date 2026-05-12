'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminWorkerActions({ workerId }: { workerId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function updateStatus(status: string) {
    setLoading(status)
    const res = await fetch(`/api/admin/workers/${workerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verificationStatus: status }),
    })
    setLoading(null)
    if (res.ok) router.refresh()
  }

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <button
        onClick={() => updateStatus('APPROVED')}
        disabled={loading !== null}
        className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-green-100"
      >
        {loading === 'APPROVED' ? (
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        )}
        Approve
      </button>
      <button
        onClick={() => updateStatus('REJECTED')}
        disabled={loading !== null}
        className="flex items-center gap-1.5 bg-white hover:bg-red-50 text-red-600 text-sm font-bold px-4 py-2.5 rounded-xl border border-red-200 transition-all hover:-translate-y-0.5"
      >
        {loading === 'REJECTED' ? (
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        Reject
      </button>
    </div>
  )
}