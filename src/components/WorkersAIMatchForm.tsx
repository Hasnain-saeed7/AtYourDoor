'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'

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
  const { t } = useLanguage()
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  const [city, setCity] = useState(defaultCity ?? '')
  const [citySuggestions, setCitySuggestions] = useState<string[]>([])
  const [category, setCategory] = useState(defaultCategory ?? '')
  const [budget, setBudget] = useState(defaultBudget ?? '')
  const [medal, setMedal] = useState(defaultMedal ?? '')

  useEffect(() => {
    if (!mapboxToken || city.trim().length < 2) {
      setCitySuggestions([])
      return
    }

    const timeoutId = setTimeout(async () => {
      try {
        const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(city)}.json?access_token=${mapboxToken}&types=place&country=PK&limit=5`
        const response = await fetch(endpoint)
        if (!response.ok) {
          setCitySuggestions([])
          return
        }

        const data = await response.json() as { features?: Array<{ text?: string }> }
        const suggestions = (data.features || [])
          .map((feature) => feature.text)
          .filter((item): item is string => Boolean(item))

        setCitySuggestions([...new Set(suggestions)])
      } catch {
        setCitySuggestions([])
      }
    }, 250)

    return () => clearTimeout(timeoutId)
  }, [city, mapboxToken])

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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = buildSearchParams(category)
    router.push(`/workers?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-3 rounded-2xl shadow-md">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-center">
        {/* Row: inputs */}
        <div className="md:col-span-5">
          <label className="sr-only">{t('city')}</label>
          <input
            name="city"
            list="worker-city-suggestions"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder={t('cityEgKarachi')}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label="City"
          />
          <datalist id="worker-city-suggestions">
            {citySuggestions.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </div>

        <div className="md:col-span-3">
          <label className="sr-only">{t('categories')}</label>
          <select
            name="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label="Category"
          >
            <option value="">{t('allCategories')}</option>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="sr-only">{t('maxBudgetLabel') || 'Max budget'}</label>
          <input
            name="budget"
            type="number"
            min="0"
            value={budget}
            onChange={(event) => setBudget(event.target.value.replace(/\D/g, ''))}
            placeholder={t('maxBudgetPlaceholder')}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label="Max budget"
          />
        </div>

        <div className="md:col-span-1">
          <label className="sr-only">{t('medal')}</label>
          <select
            name="medal"
            value={medal}
            onChange={(event) => setMedal(event.target.value)}
            className="w-full px-3 py-3 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label="Medal"
          >
            <option value="">{t('any')}</option>
            <option value="diamond">{t('diamond')}</option>
            <option value="gold">{t('gold')}</option>
            <option value="silver">{t('silver')}</option>
            <option value="bronze">{t('bronze')}</option>
          </select>
        </div>

        <div className="md:col-span-1 md:ml-2">
          <button
            type="submit"
            className="w-full h-full bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-3 rounded-lg transition-colors"
          >
            {t('search')}
          </button>
        </div>
      </div>
    </form>
  )
}
