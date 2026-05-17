 'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import T from '@/components/T'
import { useLanguage } from '@/context/LanguageContext'

export default function RegisterPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || ''
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const phone = formData.get('phone') as string

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone, role: 'CUSTOMER' }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || t('somethingWentWrong'))
      setLoading(false)
      return
    }

    const loginUrl = callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/login'
    router.push(loginUrl)
  }

  return (
    <div className="min-h-screen flex">

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="text-teal-700 font-bold text-lg">T</span>
            </div>
            <span className="text-white font-bold text-xl">TrustHire</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Join thousands of<br />happy customers
          </h2>
          <p className="text-teal-100 text-lg">
            Get reliable home services at your doorstep. Verified workers, transparent pricing, guaranteed quality.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            {[
              { number: '5,000+', label: 'Verified Workers' },
              { number: '50,000+', label: 'Jobs Completed' },
              { number: '4.8★', label: 'Average Rating' },
              { number: '30 min', label: 'Average Arrival' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-xl p-4">
                <p className="text-white font-bold text-xl">{stat.number}</p>
                <p className="text-teal-200 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-teal-200 text-sm">Pakistan's most trusted home services platform</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">

          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">T</span>
            </div>
            <span className="text-gray-900 font-bold text-lg">TrustHire</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900"><T k="createAccountHeading" /></h1>
            <p className="text-gray-500 mt-2"><T k="bookTrustedWorkersInMinutes" /></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2"><T k="fullName" /></label>
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all"
                  placeholder="Muhammad Ali"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2"><T k="emailAddress" /></label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all"
                  placeholder="you@example.com"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2"><T k="phoneNumber" /></label>
                <input
                  name="phone"
                  type="tel"
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all"
                  placeholder="03001234567"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2"><T k="password" /></label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all"
                  placeholder="Min. 6 characters"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-teal-200 hover:shadow-teal-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  <T k="creatingAccount" />
                </span>
              ) : <T k="createAccountHeading" />}
            </button>

            <p className="text-xs text-gray-400 text-center">
              <T k="byCreatingAccountAgreeToTerms" />
            </p>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-500 text-sm">
              <T k="alreadyHaveAnAccount" />{' '}
              <Link href="/login" className="text-teal-600 font-semibold hover:text-teal-700">
                <T k="signIn" />
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}