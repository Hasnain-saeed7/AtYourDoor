import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import SignOutButton from '@/components/signOutButton'
import WorkerAvatar from '@/components/WorkerAvatar'
import { getWorkerRank, type WorkerRank } from '@/lib/workerRank'
import type { LucideIcon } from 'lucide-react'
import { Briefcase, Hammer, LayoutGrid, MapPin, Phone, Scissors, Sparkles, Wrench, Zap } from 'lucide-react'

export default async function WorkersPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; city?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const session = await getServerSession(authOptions)
  const displayName = session?.user?.name?.split(' ')[0] || 'Account'

  const categories = await prisma.category.findMany({
    where: { isActive: true },
  })

  const workers = await prisma.worker.findMany({
    where: {
      verificationStatus: 'APPROVED',
      isAvailable: true,
      ...(resolvedSearchParams.category && {
        category: { name: resolvedSearchParams.category },
      }),
      ...(resolvedSearchParams.city && {
        city: { contains: resolvedSearchParams.city, mode: 'insensitive' },
      }),
    },
    include: {
      user: { select: { name: true, image: true, phone: true } },
      category: true,
    },
    orderBy: { averageRating: 'desc' },
  })

  const rankOrder: Record<WorkerRank['tier'], number> = {
    diamond: 4,
    gold: 3,
    silver: 2,
    bronze: 1,
  }

  const rankedWorkers = workers
    .map((worker) => ({
      ...worker,
      rank: getWorkerRank(worker.totalJobs),
    }))
    .sort((a, b) => {
      const tierDiff = rankOrder[b.rank.tier] - rankOrder[a.rank.tier]
      if (tierDiff !== 0) return tierDiff
      return b.totalJobs - a.totalJobs
    })

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
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/workers"
              className="text-sm font-semibold px-4 py-2 rounded-full bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition-colors"
            >
              Find Workers
            </Link>
            {session?.user?.role === 'CUSTOMER' && (
              <Link
                href="/bookings"
                className="text-sm font-semibold px-4 py-2 rounded-full bg-slate-900 text-white shadow-sm hover:bg-slate-800 transition-colors"
              >
                My Bookings
              </Link>
            )}
            <a
              href="/#services"
              className="text-sm font-semibold px-4 py-2 rounded-full bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 transition-colors"
            >
              Services
            </a>
            <a
              href="/#how"
              className="text-sm font-semibold px-4 py-2 rounded-full bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100 transition-colors"
            >
              How it works
            </a>
          </div>
          <div className="flex items-center gap-3">
            {session ? (
              <>
                <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-full text-sm font-semibold text-gray-700 shadow-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  {displayName}
                </div>
                <SignOutButton className="bg-gray-900 text-white hover:text-white hover:bg-gray-800 hover:border-transparent rounded-full px-4 py-2" />
              </>
            ) : (
              <>
                <Link href="/login" className="text-white  text-sm font-medium px-4 py-2 rounded-xl bg-black ">Sign in</Link>
                <Link href="/register" className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-teal-100">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-br from-teal-600 to-emerald-700 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-3">Find a Worker</h1>
          <p className="text-teal-100 text-lg mb-8">All workers are CNIC verified and background checked</p>

          {/* Search bar */}
          <form method="GET" className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <input
              name="city"
              defaultValue={resolvedSearchParams.city}
              placeholder="Enter your city..."
              className="flex-1 px-5 py-3.5 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-900 placeholder-gray-400 bg-white"
            />
            <button
              type="submit"
              className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-8 py-3.5 rounded-xl transition-all"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex gap-8">

          {/* Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-1">
                <Link
                  href="/workers"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    !resolvedSearchParams.category
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <LayoutGrid
                    className={`w-4 h-4 ${
                      !resolvedSearchParams.category ? 'text-green-700' : 'text-gray-500'
                    }`}
                    aria-hidden="true"
                  />
                  All Services
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/workers?category=${cat.name}`}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      resolvedSearchParams.category === cat.name
                        ? 'bg-green-50 text-green-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <CategoryIcon
                      name={cat.name}
                      className={`w-4 h-4 ${
                        resolvedSearchParams.category === cat.name ? 'text-green-700' : 'text-gray-500'
                      }`}
                    />
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">

            {/* Mobile categories */}
            <div className="flex gap-2 overflow-x-auto pb-4 lg:hidden">
              <Link
                href="/workers"
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  !resolvedSearchParams.category
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <LayoutGrid className="w-4 h-4" aria-hidden="true" />
                  All
                </span>
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/workers?category=${cat.name}`}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    resolvedSearchParams.category === cat.name
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  <CategoryIcon name={cat.name} className="w-4 h-4" />
                  {cat.name}
                </Link>
              ))}
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-500 text-sm">
                <span className="font-semibold text-gray-900">{rankedWorkers.length}</span> workers found
                {resolvedSearchParams.category && <span> in <span className="font-semibold text-teal-600">{resolvedSearchParams.category}</span></span>}
              </p>
            </div>

            {/* Workers grid */}
            {rankedWorkers.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No workers found</h3>
                <p className="text-gray-500">Try a different category or city</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                {rankedWorkers.map((worker) => (
                  <WorkerCard
                    key={worker.id}
                    worker={worker}
                    rank={worker.rank}
                    sessionExists={!!session}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function WorkerCard({
  worker,
  rank,
  sessionExists,
}: {
  worker: any
  rank: WorkerRank
  sessionExists: boolean
}) {
  const bookingPath = `/workers/${worker.id}`
  const bookingHref = sessionExists
    ? bookingPath
    : `/login?callbackUrl=${encodeURIComponent(bookingPath)}`

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:shadow-gray-100 hover:-translate-y-1 transition-all duration-300">
      
      {/* Card header */}
      <div className="p-6 pb-4  bg-beige-500">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg shadow-teal-100 bg-teal-100">
            <WorkerAvatar
              src={worker.profileImage || worker.user.image}
              alt={worker.user.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 truncate">{worker.user.name}</h3>
              {worker.verificationStatus === 'APPROVED' && (
                <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
            <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1">
              <span className="text-xs font-semibold text-gray-900">
                {rank.emoji} {rank.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <CategoryIcon name={worker.category.name} className="w-4 h-4 text-gray-500" />
              <span className="text-gray-500 text-sm">{worker.category.name}</span>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-3 mt-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-4 h-4 ${star <= rank.ratingValue ? 'text-yellow-400' : 'text-gray-200'}`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
         
          </div>
          <span className="text-gray-300">•</span>
          <span className="text-gray-500 text-sm">{worker.totalJobs} Services Completed</span>
        </div>

        {/* Bio */}
        {worker.bio && (
          <p className="text-gray-500 text-sm mt-3 line-clamp-2 leading-relaxed">{worker.bio}</p>
        )}
      </div>

      {/* Card footer */}
      <div className="px-6 py-4 bg-pink-300 border-t border-gray-100">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-black">Starting from</p>
              <p className="font-bold text-gray-900">
                Rs. {worker.hourlyRate.toLocaleString()}
                <span className="text-black font-normal text-sm">/hr</span>
              </p>
            </div>
            <Link
              href={bookingHref}
              className="bg-black text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shrink-0"
            >
              Book Now
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-black">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
              {worker.city}
            </span>
            {worker.user.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                {worker.user.phone}
              </span>
            )}
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
