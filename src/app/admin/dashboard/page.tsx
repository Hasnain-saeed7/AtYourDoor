// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'
// import { prisma } from '@/lib/prisma'
// import { redirect } from 'next/navigation'
// import Link from 'next/link'
// import SignOutButton from '@/components/signOutButton'
// import AdminWorkerActions from '@/components/admin/AdminWorkerActions'

// export default async function AdminDashboardPage() {
//   const session = await getServerSession(authOptions)
//   if (!session) redirect('/login')

//   const user = await prisma.user.findUnique({
//     where: { email: session.user.email! },
//   })

//   if (!user || user.role !== 'ADMIN') redirect('/dashboard')

//   const [
//     totalUsers,
//     totalWorkers,
//     totalBookings,
//     completedBookings,
//     pendingWorkers,
//     recentBookings,
//     allWorkers,
//   ] = await Promise.all([
//     prisma.user.count(),
//     prisma.worker.count(),
//     prisma.booking.count(),
//     prisma.booking.count({ where: { status: 'COMPLETED' } }),
//     prisma.worker.findMany({
//       where: { verificationStatus: 'PENDING' },
//       include: { user: { select: { name: true, email: true, phone: true } }, category: true },
//       orderBy: { createdAt: 'desc' },
//     }),
//     prisma.booking.findMany({
//       take: 10,
//       orderBy: { createdAt: 'desc' },
//       include: {
//         customer: { select: { name: true } },
//         worker: { include: { user: { select: { name: true } }, category: true } },
//       },
//     }),
//     prisma.worker.findMany({
//       where: { verificationStatus: { in: ['APPROVED', 'REJECTED'] } },
//       include: { user: { select: { name: true, email: true } }, category: true },
//       orderBy: { createdAt: 'desc' },
//       take: 20,
//     }),
//   ])

//   return (
//     <div className="min-h-screen bg-gray-50">

//       {/* Navbar */}
//       <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
//         <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
//           <div className="flex items-center gap-4">
//             <Link href="/" className="flex items-center gap-2">
//               <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center">
//                 <span className="text-white font-bold text-lg">T</span>
//               </div>
//               <span className="text-white font-bold text-xl">TrustHire</span>
//             </Link>
//             <div className="hidden md:flex items-center gap-1 bg-gray-800 rounded-full px-3 py-1.5">
//               <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
//               <span className="text-gray-300 text-xs font-semibold">Admin Panel</span>
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             <span className="text-gray-400 text-sm hidden md:block">{user.email}</span>
//             <SignOutButton />
//           </div>
//         </div>
//       </nav>

//       <div className="max-w-7xl mx-auto px-6 py-10">

//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-black text-gray-900">Admin Dashboard</h1>
//           <p className="text-gray-500 mt-1">Manage workers, bookings and platform activity</p>
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
//           {[
//             { label: 'Total Users', value: totalUsers, icon: '👥', color: 'from-blue-500 to-blue-600', light: 'bg-blue-50 text-blue-700' },
//             { label: 'Total Workers', value: totalWorkers, icon: '👷', color: 'from-purple-500 to-purple-600', light: 'bg-purple-50 text-purple-700' },
//             { label: 'Total Bookings', value: totalBookings, icon: '📋', color: 'from-amber-500 to-amber-600', light: 'bg-amber-50 text-amber-700' },
//             { label: 'Completed Jobs', value: completedBookings, icon: '✅', color: 'from-green-500 to-green-600', light: 'bg-green-50 text-green-700' },
//           ].map((stat) => (
//             <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm overflow-hidden relative">
//               <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-5 rounded-full translate-x-6 -translate-y-6`} />
//               <div className="flex items-center justify-between mb-4">
//                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${stat.light}`}>
//                   {stat.icon}
//                 </div>
//                 <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${stat.light}`}>
//                   {stat.value}
//                 </span>
//               </div>
//               <p className="text-3xl font-black text-gray-900">{stat.value}</p>
//               <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
//             </div>
//           ))}
//         </div>

