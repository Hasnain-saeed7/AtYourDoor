import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { workerId, bookingId, rating, comment } = await req.json()

    if (!workerId || !bookingId || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const parsedRating = Number(rating)
    if (Number.isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!user || user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Only customers can review' }, { status: 403 })
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        workerId,
        customerId: user.id,
        status: 'COMPLETED',
      },
      include: { review: true },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not eligible for review' }, { status: 400 })
    }

    if (booking.review) {
      return NextResponse.json({ error: 'Review already submitted' }, { status: 400 })
    }

    const review = await prisma.review.create({
      data: {
        bookingId,
        customerId: user.id,
        workerId,
        rating: parsedRating,
        comment: comment || null,
      },
    })

    const aggregate = await prisma.review.aggregate({
      where: { workerId },
      _avg: { rating: true },
    })

    await prisma.worker.update({
      where: { id: workerId },
      data: { averageRating: aggregate._avg.rating ?? 0 },
    })

    return NextResponse.json({ message: 'Review submitted', reviewId: review.id })
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
