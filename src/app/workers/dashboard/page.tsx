import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SignOutButton from '@/components/signOutButton'
import WorkerBookingActions from '@/components/worker/WorkerBookingActions'
import { getWorkerRank } from '@/lib/workerRank'
import { 
  Hourglass, XCircle, ClipboardList, CheckCircle2, Trophy, Banknote, Wrench, Target, HardHat, Clock
} from 'lucide-react'

export default async function WorkerDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/workers/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: { worker: { include: { category: true } } },
  })

  if (!user || user.role !== 'WORKER') redirect('/workers/login')

  const worker = user.worker
  if (!worker) redirect('/workers/register')

  if (worker.verificationStatus === 'PENDING') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-10 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Hourglass className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Verification Pending</h2>
          <p className="text-gray-500 leading-relaxed">
            Your profile is under review. We verify all workers within 24 hours. You will be notified once approved.
          </p>
        </div>
      </div>
    )
  }

  if (worker.verificationStatus === 'REJECTED') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-10 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Application Rejected</h2>
          <p className="text-gray-500 leading-relaxed">
            Your application was not approved. Please contact support for more information.
          </p>
        </div>
      </div>
    )
  }

  const bookings = await prisma.booking.findMany({
    where: { workerId: worker.id },
    include: {
      customer: { select: { name: true, phone: true, email: true } },
      category: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'PENDING').length,
    accepted: bookings.filter((b) => b.status === 'ACCEPTED').length,
    completed: bookings.filter((b) => b.status === 'COMPLETED').length,
    earnings: bookings
      .filter((b) => b.status === 'COMPLETED' && b.totalAmount)
      .reduce((sum, b) => sum + (b.totalAmount || 0) * 0.75, 0),
  }

  const rank = getWorkerRank(stats.completed)

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const topMonthlyBookings = await prisma.booking.groupBy({
    by: ['workerId'],
    where: {
      status: 'COMPLETED',
      createdAt: { gte: monthStart, lt: monthEnd },
    },
    _count: { workerId: true },
    orderBy: { _count: { workerId: 'desc' } },
    take: 3,
  })

  const topWorkerIds = topMonthlyBookings.map((entry) => entry.workerId)
  const topMonthlyWorkers = topWorkerIds.length
    ? await prisma.worker.findMany({
        where: { id: { in: topWorkerIds } },
        include: { user: { select: { name: true, image: true } }, category: true },
      })
    : []

  const monthlyBonuses = [5000, 3000, 1500]
  const topMonthlyLeaderboard = topMonthlyBookings
    .map((entry, index) => {
      const workerEntry = topMonthlyWorkers.find((workerItem) => workerItem.id === entry.workerId)
      if (!workerEntry) return null
      return {
        worker: workerEntry,
        completedJobs: entry._count.workerId,
        bonus: monthlyBonuses[index],
        position: index + 1,
      }
    })
    .filter(
      (entry): entry is {
        worker: typeof topMonthlyWorkers[number]
        completedJobs: number
        bonus: number
        position: number
      } => Boolean(entry)
    )

  const pendingBookings = bookings.filter((b) => b.status === 'PENDING')
  const activeBookings = bookings.filter((b) => ['ACCEPTED', 'IN_PROGRESS'].includes(b.status))
  const pastBookings = bookings.filter((b) => ['COMPLETED', 'CANCELLED'].includes(b.status))

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
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-full px-3 py-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-green-700 text-xs font-semibold">Verified Worker</span>
            </div>
            <SignOutButton />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-5">
            {worker.profileImage ? (
              <img 
                src={worker.profileImage} 
                alt={user.name} 
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md relative z-10" 
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-green-400 to-green-600 flex items-center justify-center shadow-md border-4 border-white">
                <span className="text-white font-bold text-2xl">{user.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                Welcome, {user.name.split(' ')[0]} <HardHat className="w-8 h-8 text-yellow-500" />
              </h1>
              <p className="text-gray-500 mt-1 flex items-center gap-2">
                <span>{worker.category.name}</span>
                <span className="text-gray-300">•</span>
                <span>{worker.city}, {worker.area}</span>
              </p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5">
                <span className="text-sm font-semibold text-gray-900">
                  {rank.emoji} {rank.label}
                </span>
                <span className="text-xs text-gray-500">{rank.ratingValue} stars</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 px-5 py-3 shadow-sm">
            <p className="text-xs text-gray-400 mb-0.5">Your Rate</p>
            <p className="text-xl font-bold text-gray-900">
              Rs. {worker.hourlyRate.toLocaleString()}
              <span className="text-gray-400 font-normal text-sm">/hr</span>
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Jobs', value: stats.total, icon: <ClipboardList className="w-6 h-6" />, color: 'bg-blue-50 text-blue-700' },
            { label: 'Pending', value: stats.pending, icon: <Clock className="w-6 h-6" />, color: 'bg-yellow-50 text-yellow-700' },
            { label: 'Accepted', value: stats.accepted, icon: <CheckCircle2 className="w-6 h-6" />, color: 'bg-green-50 text-green-700' },
            { label: 'Completed', value: stats.completed, icon: <Trophy className="w-6 h-6" />, color: 'bg-purple-50 text-purple-700' },
            { label: 'Earnings', value: `Rs. ${stats.earnings.toLocaleString()}`, icon: <Banknote className="w-6 h-6" />, color: 'bg-emerald-50 text-emerald-700' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className={stat.color.split(' ')[1]}>{stat.icon}</div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stat.color}`}>
                  {stat.value}
                </span>
              </div>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-gray-400 text-xs mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {topMonthlyLeaderboard.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6 shadow-sm">
            <div className="p-6 border-b border-gray-50 flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <Trophy className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Top Workers of the Month</h2>
                <p className="text-gray-500 text-sm">Cash bonuses funded by TrustHire</p>
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {topMonthlyLeaderboard.map((entry) => (
                <div key={entry.worker.id} className="p-6 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 font-bold flex items-center justify-center">
                      #{entry.position}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{entry.worker.user.name}</p>
                      <p className="text-xs text-gray-500">
                        {entry.worker.category.name} · {entry.completedJobs} jobs
                      </p>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-emerald-700">
                    Rs. {entry.bonus.toLocaleString()} bonus
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Requests */}
        {pendingBookings.length > 0 && (
          <div className="bg-white rounded-2xl border border-yellow-100 overflow-hidden mb-6 shadow-sm">
            <div className="p-6 border-b border-yellow-50 bg-yellow-50/50 flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">New Job Requests</h2>
                <p className="text-yellow-700 text-sm">{pendingBookings.length} request{pendingBookings.length > 1 ? 's' : ''} waiting for your response</p>
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {pendingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} showActions={true} />
              ))}
            </div>
          </div>
        )}

        {/* Active Jobs */}
        {activeBookings.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6 shadow-sm">
            <div className="p-6 border-b border-gray-50 flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Wrench className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="font-bold text-gray-900">Active Jobs</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {activeBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} showActions={true} />
              ))}
            </div>
          </div>
        )}

        {/* Past Jobs */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-50 flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-gray-600" />
            </div>
            <h2 className="font-bold text-gray-900">Job History</h2>
          </div>
          {pastBookings.length === 0 ? (
            <div className="text-center py-16">
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">No completed jobs yet</h3>
              <p className="text-gray-500 text-sm">Accept your first job request to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {pastBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} showActions={false} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

function BookingCard({ booking, showActions }: { booking: any; showActions: boolean }) {
  const statusConfig: Record<string, { label: string; color: string }> = {
    PENDING: { label: 'New Request', color: 'bg-yellow-50 text-yellow-700 border border-yellow-100' },
    ACCEPTED: { label: 'Accepted', color: 'bg-blue-50 text-blue-700 border border-blue-100' },
    IN_PROGRESS: { label: 'In Progress', color: 'bg-purple-50 text-purple-700 border border-purple-100' },
    COMPLETED: { label: 'Completed', color: 'bg-green-50 text-green-700 border border-green-100' },
    CANCELLED: { label: 'Cancelled', color: 'bg-red-50 text-red-700 border border-red-100' },
  }

  const status = statusConfig[booking.status]

  return (
    <div className="p-6 hover:bg-gray-50/50 transition-colors">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0 shadow-md shadow-blue-100">
            <span className="text-white font-bold text-lg">
              {booking.customer.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-gray-900">{booking.customer.name}</h3>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.color}`}>
                {status.label}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1">{booking.description}</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                </svg>
                {booking.address}, {booking.city}
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                {new Date(booking.scheduledAt).toLocaleDateString('en-PK', {
                  day: 'numeric', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </span>
              {booking.customer.phone && (
                <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  {booking.customer.phone}
                </span>
              )}
            </div>
          </div>
        </div>
        {showActions && (
          <WorkerBookingActions
            bookingId={booking.id}
            status={booking.status}
          />
        )}
      </div>
    </div>
  )
}


