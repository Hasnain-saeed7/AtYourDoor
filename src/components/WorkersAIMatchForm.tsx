'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type CategoryOption = {
  id: string
  name: string
}

type WorkersAIMatchFormProps = {
  categories: CategoryOption[]
  defaultCity?: string
  defaultCategory?: string
  defaultBudget?: string
  defaultMedal?: string
}

export default function WorkersAIMatchForm({
  categories,
  defaultCity,
  defaultCategory,
  defaultBudget,
  defaultMedal,
}: WorkersAIMatchFormProps) {
  const router = useRouter()
  const [city, setCity] = useState(defaultCity ?? '')
  const [category, setCategory] = useState(defaultCategory ?? 'auto')
  const [budget, setBudget] = useState(defaultBudget ?? '')
  const [medal, setMedal] = useState(defaultMedal ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const categoryOptions = useMemo(() => {
    return categories
      .map((item) => item.name)
      .sort((a, b) => a.localeCompare(b))
  }, [categories])

  function buildSearchParams(resolvedCategory?: string) {
    const params = new URLSearchParams()

    if (city.trim()) params.set('city', city.trim())
    if (budget.trim()) params.set('budget', budget.trim())
    if (medal) params.set('medal', medal)
    if (resolvedCategory) params.set('category', resolvedCategory)

    return params
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (loading) return

    if (category !== 'auto') {
      const params = buildSearchParams(category)
      router.push(`/workers?${params.toString()}`)
      return
    }

    const problemParts = [
      city ? `City: ${city}` : 'City: any',
      budget ? `Budget up to Rs ${budget}/hr` : 'Budget: any',
      medal ? `Medal: ${medal}` : 'Medal: any',
      'Goal: find the best matching worker category for these filters.',
    ]

    setLoading(true)

    try {
      const response = await fetch('/api/ai/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem: problemParts.join(' ') }),
      })

      const data = await response.json()
      if (!response.ok || !data?.category) {
        setError('AI matching failed. Please choose a category manually.')
        return
      }

      const params = buildSearchParams(data.category)
      router.push(`/workers?${params.toString()}`)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-4">
      <input
        name="city"
        value={city}
        onChange={(event) => {
          setCity(event.target.value)
          if (error) setError('')
        }}
        placeholder="City"
        className="px-4 py-3 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-900 placeholder-gray-400 bg-white"
      />
      <select
        name="category"
        value={category}
        onChange={(event) => {
          setCategory(event.target.value)
          if (error) setError('')
        }}
        className="px-4 py-3 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-900 bg-white"
      >
        <option value="auto">AI choose category</option>
        {categoryOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <input
        name="budget"
        type="number"
        min="0"
        value={budget}
        onChange={(event) => {
          setBudget(event.target.value)
          if (error) setError('')
        }}
        placeholder="Budget (Rs/hr)"
        className="px-4 py-3 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-900 placeholder-gray-400 bg-white"
      />
      <div className="flex gap-3">
        <select
          name="medal"
          value={medal}
          onChange={(event) => {
            setMedal(event.target.value)
            if (error) setError('')
          }}
          className="flex-1 px-4 py-3 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-900 bg-white"
        >
          <option value="">Any medal</option>
          <option value="diamond">Diamond</option>
          <option value="gold">Gold</option>
          <option value="silver">Silver</option>
          <option value="bronze">Bronze</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-600 text-white font-semibold px-6 py-3 rounded-xl transition-all whitespace-nowrap"
        >
          {loading ? 'Matching...' : 'Match Workers'}
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-100 md:col-span-4">{error}</p>
      )}
    </form>
  )
}
