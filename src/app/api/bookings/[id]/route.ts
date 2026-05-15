import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { status } = await req.json()

    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      select: {
        status: true,
        workerId: true,
        totalAmount: true,
        worker: { select: { hourlyRate: true } },
      },
    })

    if (!existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const shouldIncrementJobs =
      status === 'COMPLETED' && existingBooking.status !== 'COMPLETED'

    const bookingAmount =
      status === 'COMPLETED' && existingBooking.totalAmount == null
        ? existingBooking.worker.hourlyRate
        : existingBooking.totalAmount

    const [booking] = await prisma.$transaction([
      prisma.booking.update({
        where: { id },
        data: {
          status,
          ...(status === 'COMPLETED' && bookingAmount != null
            ? { totalAmount: bookingAmount, isPaid: true }
            : {}),
        },
      }),
      ...(shouldIncrementJobs
        ? [
            prisma.worker.update({
              where: { id: existingBooking.workerId },
              data: {
                totalJobs: { increment: 1 },
                ...(bookingAmount != null
                  ? { totalEarnings: { increment: bookingAmount * 0.75 } }
                  : {}),
              },
            }),
          ]
        : []),
    ])

    return NextResponse.json(booking)
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}