//         {/* Pending Verifications */}
//         <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6 shadow-sm">
//           <div className="p-6 border-b border-gray-50 flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
//                 <span className="text-xl">🔍</span>
//               </div>
//               <div>
//                 <h2 className="font-black text-gray-900">Pending Verifications</h2>
//                 <p className="text-gray-400 text-sm">{pendingWorkers.length} workers waiting for approval</p>
//               </div>
//             </div>
//             {pendingWorkers.length > 0 && (
//               <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1.5 rounded-full border border-yellow-200">
//                 {pendingWorkers.length} pending
//               </span>
//             )}
//           </div>

//           {pendingWorkers.length === 0 ? (
//             <div className="text-center py-12">
//               <p className="text-4xl mb-3">🎉</p>
//               <p className="font-bold text-gray-900">All caught up!</p>
//               <p className="text-gray-400 text-sm mt-1">No pending verifications</p>
//             </div>
//           ) : (
//             <div className="divide-y divide-gray-50">
//               {pendingWorkers.map((worker) => (
//                 <div key={worker.id} className="p-6 hover:bg-gray-50/50 transition-colors">
//                   <div className="flex items-start justify-between gap-4 flex-wrap">
//                     <div className="flex items-start gap-4">
//                       <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-100">
//                         <span className="text-white font-black text-lg">
//                           {worker.user.name.charAt(0).toUpperCase()}
//                         </span>
//                       </div>
//                       <div>
//                         <div className="flex items-center gap-2 flex-wrap">
//                           <h3 className="font-bold text-gray-900">{worker.user.name}</h3>
//                           <span className="bg-yellow-50 text-yellow-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-yellow-100">
//                             ⏳ Pending
//                           </span>
//                         </div>
//                         <p className="text-gray-400 text-sm mt-0.5">{worker.user.email}</p>
//                         <div className="flex items-center gap-3 mt-2 flex-wrap">
//                           <span className="text-xs text-gray-500 flex items-center gap-1">
//                             {worker.category.icon} {worker.category.name}
//                           </span>
//                           <span className="text-gray-300">•</span>
//                           <span className="text-xs text-gray-500">
//                             📍 {worker.city}, {worker.area}
//                           </span>
//                           <span className="text-gray-300">•</span>
//                           <span className="text-xs text-gray-500">
//                             🪪 {worker.cnicNumber}
//                           </span>
//                           <span className="text-gray-300">•</span>
//                           <span className="text-xs text-gray-500">
//                             💰 Rs. {worker.hourlyRate.toLocaleString()}/hr
//                           </span>
//                         </div>
//                         {worker.bio && (
//                           <p className="text-gray-400 text-sm mt-2 max-w-lg line-clamp-2">{worker.bio}</p>
//                         )}
//                       </div>
//                     </div>
//                     <AdminWorkerActions workerId={worker.id} />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Recent Bookings */}
//         <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6 shadow-sm">
//           <div className="p-6 border-b border-gray-50 flex items-center gap-3">
//             <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
//               <span className="text-xl">📋</span>
//             </div>
//             <div>
//               <h2 className="font-black text-gray-900">Recent Bookings</h2>
//               <p className="text-gray-400 text-sm">Last 10 bookings on the platform</p>
//             </div>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="bg-gray-50 border-b border-gray-100">
//                   <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</th>
//                   <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Worker</th>
//                   <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Service</th>
//                   <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
//                   <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-50">
//                 {recentBookings.map((booking) => {
//                   const statusConfig: Record<string, { label: string; color: string }> = {
//                     PENDING: { label: 'Pending', color: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
//                     ACCEPTED: { label: 'Accepted', color: 'bg-blue-50 text-blue-700 border-blue-100' },
//                     IN_PROGRESS: { label: 'In Progress', color: 'bg-purple-50 text-purple-700 border-purple-100' },
//                     COMPLETED: { label: 'Completed', color: 'bg-green-50 text-green-700 border-green-100' },
//                     CANCELLED: { label: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-100' },
//                   }
//                   const status = statusConfig[booking.status]
//                   return (
//                     <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
//                       <td className="px-6 py-4">
//                         <div className="flex items-center gap-3">
//                           <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
//                             <span className="text-blue-700 font-bold text-xs">
//                               {booking.customer.name.charAt(0).toUpperCase()}
//                             </span>
//                           </div>
//                           <span className="text-sm font-semibold text-gray-900">{booking.customer.name}</span>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className="text-sm text-gray-600">{booking.worker.user.name}</span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className="text-sm text-gray-600 flex items-center gap-1">
//                           {booking.worker.category.icon} {booking.worker.category.name}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className="text-sm text-gray-400">
//                           {new Date(booking.scheduledAt).toLocaleDateString('en-PK', {
//                             day: 'numeric', month: 'short', year: 'numeric',
//                           })}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${status.color}`}>
//                           {status.label}
//                         </span>
//                       </td>
//                     </tr>
//                   )
//                 })}
//               </tbody>
//             </table>
//             {recentBookings.length === 0 && (
//               <div className="text-center py-12">
//                 <p className="text-gray-400 text-sm">No bookings yet</p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* All Workers */}
//         <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
//           <div className="p-6 border-b border-gray-50 flex items-center gap-3">
//             <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
//               <span className="text-xl">👷</span>
//             </div>
//             <div>
//               <h2 className="font-black text-gray-900">All Workers</h2>
//               <p className="text-gray-400 text-sm">Approved and rejected workers</p>
//             </div>
//           </div>
//           <div className="divide-y divide-gray-50">
//             {allWorkers.length === 0 ? (
//               <div className="text-center py-12">
//                 <p className="text-gray-400 text-sm">No workers yet</p>
//               </div>
//             ) : (
//               allWorkers.map((worker) => (
//                 <div key={worker.id} className="p-5 hover:bg-gray-50/50 transition-colors flex items-center justify-between gap-4 flex-wrap">
//                   <div className="flex items-center gap-4">
//                     <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-sm">
//                       <span className="text-white font-bold">
//                         {worker.user.name.charAt(0).toUpperCase()}
//                       </span>
//                     </div>
//                     <div>
//                       <div className="flex items-center gap-2">
//                         <p className="font-bold text-gray-900 text-sm">{worker.user.name}</p>
//                         <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
//                           worker.verificationStatus === 'APPROVED'
//                             ? 'bg-green-50 text-green-700 border-green-100'
//                             : 'bg-red-50 text-red-700 border-red-100'
//                         }`}>
//                           {worker.verificationStatus === 'APPROVED' ? '✓ Approved' : '✗ Rejected'}
//                         </span>
//                       </div>
//                       <p className="text-gray-400 text-xs mt-0.5">
//                         {worker.category.icon} {worker.category.name} · {worker.city} · ⭐ {worker.averageRating > 0 ? worker.averageRating.toFixed(1) : 'New'} · {worker.totalJobs} jobs
//                       </p>
//                     </div>
//                   </div>
//                   <p className="text-sm font-bold text-gray-900">
//                     Rs. {worker.hourlyRate.toLocaleString()}/hr
//                   </p>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>

