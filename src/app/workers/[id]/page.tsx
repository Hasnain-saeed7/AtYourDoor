import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import BookingForm from './BookingForm'

export default async function WorkerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const session = await getServerSession(authOptions)
  const bookingPath = `/workers/${resolvedParams.id}`
  const worker = await prisma.worker.findUnique({
    where: { id: resolvedParams.id },
    include: {
      user: { select: { name: true, email: true, image: true } },
      category: true,
      reviews: {
        include: { customer: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })

  if (!worker || worker.verificationStatus !== 'APPROVED') notFound()

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-gray-900 font-bold text-xl">TrustHire</span>
          </Link>
          <Link href="/workers" className="text-gray-500 hover:text-gray-900 text-sm font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Workers
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left — Worker Info */}
          <div className="lg:col-span-2 space-y-6">

            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-br from-green-600 to-emerald-700 p-8">
                <div className="flex items-start gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0 shadow-xl">
                    <span className="text-white font-black text-3xl">
                      {worker.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-2xl font-bold text-white">{worker.user.name}</h1>
                      <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
                        <div className="w-2 h-2 bg-green-300 rounded-full" />
                        <span className="text-white text-xs font-medium">Verified</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl">{worker.category.icon}</span>
                      <span className="text-green-100 font-medium">{worker.category.name}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map((star) => (
                          <svg key={star} className={`w-4 h-4 ${star <= Math.round(worker.averageRating) ? 'text-yellow-300' : 'text-white/30'}`} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        ))}
                        <span className="text-white font-semibold ml-1 text-sm">
                          {worker.averageRating > 0 ? worker.averageRating.toFixed(1) : 'New'}
                        </span>
                      </div>
                      <span className="text-green-200 text-sm">{worker.totalJobs} jobs completed</span>
                      <span className="text-green-200 text-sm flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        {worker.city}, {worker.area}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {worker.bio && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">About</h3>
                    <p className="text-gray-500 leading-relaxed">{worker.bio}</p>
                  </div>
                )}

                {worker.experience && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Experience</h3>
                    <p className="text-gray-500 leading-relaxed">{worker.experience}</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 pt-2">
                  {[
                    { label: 'Jobs Done', value: worker.totalJobs },
                    { label: 'Rating', value: worker.averageRating > 0 ? `${worker.averageRating.toFixed(1)} ★` : 'New' },
                    { label: 'Rate/hr', value: `Rs. ${worker.hourlyRate.toLocaleString()}` },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="font-bold text-gray-900 text-lg">{stat.value}</p>
                      <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-5">
                Customer Reviews
                <span className="text-gray-400 font-normal text-sm ml-2">({worker.reviews.length})</span>
              </h3>

              {worker.reviews.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-4xl mb-3">⭐</p>
                  <p className="text-gray-500">No reviews yet. Be the first!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {worker.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-700 font-bold text-sm">
                              {review.customer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-semibold text-gray-900 text-sm">{review.customer.name}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map((star) => (
                            <svg key={star} className={`w-3.5 h-3.5 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-gray-500 text-sm leading-relaxed ml-11">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right — Booking Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-lg shadow-gray-100">
                <div className="p-6 border-b border-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        Rs. {worker.hourlyRate.toLocaleString()}
                        <span className="text-gray-400 font-normal text-base">/hr</span>
                      </p>
                      <p className="text-green-600 text-sm font-medium mt-0.5">Pay after job is done</p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${worker.isAvailable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                      {worker.isAvailable ? '● Available' : '● Unavailable'}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {!session ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500 text-sm mb-4">Sign in to book this worker</p>
                      <Link href={`/login?callbackUrl=${encodeURIComponent(bookingPath)}`} className="w-full inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-all text-center">
                        Sign In to Book
                      </Link>
                    </div>
                  ) : !worker.isAvailable ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500 text-sm">This worker is currently unavailable</p>
                    </div>
                  ) : (
                    <BookingForm
                      workerId={worker.id}
                      categoryId={worker.category.id}
                      workerName={worker.user.name}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}