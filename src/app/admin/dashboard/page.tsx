import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SignOutButton from '@/components/signOutButton'
import AdminWorkerActions from '@/components/admin/AdminWorkerActions'
import { Users, UserRound, HardHat, ClipboardList, Search, PartyPopper, ArrowLeft, MapPin, IdCard, Banknote, Wallet } from 'lucide-react'

export default async function AdminDashboardPage(props: any) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const searchParams = await props.searchParams
  const view = searchParams?.view || 'overview'
  const q = searchParams?.q || ''

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  })

  if (!user || user.role !== 'ADMIN') redirect('/login')

  const [
    totalUsers,
    totalCustomers,
    totalWorkers,
    totalBookings,
    pendingWorkers,
    recentBookings,
    allWorkers,
    allCustomers,
    allUsers,
    bookingsAmountAgg,
    topEarners,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.worker.count(),
    prisma.booking.count(),
    prisma.worker.findMany({
      where: { verificationStatus: 'PENDING' },
      include: { user: { select: { name: true, email: true, phone: true, image: true } }, category: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true, image: true } },
        worker: { include: { user: { select: { name: true, image: true } }, category: true } },
      },
    }),
    prisma.worker.findMany({
      where: {
        verificationStatus: { not: 'REJECTED' },
        ...(q ? { user: { name: { contains: q, mode: 'insensitive' } } } : {})
      },
      include: { user: { select: { name: true, email: true, image: true, phone: true } }, category: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findMany({
      where: {
        role: 'CUSTOMER',
        ...(q ? { name: { contains: q, mode: 'insensitive' } } : {})
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findMany({
      where: q ? { name: { contains: q, mode: 'insensitive' } } : {},
      orderBy: { createdAt: 'desc' },
    }),
    prisma.booking.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { totalAmount: true },
    }),
    prisma.worker.findMany({
      take: 10,
      orderBy: { totalEarnings: 'desc' },
      include: { user: { select: { name: true, email: true, image: true } }, category: true },
    }),
  ])

  const totalBookingAmount = bookingsAmountAgg._sum.totalAmount ?? 0
  const totalEarnings = totalBookingAmount * 0.25
  const adminShareFromWorker = (workerTotalEarnings: number) => workerTotalEarnings / 3

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
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            {view !== 'overview' && (
              <Link href="?view=overview" className="p-2 hover:bg-gray-200 rounded-full transition-colors mr-2">
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Link>
            )}
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-1">Manage workers, bookings and platform activity</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-5 md:gap-6 mb-10">
          {[
            { label: 'Your Earnings', value: `Rs. ${totalEarnings.toLocaleString()}`, badge: `Rs. ${totalEarnings.toLocaleString()}`, icon: <Wallet className="w-6 h-6" />, color: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50 text-emerald-700', link: '?view=earnings' },
            { label: 'Total Users', value: totalUsers.toLocaleString(), badge: totalUsers.toLocaleString(), icon: <Users className="w-6 h-6" />, color: 'from-sky-500 to-sky-600', light: 'bg-sky-50 text-sky-700', link: '?view=users' },
            { label: 'Total Workers', value: totalWorkers.toLocaleString(), badge: totalWorkers.toLocaleString(), icon: <HardHat className="w-6 h-6" />, color: 'from-violet-500 to-violet-600', light: 'bg-violet-50 text-violet-700', link: '?view=workers' },
            { label: 'Total Customers', value: totalCustomers.toLocaleString(), badge: totalCustomers.toLocaleString(), icon: <UserRound className="w-6 h-6" />, color: 'from-blue-500 to-blue-600', light: 'bg-blue-50 text-blue-700', link: '?view=customers' },
            { label: 'Total Bookings', value: totalBookings.toLocaleString(), badge: totalBookings.toLocaleString(), icon: <ClipboardList className="w-6 h-6" />, color: 'from-amber-500 to-amber-600', light: 'bg-amber-50 text-amber-700', link: '?view=bookings' },
            { label: 'Pending Verifications', value: pendingWorkers.length.toLocaleString(), badge: pendingWorkers.length.toLocaleString(), icon: <Search className="w-6 h-6" />, color: 'from-rose-500 to-rose-600', light: 'bg-rose-50 text-rose-700', link: '?view=verifications' },
          ].map((stat) => (
            <Link key={stat.label} href={stat.link} className="bg-white rounded-[28px] border border-gray-100 p-5 shadow-sm overflow-hidden relative block hover:border-gray-300 transition-colors">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-linear-to-br ${stat.color} opacity-10 rounded-full translate-x-8 -translate-y-8`} />
              <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${stat.light}`}>
                  {stat.icon}
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${stat.light}`}>
                  {stat.badge}
                </span>
              </div>
              <p className="text-2xl md:text-3xl font-black text-gray-900">{stat.value}</p>
              <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
            </Link>
          ))}
        </div>

        {(view === 'overview' || view === 'verifications') && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6 shadow-sm">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Search className="w-5 h-5 text-yellow-600" />
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
                <PartyPopper className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="font-bold text-gray-900">All caught up!</p>
                <p className="text-gray-400 text-sm mt-1">No pending verifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {pendingWorkers.map((worker) => (
                  <div key={worker.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-start gap-4">
                        {worker.profileImage ? (
                          <img 
                            src={worker.profileImage} 
                            alt={worker.user.name} 
                            className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-md border border-gray-100" 
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-400 to-purple-600 flex items-center justify-center shrink-0 shadow-md shadow-purple-100">
                            <span className="text-white font-black text-lg">
                              {worker.user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-gray-900">{worker.user.name}</h3>
                            <span className="bg-yellow-50 text-yellow-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-yellow-100 flex items-center gap-1">
                              <Search className="w-3 h-3" /> Pending
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mt-0.5">{worker.user.email}</p>
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              {worker.category.name}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-gray-400" /> {worker.city}, {worker.area}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <IdCard className="w-3 h-3 text-gray-400" /> {worker.cnicNumber}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Banknote className="w-3 h-3 text-gray-400" /> Rs. {worker.hourlyRate.toLocaleString()}/hr
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
        )}

        {(view === 'overview' || view === 'bookings') && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6 shadow-sm">
            <div className="p-6 border-b border-gray-50 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-black text-gray-900">{view === 'bookings' ? 'Bookings' : 'Recent Bookings'}</h2>
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
                            {booking.customer.image ? (
                              <img src={booking.customer.image} alt={booking.customer.name} className="w-8 h-8 rounded-full shrink-0 object-cover border border-gray-100" />
                            ) : (
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                <span className="text-blue-700 font-bold text-xs">
                                  {booking.customer.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <span className="text-sm font-semibold text-gray-900">{booking.customer.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {booking.worker.profileImage ? (
                              <img src={booking.worker.profileImage} alt={booking.worker.user.name} className="w-8 h-8 rounded-full shrink-0 object-cover border border-gray-100" />
                            ) : (
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                                <span className="text-green-700 font-bold text-xs">
                                  {booking.worker.user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <span className="text-sm text-gray-600">{booking.worker.user.name}</span>
                          </div>
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
        )}

        {view === 'users' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <h2 className="font-black text-gray-900">Total Users List</h2>
                  <p className="text-gray-400 text-sm">Every registered user on the platform</p>
                </div>
              </div>
              <form method="GET" className="flex items-center gap-2 max-w-sm w-full">
                <input type="hidden" name="view" value="users" />
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" name="q" defaultValue={q} placeholder="Search users..." className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all" />
                </div>
                <button type="submit" className="px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-xl hover:bg-sky-700 transition-colors">Search</button>
              </form>
            </div>
            <div className="divide-y divide-gray-50">
              {allUsers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-sm">{q ? 'No users found matching your search' : 'No users found'}</p>
                </div>
              ) : (
                allUsers.map((u) => (
                  <div key={u.id} className="p-5 hover:bg-gray-50/50 transition-colors flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                      {u.image ? (
                        <img src={u.image} alt={u.name} className="w-12 h-12 rounded-full shrink-0 object-cover border border-gray-100 shadow-sm" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-sm">
                          <span className="text-white font-bold text-lg">
                            {u.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900 text-base">{u.name}</p>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full border bg-gray-50 text-gray-700 border-gray-200">
                            {u.role}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mt-0.5">
                          {u.email} {u.phone ? `· ${u.phone}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {view === 'earnings' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="font-black text-gray-900">Platform Earnings</h2>
                  <p className="text-gray-400 text-sm">Admin earnings at 25% of bookings</p>
                </div>
              </div>
              <span className="bg-emerald-50 text-emerald-700 text-sm font-bold px-3 py-1.5 rounded-full border border-emerald-200">
                Rs. {totalEarnings.toLocaleString()}
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              {topEarners.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-sm">No earnings data yet</p>
                </div>
              ) : (
                topEarners.map((worker) => (
                  <div key={worker.id} className="p-5 hover:bg-gray-50/50 transition-colors flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                      {worker.profileImage ? (
                        <img src={worker.profileImage} alt={worker.user.name} className="w-12 h-12 rounded-xl shrink-0 object-cover border border-gray-100 shadow-sm" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm">
                          <span className="text-white font-bold text-lg">
                            {worker.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-gray-900 text-base">{worker.user.name}</p>
                        <p className="text-gray-400 text-sm mt-0.5">
                          {worker.category.name} · {worker.user.email}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      Rs. {adminShareFromWorker(worker.totalEarnings).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {view === 'customers' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-black text-gray-900">Total Customers List</h2>
                  <p className="text-gray-400 text-sm">Every registered customer on the platform</p>
                </div>
              </div>
              <form method="GET" className="flex items-center gap-2 max-w-sm w-full">
                <input type="hidden" name="view" value="customers" />
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" name="q" defaultValue={q} placeholder="Search customers..." className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">Search</button>
              </form>
            </div>
            <div className="divide-y divide-gray-50">
              {allCustomers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-sm">{q ? 'No customers found matching your search' : 'No customers found'}</p>
                </div>
              ) : (
                allCustomers.map((u) => (
                  <div key={u.id} className="p-5 hover:bg-gray-50/50 transition-colors flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                      {u.image ? (
                        <img src={u.image} alt={u.name} className="w-12 h-12 rounded-full shrink-0 object-cover border border-gray-100 shadow-sm" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm">
                          <span className="text-white font-bold text-lg">
                            {u.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900 text-base">{u.name}</p>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full border bg-gray-50 text-gray-700 border-gray-200">
                            {u.role}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mt-0.5">
                          {u.email} {u.phone ? `· ${u.phone}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {view === 'workers' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <HardHat className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="font-black text-gray-900">Total Workers List</h2>
                  <p className="text-gray-400 text-sm">Every registered worker on the platform</p>
                </div>
              </div>
              <form method="GET" className="flex items-center gap-2 max-w-sm w-full">
                <input type="hidden" name="view" value="workers" />
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" name="q" defaultValue={q} placeholder="Search workers..." className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" />
                </div>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 transition-colors">Search</button>
              </form>
            </div>
            <div className="divide-y divide-gray-50">
              {allWorkers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-sm">{q ? 'No workers found matching your search' : 'No workers found'}</p>
                </div>
              ) : (
                allWorkers.map((worker) => (
                  <div key={worker.id} className="p-5 hover:bg-gray-50/50 transition-colors flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                      {worker.profileImage ? (
                        <img src={worker.profileImage} alt={worker.user.name} className="w-12 h-12 rounded-xl shrink-0 object-cover border border-gray-100 shadow-sm" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-sm">
                          <span className="text-white font-bold text-lg">
                            {worker.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900 text-base">{worker.user.name}</p>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                            worker.verificationStatus === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-100' : 
                            worker.verificationStatus === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                            'bg-red-50 text-red-700 border-red-100'
                          }`}>
                            {worker.verificationStatus}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mt-0.5">
                          {worker.category.name} · {worker.city} · {worker.user.email}
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
        )}

      </div>
    </div>
  )
}









































