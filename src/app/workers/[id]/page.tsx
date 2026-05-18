import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import BookingForm from './BookingForm'
import ReviewForm from './ReviewForm'
import WorkerAvatar from '@/components/WorkerAvatar'
import T from '@/components/T'
import { getWorkerRank } from '@/lib/workerRank'
import type { LucideIcon } from 'lucide-react'
import { ArrowLeft, Briefcase, Hammer, MapPin, Scissors, Sparkles, Wrench, Zap } from 'lucide-react'

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


  const customer = session?.user?.email
    ? await prisma.user.findUnique({ where: { email: session.user.email } })
    : null

  const eligibleBooking = customer
    ? await prisma.booking.findFirst({
        where: {
          workerId: resolvedParams.id,
          customerId: customer.id,
          status: 'COMPLETED',
          review: { is: null },
        },
        orderBy: { createdAt: 'desc' },
      })
    : null

  if (!worker || worker.verificationStatus !== 'APPROVED') notFound()



  const completedJobs = await prisma.booking.count({
    where: { workerId: worker.id, status: 'COMPLETED' },
  })

  const rank = getWorkerRank(completedJobs)


}

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-gray-900 font-bold text-xl"><T k="atYourDoor" /></span>
          </Link>
          <Link href="/workers" className="text-gray-500 hover:text-gray-900 text-sm font-medium flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <T k="backToWorkers" />
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left — Worker Info */}
          <div className="lg:col-span-2 space-y-6">

            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="bg-teal-600 p-8">
                <div className="flex items-start gap-5">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0 shadow-xl">
                    <WorkerAvatar
                      src={worker.profileImage || worker.user.image}
                      alt={worker.user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-2xl font-bold text-white">{worker.user.name}</h1>
                      <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
                        <div className="w-2 h-2 bg-teal-300 rounded-full" />
                        <span className="text-white text-xs font-medium"><T k="verified" /></span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
                        <span className="text-white text-xs font-semibold">
                          {rank.emoji} {rank.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <CategoryIcon name={worker.category.name} className="w-5 h-5 text-white" />
                      <span className="text-teal-100 font-medium">{worker.category.name}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold text-sm">
                          {rank.ratingText}
                        </span>
                        <span className="text-white/70 text-xs">{rank.ratingValue} <T k="stars" /></span>
                      </div>

                      <span className="text-teal-200 text-sm flex items-center gap-1">
                        <MapPin className="w-4 h-4" aria-hidden="true" />
                        {worker.city}, {worker.area}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {worker.bio && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2"><T k="about" /></h3>
                    <p className="text-gray-500 leading-relaxed">{worker.bio}</p>
                  </div>
                )}

                {worker.experience && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2"><T k="experienceInYears" /></h3>
                    <p className="text-gray-500 leading-relaxed">{worker.experience}</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 pt-2">
                  {[
                    { labelKey: 'jobsCompleted', value: completedJobs },
                    { labelKey: 'ratingLabel', value: `${rank.ratingValue} ` },
                    { labelKey: 'ratePerHour', value: `Rs. ${worker.hourlyRate.toLocaleString()}` },
                  ].map((stat) => (
                    <div key={stat.labelKey} className="bg-olive-400 rounded-xl p-4 text-center">
                      <p className="font-bold text-black text-lg">{stat.value}</p>
                      <p className="text-black text-xs mt-1"><T k={stat.labelKey} /></p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-5">
                <T k="customerReviews" />
                <span className="text-gray-400 font-normal text-sm ml-2">({worker.reviews.length})</span>
              </h3>

              {session?.user?.role === 'CUSTOMER' && eligibleBooking && (
                <div className="mb-6 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-3"><T k="leaveAReview" /></p>
                  <ReviewForm workerId={worker.id} bookingId={eligibleBooking.id} />
                </div>
              )}

                {worker.reviews.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-4xl mb-3">⭐</p>
                  <p className="text-gray-500"><T k="noReviewsYetBeTheFirst" /></p>
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
                      <p className="text-2xl font-bold mb-2 text-gray-900">
                          Rs. {worker.hourlyRate.toLocaleString()}
                          <span className="text-black font-normal text-base"><T k="perHour" /></span>
                        </p>
                        <p className="text-gray-600 text-xs font-semibold">
                          {rank.emoji} {rank.label}
                        </p>
                    
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${worker.isAvailable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                      {worker.isAvailable ? <>● <T k="available" /></> : <>● <T k="unavailable" /></>}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {!session ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500 text-sm mb-4"><T k="signInToBookThisWorker" /></p>
                      <Link href={`/login?callbackUrl=${encodeURIComponent(bookingPath)}`} className="w-full inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-all text-center">
                        <T k="signInToBookButton" />
                      </Link>
                    </div>
                  ) : !worker.isAvailable ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500 text-sm"><T k="workerCurrentlyUnavailable" /></p>
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

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  plumber: Wrench,
  electrician: Zap,
  carpenter: Hammer,
  cleaner: Sparkles,
  tailor: Scissors,
}

function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const key = name.toLowerCase()
  const Icon = CATEGORY_ICONS[key] ?? Briefcase

  return <Icon className={className ?? 'w-4 h-4'} aria-hidden="true" />
}