//       </div>
//     </div>
//   )
// }










































import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SignOutButton from '@/components/SignOutButton'
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

  const completionRate = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0

  return (
    <div className="min-h-screen bg-[#0f1117]">

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-[#161b27] border-r border-white/5 z-50 hidden lg:flex flex-col">
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-900/50">
              <span className="text-white font-black text-lg">T</span>
            </div>
            <div>
              <span className="text-white font-black text-lg">TrustHire</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-400 text-xs font-semibold">Admin Panel</span>
              </div>
            </div>
          </Link>
        </div>

        <nav className="p-4 flex-1 space-y-1">
          {[
            { label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', active: true },
            { label: 'Workers', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', active: false },
            { label: 'Bookings', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', active: false },
            { label: 'Users', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', active: false },
          ].map((item) => (
            <div key={item.label} className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${item.active ? 'bg-green-600/20 border border-green-500/20' : 'hover:bg-white/5'}`}>
              <svg className={`w-5 h-5 ${item.active ? 'text-green-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
              </svg>
              <span className={`text-sm font-semibold ${item.active ? 'text-green-400' : 'text-gray-400'}`}>{item.label}</span>
              {item.label === 'Workers' && pendingWorkers.length > 0 && (
                <span className="ml-auto bg-yellow-500 text-yellow-900 text-xs font-black px-2 py-0.5 rounded-full">
                  {pendingWorkers.length}
                </span>
              )}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-3 bg-white/5 rounded-xl">
            <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black text-sm">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">{user.name}</p>
              <p className="text-gray-500 text-xs truncate">{user.email}</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </div>

      {/* Mobile Navbar */}
      <nav className="lg:hidden bg-[#161b27] border-b border-white/5 sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black">T</span>
            </div>
            <span className="text-white font-black">TrustHire</span>
          </Link>
          <SignOutButton />
        </div>
      </nav>

      {/* Main Content */}
      <div className="lg:ml-64 p-6 lg:p-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">
              {new Date().toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <h1 className="text-4xl font-black text-white">Dashboard Overview</h1>
          </div>
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2.5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-400 text-sm font-semibold">System Online</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Total Users',
              value: totalUsers,
              change: '+12%',
              positive: true,
              icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
              gradient: 'from-blue-500/20 to-blue-600/5',
              iconColor: 'text-blue-400',
              iconBg: 'bg-blue-500/10 border-blue-500/20',
            },
            {
              label: 'Total Workers',
              value: totalWorkers,
              change: '+8%',
              positive: true,
              icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
              gradient: 'from-purple-500/20 to-purple-600/5',
              iconColor: 'text-purple-400',
              iconBg: 'bg-purple-500/10 border-purple-500/20',
            },
            {
              label: 'Total Bookings',
              value: totalBookings,
              change: '+23%',
              positive: true,
              icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
              gradient: 'from-amber-500/20 to-amber-600/5',
              iconColor: 'text-amber-400',
              iconBg: 'bg-amber-500/10 border-amber-500/20',
            },
            {
              label: 'Completion Rate',
              value: `${completionRate}%`,
              change: '+5%',
              positive: true,
              icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
              gradient: 'from-green-500/20 to-green-600/5',
              iconColor: 'text-green-400',
              iconBg: 'bg-green-500/10 border-green-500/20',
            },
          ].map((stat) => (
            <div key={stat.label} className={`bg-gradient-to-br ${stat.gradient} border border-white/5 rounded-2xl p-5 relative overflow-hidden`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${stat.iconBg}`}>
                  <svg className={`w-5 h-5 ${stat.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                  </svg>
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${stat.positive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={stat.positive ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                  </svg>
                  {stat.change}
                </div>
              </div>
              <p className="text-3xl font-black text-white mb-1">{stat.value}</p>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Pending Verifications */}
        <div className="bg-[#161b27] border border-white/5 rounded-2xl overflow-hidden mb-6">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h2 className="font-black text-white text-lg">Worker Verifications</h2>
                <p className="text-gray-500 text-sm mt-0.5">Review and approve worker applications</p>
              </div>
            </div>
            {pendingWorkers.length > 0 && (
              <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                <span className="text-yellow-400 text-sm font-bold">{pendingWorkers.length} pending</span>
              </div>
            )}
          </div>

          {pendingWorkers.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-bold text-white text-lg">All caught up!</p>
              <p className="text-gray-500 text-sm mt-1">No pending verifications right now</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {pendingWorkers.map((worker) => (
                <div key={worker.id} className="p-6 hover:bg-white/2 transition-colors">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-900/30">
                        <span className="text-white font-black text-xl">
                          {worker.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-black text-white text-lg">{worker.user.name}</h3>
                          <span className="bg-yellow-500/10 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full border border-yellow-500/20 flex items-center gap-1.5">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Pending Review
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mt-0.5">{worker.user.email}</p>
                        <div className="flex items-center gap-3 mt-3 flex-wrap">
                          <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                            <span>{worker.category.icon}</span>
                            {worker.category.name}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            </svg>
                            {worker.city}, {worker.area}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"/>
                            </svg>
                            {worker.cnicNumber}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5 font-semibold">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            Rs. {worker.hourlyRate.toLocaleString()}/hr
                          </span>
                        </div>
                        {worker.bio && (
                          <p className="text-gray-500 text-sm mt-3 max-w-lg line-clamp-2 leading-relaxed">{worker.bio}</p>
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
        <div className="bg-[#161b27] border border-white/5 rounded-2xl overflow-hidden mb-6">
          <div className="p-6 border-b border-white/5 flex items-center gap-4">
            <div className="w-11 h-11 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 className="font-black text-white text-lg">Recent Bookings</h2>
              <p className="text-gray-500 text-sm">Latest platform activity</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Worker</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentBookings.map((booking) => {
                  const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
                    PENDING: { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', dot: 'bg-yellow-400' },
                    ACCEPTED: { label: 'Accepted', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', dot: 'bg-blue-400' },
                    IN_PROGRESS: { label: 'In Progress', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', dot: 'bg-purple-400' },
                    COMPLETED: { label: 'Completed', color: 'bg-green-500/10 text-green-400 border-green-500/20', dot: 'bg-green-400' },
                    CANCELLED: { label: 'Cancelled', color: 'bg-red-500/10 text-red-400 border-red-500/20', dot: 'bg-red-400' },
                  }
                  const status = statusConfig[booking.status]
                  return (
                    <tr key={booking.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-400 font-black text-xs">
                              {booking.customer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-white">{booking.customer.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-400">{booking.worker.user.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-400 flex items-center gap-1.5">
                          <span>{booking.worker.category.icon}</span>
                          {booking.worker.category.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">
                          {new Date(booking.scheduledAt).toLocaleDateString('en-PK', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full border flex items-center gap-1.5 w-fit ${status.color}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {recentBookings.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-500 text-sm">No bookings yet</p>
              </div>
            )}
          </div>
        </div>

        {/* All Workers */}
        <div className="bg-[#161b27] border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center gap-4">
            <div className="w-11 h-11 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="font-black text-white text-lg">All Workers</h2>
              <p className="text-gray-500 text-sm">Approved and rejected workers</p>
            </div>
          </div>
          <div className="divide-y divide-white/5">
            {allWorkers.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-sm">No workers yet</p>
              </div>
            ) : (
              allWorkers.map((worker) => (
                <div key={worker.id} className="p-5 hover:bg-white/2 transition-colors flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-900/20">
                      <span className="text-white font-black">
                        {worker.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-black text-white">{worker.user.name}</p>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                          worker.verificationStatus === 'APPROVED'
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={worker.verificationStatus === 'APPROVED' ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'} />
                          </svg>
                          {worker.verificationStatus === 'APPROVED' ? 'Approved' : 'Rejected'}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs mt-1 flex items-center gap-2">
                        <span>{worker.category.icon} {worker.category.name}</span>
                        <span className="text-gray-600">·</span>
                        <span>{worker.city}</span>
                        <span className="text-gray-600">·</span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          {worker.averageRating > 0 ? worker.averageRating.toFixed(1) : 'New'}
                        </span>
                        <span className="text-gray-600">·</span>
                        <span>{worker.totalJobs} jobs</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-black">Rs. {worker.hourlyRate.toLocaleString()}</p>
                    <p className="text-gray-500 text-xs">/hr</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}