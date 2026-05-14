import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Groq from 'groq-sdk'

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { problem } = await req.json()

    if (!problem) {
      return NextResponse.json({ error: 'Problem description required' }, { status: 400 })
    }

    const categories = await prisma.category.findMany({
      where: { isActive: true },
    })

    const categoryList = categories.map((c) => c.name).join(', ')

    const chatCompletion = await client.chat.completions.create({
      model: 'llama3-8b-8192',
      response_format: { type: 'json_object' },
      max_tokens: 300,
      messages: [
        {
          role: 'system',
          content: `You are a home services assistant for Pakistan. Respond ONLY with JSON, nothing else.`
        },
        {
          role: 'user',
          content: `Available service categories: ${categoryList}

User's problem: "${problem}"

Respond with ONLY a JSON object in this exact format:
{
  "category": "the most relevant category name from the list",
  "confidence": "high", // "high", "medium", or "low"
  "reason": "one short sentence explaining why",
  "urgency": "normal" // "urgent", "normal", or "flexible"
}`
        },
      ],
    })

    const responseText = chatCompletion.choices[0]?.message?.content || ''

    let aiResponse
    try {
      aiResponse = JSON.parse(responseText)
    } catch {
      aiResponse = { category: categories[0].name, confidence: 'low', reason: 'Could not determine category', urgency: 'normal' }
    }

    const matchedCategory = categories.find(
      (c) => c.name.toLowerCase() === aiResponse.category?.toLowerCase()
    )

    const workers = matchedCategory
      ? await prisma.worker.findMany({
          where: {
            categoryId: matchedCategory.id,
            verificationStatus: 'APPROVED',
            isAvailable: true,
          },
          include: {
            user: { select: { name: true } },
            category: true,
          },
          orderBy: { averageRating: 'desc' },
          take: 3,
        })
      : []

    return NextResponse.json({
      category: aiResponse.category,
      categoryIcon: matchedCategory?.icon || '🔧',
      confidence: aiResponse.confidence,
      reason: aiResponse.reason,
      urgency: aiResponse.urgency,
      workers,
    })
  } catch (error) {
    return NextResponse.json({ error: 'AI matching failed' }, { status: 500 })
  }
}