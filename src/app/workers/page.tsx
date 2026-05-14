import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import SignOutButton from '@/components/signOutButton'

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
                <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium px-4 py-2">Sign in</Link>
                <Link href="/register" className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-green-100">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-3">Find a Worker</h1>
          <p className="text-green-100 text-lg mb-8">All workers are CNIC verified and background checked</p>

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
                  <span>🏠</span> All Services
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
                    <span>{cat.icon}</span> {cat.name}
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
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                All
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/workers?category=${cat.name}`}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    resolvedSearchParams.category === cat.name
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {cat.icon} {cat.name}
                </Link>
              ))}
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-500 text-sm">
                <span className="font-semibold text-gray-900">{workers.length}</span> workers found
                {resolvedSearchParams.category && <span> in <span className="font-semibold text-green-600">{resolvedSearchParams.category}</span></span>}
              </p>
            </div>

            {/* Workers grid */}
            {workers.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No workers found</h3>
                <p className="text-gray-500">Try a different category or city</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                {workers.map((worker) => (
                  <WorkerCard key={worker.id} worker={worker} sessionExists={!!session} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function WorkerCard({ worker, sessionExists }: { worker: any; sessionExists: boolean }) {
  const bookingPath = `/workers/${worker.id}`
  const bookingHref = sessionExists
    ? bookingPath
    : `/login?callbackUrl=${encodeURIComponent(bookingPath)}`

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:shadow-gray-100 hover:-translate-y-1 transition-all duration-300">
      
      {/* Card header */}
      <div className="p-6 pb-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg shadow-green-100 bg-green-100">
            <img
              src={worker.user.image || '/default-avatar.svg'}
              alt={worker.user.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 truncate">{worker.user.name}</h3>
              {worker.verificationStatus === 'APPROVED' && (
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-lg">{worker.category.icon}</span>
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
                className={`w-4 h-4 ${star <= Math.round(worker.averageRating) ? 'text-yellow-400' : 'text-gray-200'}`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
            <span className="text-sm font-semibold text-gray-900 ml-1">
              {worker.averageRating > 0 ? worker.averageRating.toFixed(1) : 'New'}
            </span>
          </div>
          <span className="text-gray-300">•</span>
          <span className="text-gray-500 text-sm">{worker.totalJobs} jobs</span>
        </div>

        {/* Bio */}
        {worker.bio && (
          <p className="text-gray-500 text-sm mt-3 line-clamp-2 leading-relaxed">{worker.bio}</p>
        )}
      </div>

      {/* Card footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-gray-400">Starting from</p>
              <p className="font-bold text-gray-900">
                Rs. {worker.hourlyRate.toLocaleString()}
                <span className="text-gray-400 font-normal text-sm">/hr</span>
              </p>
            </div>
            <Link
              href={bookingHref}
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shrink-0"
            >
              Book Now
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {worker.city}
            </span>
            {worker.user.phone && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2.28a1 1 0 01.948.684l1.498 4.492a1 1 0 01-.502 1.21l-1.7.85a11.042 11.042 0 005.516 5.516l.85-1.7a1 1 0 011.21-.502l4.492 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {worker.user.phone}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
