import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  })

  if (!user) redirect('/login')

  if (user.role === 'WORKER') redirect('/workers/dashboard')
  if (user.role === 'ADMIN') redirect('/admin/dashboard')

  redirect('/workers')
}