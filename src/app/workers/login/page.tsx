 'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { Inbox, CheckCircle, DollarSign, Star } from 'lucide-react'

function WorkerLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isNewWorker = searchParams.get('registered') === 'worker'
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { t } = useLanguage()

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
    })

    if (result?.error) {
      setError(t('invalidEmailOrPassword'))
      setLoading(false)
      return
    }

    router.push('/workers/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex">

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-900/50">
              <span className="text-white font-black text-lg">T</span>
            </div>
            <span className="text-white font-bold text-xl">TrustHire</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-2 mb-4">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-sm font-medium">{t('workerPortal')}</span>
            </div>
            <h2 className="text-4xl font-black text-white leading-tight">
              {t('welcomeBack')}
            </h2>
            <p className="text-gray-400 mt-4 leading-relaxed">
              {t('accessYourWorkerDashboard')}
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: <Inbox className="w-5 h-5 text-green-300" />, textKey: 'seeNewJobRequests' },
              { icon: <CheckCircle className="w-5 h-5 text-green-300" />, textKey: 'acceptOrDeclineJobs' },
              { icon: <DollarSign className="w-5 h-5 text-green-300" />, textKey: 'trackYourEarnings' },
              { icon: <Star className="w-5 h-5 text-green-300" />, textKey: 'viewYourRatings' },
            ].map((item) => (
              <div key={item.textKey} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/6 rounded-lg flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <span className="text-gray-300 text-sm">{t(item.textKey)}</span>
              </div>
            ))}
          </div>
        </div>

      
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">T</span>
            </div>
            <span className="text-gray-900 font-bold text-lg">TrustHire</span>
          </Link>

          {/* Success message for new worker */}
          {isNewWorker && (
            <div className="bg-green-50 border border-green-100 rounded-2xl px-5 py-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-green-800 font-bold text-sm">{t('applicationSubmittedSuccessfully')}</p>
                  <p className="text-green-600 text-xs mt-1 leading-relaxed">{t('signInToTrackVerificationStatus')}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900">{t('workerSignIn')}</h1>
            <p className="text-gray-500 mt-2">{t('accessYourWorkerDashboard')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Email address
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all"
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
              className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-xl shadow-gray-200 hover:shadow-gray-300 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  {t('signingIn')}
                </>
              ) : (
                <>
                  {t('signInToDashboard')}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
            <p className="text-center text-gray-500 text-sm">{t('notAWorkerYet')}{' '}
              <Link href="/workers/register" className="text-green-600 font-bold hover:text-green-700">{t('joinAsWorker')}</Link>
            </p>
            <p className="text-center text-gray-500 text-sm">{t('areYouACustomer')}{' '}
              <Link href="/login" className="text-gray-600 font-semibold hover:text-gray-900">{t('customerLogin')}</Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default function WorkerLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" />
    </div>}>
      <WorkerLoginForm />
    </Suspense>
  )
}