import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SignOutButton from '@/components/signOutButton'
import AdminWorkerActions from '@/components/admin/AdminWorkerActions'

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  })

  if (!user || user.role !== 'ADMIN') redirect('/dashboard')

  const [
    totalUsers,
    totalWorkers,
    totalBookings,
    completedBookings,
    pendingWorkers,
    recentBookings,
    allWorkers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.worker.count(),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'COMPLETED' } }),
    prisma.worker.findMany({
      where: { verificationStatus: 'PENDING' },
      include: { user: { select: { name: true, email: true, phone: true } }, category: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true } },
        worker: { include: { user: { select: { name: true } }, category: true } },
      },
    }),
    prisma.worker.findMany({
      where: { verificationStatus: { in: ['APPROVED', 'REJECTED'] } },
      include: { user: { select: { name: true, email: true } }, category: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ])

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-white font-bold text-xl">TrustHire</span>
            </Link>
            <div className="hidden md:flex items-center gap-1 bg-gray-800 rounded-full px-3 py-1.5">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-gray-300 text-xs font-semibold">Admin Panel</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm hidden md:block">{user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage workers, bookings and platform activity</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: totalUsers, icon: '👥', color: 'from-blue-500 to-blue-600', light: 'bg-blue-50 text-blue-700' },
            { label: 'Total Workers', value: totalWorkers, icon: '👷', color: 'from-purple-500 to-purple-600', light: 'bg-purple-50 text-purple-700' },
            { label: 'Total Bookings', value: totalBookings, icon: '📋', color: 'from-amber-500 to-amber-600', light: 'bg-amber-50 text-amber-700' },
            { label: 'Completed Jobs', value: completedBookings, icon: '✅', color: 'from-green-500 to-green-600', light: 'bg-green-50 text-green-700' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm overflow-hidden relative">
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-5 rounded-full translate-x-6 -translate-y-6`} />
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${stat.light}`}>
                  {stat.icon}
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${stat.light}`}>
                  {stat.value}
                </span>
              </div>
              <p className="text-3xl font-black text-gray-900">{stat.value}</p>
              <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Pending Verifications */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6 shadow-sm">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">🔍</span>
              </div>
              <div>
                <h2 className="font-black text-gray-900">Pending Verifications</h2>
                <p className="text-gray-400 text-sm">{pendingWorkers.length} workers waiting for approval</p>
              </div>
            </div>
            {pendingWorkers.length > 0 && (
              <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1.5 rounded-full border border-yellow-200">
                {pendingWorkers.length} pending
              </span>
            )}
          </div>

          {pendingWorkers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">🎉</p>
              <p className="font-bold text-gray-900">All caught up!</p>
              <p className="text-gray-400 text-sm mt-1">No pending verifications</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {pendingWorkers.map((worker) => (
                <div key={worker.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-100">
                        <span className="text-white font-black text-lg">
                          {worker.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-900">{worker.user.name}</h3>
                          <span className="bg-yellow-50 text-yellow-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-yellow-100">
                            ⏳ Pending
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mt-0.5">{worker.user.email}</p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            {worker.category.icon} {worker.category.name}
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-gray-500">
                            📍 {worker.city}, {worker.area}
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-gray-500">
                            🪪 {worker.cnicNumber}
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-gray-500">
                            💰 Rs. {worker.hourlyRate.toLocaleString()}/hr
                          </span>
                        </div>
                        {worker.bio && (
                          <p className="text-gray-400 text-sm mt-2 max-w-lg line-clamp-2">{worker.bio}</p>
                        )}
                      </div>
                    </div>
                    <AdminWorkerActions workerId={worker.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6 shadow-sm">
          <div className="p-6 border-b border-gray-50 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-xl">📋</span>
            </div>
            <div>
              <h2 className="font-black text-gray-900">Recent Bookings</h2>
              <p className="text-gray-400 text-sm">Last 10 bookings on the platform</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Worker</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Service</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentBookings.map((booking) => {
                  const statusConfig: Record<string, { label: string; color: string }> = {
                    PENDING: { label: 'Pending', color: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
                    ACCEPTED: { label: 'Accepted', color: 'bg-blue-50 text-blue-700 border-blue-100' },
                    IN_PROGRESS: { label: 'In Progress', color: 'bg-purple-50 text-purple-700 border-purple-100' },
                    COMPLETED: { label: 'Completed', color: 'bg-green-50 text-green-700 border-green-100' },
                    CANCELLED: { label: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-100' },
                  }
                  const status = statusConfig[booking.status]
                  return (
                    <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-700 font-bold text-xs">
                              {booking.customer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{booking.customer.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{booking.worker.user.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          {booking.worker.category.icon} {booking.worker.category.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-400">
                          {new Date(booking.scheduledAt).toLocaleDateString('en-PK', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {recentBookings.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-sm">No bookings yet</p>
              </div>
            )}
          </div>
        </div>

        {/* All Workers */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-50 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-xl">👷</span>
            </div>
            <div>
              <h2 className="font-black text-gray-900">All Workers</h2>
              <p className="text-gray-400 text-sm">Approved and rejected workers</p>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {allWorkers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-sm">No workers yet</p>
              </div>
            ) : (
              allWorkers.map((worker) => (
                <div key={worker.id} className="p-5 hover:bg-gray-50/50 transition-colors flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-sm">
                      <span className="text-white font-bold">
                        {worker.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900 text-sm">{worker.user.name}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                          worker.verificationStatus === 'APPROVED'
                            ? 'bg-green-50 text-green-700 border-green-100'
                            : 'bg-red-50 text-red-700 border-red-100'
                        }`}>
                          {worker.verificationStatus === 'APPROVED' ? '✓ Approved' : '✗ Rejected'}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {worker.category.icon} {worker.category.name} · {worker.city} · ⭐ {worker.averageRating > 0 ? worker.averageRating.toFixed(1) : 'New'} · {worker.totalJobs} jobs
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    Rs. {worker.hourlyRate.toLocaleString()}/hr
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}