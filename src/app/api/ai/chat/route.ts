import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { prisma } from '@/lib/prisma'

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { messages: incomingMessages } = await req.json()

    const categories = await prisma.category.findMany({ where: { isActive: true } })
    const totalWorkers = await prisma.worker.count({ where: { verificationStatus: 'APPROVED', isAvailable: true } })

    const categoryList = categories.map((c) => `${c.icon} ${c.name} — ${c.description}`).join('\n')

    const systemPrompt = `You are TrustHire's friendly customer support assistant for Pakistan's #1 home services platform.

PLATFORM INFO:
- Name: TrustHire
- Available services:\n${categoryList}
- Total verified workers available: ${totalWorkers}
- Cities: Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta
- All workers are CNIC verified and background checked
- Customers pay ONLY after the job is done
- Average worker arrival time: 30 minutes
- Commission: Platform takes 25% per job
- Ratings: Workers below 3.5 stars get suspended
- Refund policy: Full refund if not satisfied, or we send another worker free

HOW BOOKINGS WORK:
1. Customer browses workers at /browse
2. Selects a worker and fills booking form
3. Worker accepts or declines
4. Worker arrives and completes job
5. Customer pays and leaves a review

YOUR PERSONALITY:
- Friendly, helpful, and professional
- Respond in the same language the user writes in (Urdu or English)
- If user writes in Urdu, respond in Urdu
- Keep responses concise and helpful
- Use emojis occasionally to be friendly
- Never make up information you don't know
- If you cannot help, direct them to contact support@trusthire.pk

COMMON QUESTIONS YOU CAN ANSWER:
- How to book a worker
- How payments work
- How verification works
- Cancellation and refund policy
- How to become a worker
- Rating and review system
- How to track a booking
- Platform fees and pricing
- Safety and trust features

THINGS YOU CANNOT DO:
- Access specific booking details (direct them to their dashboard)
- Process refunds (direct them to admin)
- Change bookings (direct them to their dashboard)
- Share worker contact details directly`

    // Build messages array for the OpenAI-compatible chat endpoint
    const messages = [
      { role: 'system', content: systemPrompt },
      ...((incomingMessages || []).map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })))
    ]

    const modelCandidates = [
      process.env.GROQ_MODEL,
      'llama-3.1-8b-instant',
      'llama-3.3-70b-versatile',
      'mixtral-8x7b-32768',
    ].filter((model): model is string => Boolean(model))

    let reply = ''

    for (const model of modelCandidates) {
      try {
        const result: any = await client.chat.completions.create({
          model,
          messages,
          max_tokens: 500,
        })

        reply = result.choices?.[0]?.message?.content ?? result.choices?.[0]?.text ?? ''
        if (reply) break
      } catch (error) {
        const errorMessage = String(error)
        const isModelMissing =
          errorMessage.includes('model_not_found') ||
          errorMessage.includes('does not exist or you do not have access to it') ||
          errorMessage.includes('404')

        if (!isModelMissing || model === modelCandidates[modelCandidates.length - 1]) {
          throw error
        }
      }
    }

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 })
  }
}