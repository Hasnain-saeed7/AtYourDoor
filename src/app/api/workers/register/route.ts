import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const {
      userId, categoryName, bio, experience,
      cnicNumber, cnicImage, profileImage, city, area, hourlyRate,
    } = await req.json()

    const category = await prisma.category.findUnique({
      where: { name: categoryName },
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const worker = await prisma.worker.create({
      data: {
        userId,
        categoryId: category.id,
        bio,
        experience,
        cnicNumber,
        cnicImage: cnicImage || 'pending',
        profileImage: profileImage || null,
        city,
        area,
        hourlyRate,
        verificationStatus: 'PENDING',
      },
    })

    return NextResponse.json({ message: 'Worker registered', workerId: worker.id })
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}