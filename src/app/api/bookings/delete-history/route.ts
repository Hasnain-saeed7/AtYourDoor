import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { email: session.user.email! }, include: { worker: true } })
    if (!user || user.role !== 'WORKER' || !user.worker)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const workerId = user.worker.id
    console.log('delete-history workerId:', workerId, 'userEmail:', session.user.email)

    // Find bookings that represent past history for this worker
    const bookingsToHide = await prisma.booking.findMany({
      where: { workerId, status: { in: ['COMPLETED', 'CANCELLED'] } },
      select: { id: true },
    })

    const bookingIds = bookingsToHide.map((b) => b.id)

    if (bookingIds.length === 0) {
      return NextResponse.json({ hidden: 0 })
    }

    // Record hidden history rows instead of modifying bookings.
    // This preserves the booking rows for earnings and totals while removing them
    // from the worker's Past Jobs list in the UI.
    await prisma.hiddenBookingHistory.deleteMany({
      where: { workerId, bookingId: { in: bookingIds } },
    })

    const result = await prisma.hiddenBookingHistory.createMany({
      data: bookingIds.map((bookingId) => ({ bookingId, workerId })),
    })

    console.log('hidden bookings:', result.count)

    return NextResponse.json({ hidden: result.count })
  } catch (error) {
    // Return and log the real error for debugging purposes
    console.error('delete-history error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
