 'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import T from '@/components/T'
import { useLanguage } from '@/context/LanguageContext'

export default function LoginPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl,
    })

    if (result?.error) {
      setError(t('invalidEmailOrPassword'))
      setLoading(false)
      return
    }

    const redirectTo = result?.url || callbackUrl
    router.push(redirectTo)
    router.refresh()
  }

  return (
    <div className="min-h-screen flex">
      
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 flex-col justify-between p-12 relative overflow-hidden">
        
        {/* Background circles */}
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
            Book verified workers<br />you can actually trust
          </h2>
          <p className="text-teal-100 text-lg">
            Plumbers, electricians, tailors and more — verified, rated, and at your door in 30 minutes.
          </p>

          <div className="space-y-4 pt-4">
            {[
              { icon: '✓', text: 'CNIC verified workers only' },
              { icon: '✓', text: 'Pay only after job is done' },
              { icon: '✓', text: 'Rated by real customers' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{item.icon}</span>
                </div>
                <span className="text-green-50">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-teal-200 text-sm">Trusted by 10,000+ families across Pakistan</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">T</span>
            </div>
            <span className="text-gray-900 font-bold text-lg">TrustHire</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900"><T k="welcomeBack" /></h1>
            <p className="text-gray-500 mt-2"><T k="signInToYourAccountToContinue" /></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <T k="emailAddress" />
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <T k="password" />
                </label>
                <a href="#" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                  <T k="forgotPassword" />
                </a>
              </div>
              <input
                name="password"
                type="password"
                required
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all"
                placeholder="••••••••"
              />
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
                  <T k="signingIn" />
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-500 text-sm">
              <T k="dontHaveAnAccount" />{' '}
              <Link href="/register" className="text-teal-600 font-semibold hover:text-teal-700">
                <T k="createAccount" />
              </Link>
            </p>
            <p className="text-center text-gray-500 text-sm mt-2">
              <T k="areYouAWorker" />{' '}
              <Link href="/workers/register" className="text-teal-600 font-semibold hover:text-teal-700">
                <T k="joinAsWorker" />
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}