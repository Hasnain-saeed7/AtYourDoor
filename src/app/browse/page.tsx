import { redirect } from 'next/navigation'

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams
  const query = new URLSearchParams()

  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (typeof value === 'string') query.set(key, value)
  })

  const search = query.toString()
  redirect(`/workers${search ? `?${search}` : ''}`)
}