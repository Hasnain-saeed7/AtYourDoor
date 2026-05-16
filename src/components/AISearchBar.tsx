'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Worker {
  id: string
  hourlyRate: number
  averageRating: number
  city: string
  user: { name: string }
  category: { name: string; icon: string }
}

interface AIResult {
  category: string
  categoryIcon: string
  confidence: string
  reason: string
  urgency: string
  workers: Worker[]
}

export default function AISearchBar() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AIResult | null>(null)
  const [error, setError] = useState('')

  async function handleSearch(nextQuery?: string) {
    const problem = (typeof nextQuery === 'string' ? nextQuery : query).trim()
    if (!problem) {
      setError('Please describe the problem so I can match the right worker.')
      inputRef.current?.focus()
      return
    }
    if (nextQuery) {
      setQuery(nextQuery)
    }
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/ai/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError('AI matching failed. Please try again.')
        return
      }
      setResult(data)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSearch()
  }

  const urgencyConfig = {
    urgent: { label: 'Urgent', color: 'bg-red-50 text-red-700 border-red-100' },
    normal: { label: 'Normal', color: 'bg-blue-50 text-blue-700 border-blue-100' },
    flexible: { label: 'Flexible', color: 'bg-green-50 text-green-700 border-green-100' },
  }

  const confidenceConfig = {
    high: { label: 'High confidence', color: 'text-green-600' },
    medium: { label: 'Medium confidence', color: 'text-yellow-600' },
    low: { label: 'Low confidence', color: 'text-red-500' },
  }

  return (
    <div className="w-full max-w-3xl mx-auto">

      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (error) setError('')
          }}
          onKeyDown={handleKeyDown}
          placeholder="Describe your problem... e.g. my kitchen pipe is leaking badly"
          className="w-full pl-14 pr-36 py-5 rounded-2xl border-0 bg-white/90 backdrop-blur focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-900 placeholder-gray-400 shadow-xl text-base"
        />
        <button
          onClick={() => handleSearch()}
          disabled={loading}
          className="absolute right-2 top-2 bottom-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold px-6 rounded-xl transition-all flex items-center gap-2 text-sm"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Thinking...
            </>
          ) : (
            <>
              <span>Ask AI</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </>
          )}
        </button>
      </div>

      {/* Example queries */}
      {!result && !loading && (
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            'My bathroom tap is leaking',
            'Need a suit stitched for Eid',
            'Ceiling fan stopped working',
            'House needs deep cleaning',
          ].map((example) => (
            <button
              key={example}
              onClick={() => handleSearch(example)}
              className="text-xs bg-white/20 hover:bg-white/30 text-white/80 hover:text-white px-3 py-1.5 rounded-full border border-white/20 transition-all backdrop-blur"
            >
              {example}
            </button>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* AI Result */}
      {result && (
        <div className="mt-4 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xl">

          {/* AI Analysis */}
          <div className="p-5 border-b border-gray-50">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-black text-gray-900">
                      You need a {result.categoryIcon} {result.category}
                    </p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                      urgencyConfig[result.urgency as keyof typeof urgencyConfig]?.color || urgencyConfig.normal.color
                    }`}>
                      {urgencyConfig[result.urgency as keyof typeof urgencyConfig]?.label || 'Normal'}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mt-0.5">{result.reason}</p>
                  <p className={`text-xs mt-1 font-medium ${
                    confidenceConfig[result.confidence as keyof typeof confidenceConfig]?.color || 'text-gray-400'
                  }`}>
                    {confidenceConfig[result.confidence as keyof typeof confidenceConfig]?.label || 'Low confidence'} match
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push(`/workers?category=${result.category}`)}
                className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-green-100 flex items-center gap-2 flex-shrink-0"
              >
                See All
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>

          {/* Matched Workers */}
          {result.workers.length > 0 ? (
            <div>
              <p className="px-5 pt-4 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Top Matches Near You
              </p>
              <div className="divide-y divide-gray-50">
                {result.workers.map((worker) => (
                  <div key={worker.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-sm flex-shrink-0">
                        <span className="text-white font-black">
                          {worker.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900 text-sm">{worker.user.name}</p>
                          <div className="flex items-center gap-0.5">
                            <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                            <span className="text-xs font-semibold text-gray-600">
                              {worker.averageRating > 0 ? worker.averageRating.toFixed(1) : 'New'}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                          </svg>
                          {worker.city}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-black text-gray-900">
                          Rs. {worker.hourlyRate.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">/hr</p>
                      </div>
                      <button
                        onClick={() => router.push(`/workers/${worker.id}`)}
                        className="bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all hover:-translate-y-0.5"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-400 text-sm">No available workers found right now</p>
              <button
                onClick={() => router.push(`/workers?category=${result.category}`)}
                className="mt-3 text-green-600 font-semibold text-sm hover:underline"
              >
                Browse all {result.category}s →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}