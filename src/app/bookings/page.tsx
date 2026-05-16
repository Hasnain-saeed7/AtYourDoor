import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SignOutButton from '@/components/signOutButton'

export default async function MyBookingsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  })

  if (!user) redirect('/login')

  if (user.role === 'WORKER') redirect('/workers/dashboard')
  if (user.role === 'ADMIN') redirect('/admin/dashboard')

  const bookings = await prisma.booking.findMany({
    where: { customerId: user.id },
    include: {
      worker: {
        include: {
          user: { select: { name: true, phone: true } },
          category: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-gray-900 font-bold text-xl">TrustHire</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/workers" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              Find Workers
            </Link>
            <SignOutButton />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-500 mt-1">Track your recent requests and statuses</p>
          </div>
          <Link href="/workers" className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-green-100">
            + Book a Worker
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 text-lg">Your Bookings</h2>
            <span className="text-sm text-gray-400">{bookings.length} total</span>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🧰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-500 mb-6">Book your first verified worker today</p>
              <Link href="/workers" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-all">
                Browse Workers
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {bookings.map((booking) => (
                <BookingRow key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function BookingRow({ booking }: { booking: any }) {
  const statusConfig: Record<string, { label: string; color: string }> = {
    PENDING: { label: 'Pending', color: 'bg-yellow-50 text-yellow-700 border border-yellow-100' },
    ACCEPTED: { label: 'Accepted', color: 'bg-blue-50 text-blue-700 border border-blue-100' },
    IN_PROGRESS: { label: 'In Progress', color: 'bg-purple-50 text-purple-700 border border-purple-100' },
    COMPLETED: { label: 'Completed', color: 'bg-green-50 text-green-700 border border-green-100' },
    CANCELLED: { label: 'Cancelled', color: 'bg-red-50 text-red-700 border border-red-100' },
  }

  const status = statusConfig[booking.status] || statusConfig.PENDING

  return (
    <div className="p-6 hover:bg-gray-50/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-teal-100">
            <span className="text-white font-bold">
              {booking.worker.user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-gray-900">{booking.worker.user.name}</h3>
              <span className="text-gray-300">•</span>
              <span className="text-gray-500 text-sm flex items-center gap-1">
                {booking.worker.category.icon} {booking.worker.category.name}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1 line-clamp-1">{booking.description}</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(booking.scheduledAt).toLocaleDateString('en-PK', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {booking.city}
              </span>
              {booking.worker.user.phone && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2.28a1 1 0 01.948.684l1.498 4.492a1 1 0 01-.502 1.21l-1.7.85a11.042 11.042 0 005.516 5.516l.85-1.7a1 1 0 011.21-.502l4.492 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {booking.worker.user.phone}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${status.color}`}>
            {status.label}
          </span>
          {booking.totalAmount && (
            <span className="text-sm font-bold text-gray-900">
              Rs. {booking.totalAmount.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
