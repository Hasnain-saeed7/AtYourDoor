import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {session.user.name}!
        </h1>
        <p className="text-gray-500 mt-2">Role: {session.user.role}</p>
        <p className="text-gray-500">Email: {session.user.email}</p>
      </div>
    </div>
  )
} 


