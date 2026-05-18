import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'
import type { NextRequest } from 'next/server'

const nextAuthHandler = NextAuth(authOptions)

function splitSetCookieHeader(value: string): string[] {
	// Splits a combined Set-Cookie header into individual cookies.
	// Handles the comma inside the Expires attribute.
	return value.split(/,(?=[^ ;]+=)/g).map((part) => part.trim()).filter(Boolean)
}

function getSetCookieHeaders(headers: Headers): string[] {
	const anyHeaders = headers as unknown as { getSetCookie?: () => string[] }
	if (typeof anyHeaders.getSetCookie === 'function') return anyHeaders.getSetCookie()

	const combined = headers.get('set-cookie')
	if (!combined) return []
	return splitSetCookieHeader(combined)
}

function isNextAuthSessionTokenCookie(cookieName: string): boolean {
	// Matches both `next-auth.session-token` and chunked variants like `next-auth.session-token.0`
	return (
		cookieName === 'next-auth.session-token' ||
		cookieName.startsWith('next-auth.session-token.') ||
		cookieName === '__Secure-next-auth.session-token' ||
		cookieName.startsWith('__Secure-next-auth.session-token.')
	)
}

function stripCookiePersistenceAttributes(setCookie: string): string {
	// If this is a deletion cookie (sign out), keep it as-is.
	if (/\bmax-age=0\b/i.test(setCookie)) return setCookie
	if (/\bexpires=thu, 01 jan 1970\b/i.test(setCookie)) return setCookie

	// Remove Expires/Max-Age so the cookie becomes a session cookie.
	return setCookie
		.replace(/;\s*expires=[^;]*/gi, '')
		.replace(/;\s*max-age=[^;]*/gi, '')
}

function rewriteSetCookieHeaders(response: Response): Response {
	const existing = getSetCookieHeaders(response.headers)
	if (existing.length === 0) return response

	const rewritten = existing.map((cookie) => {
		const name = cookie.split('=')[0]?.trim() ?? ''
		if (!isNextAuthSessionTokenCookie(name)) return cookie
		return stripCookiePersistenceAttributes(cookie)
	})

	const headers = new Headers(response.headers)
	headers.delete('set-cookie')
	for (const cookie of rewritten) headers.append('set-cookie', cookie)

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	})
}

async function handler(req: NextRequest, context: unknown) {
	// Forward the App Router context so NextAuth can resolve the [...nextauth] params.
	const response = await (nextAuthHandler as unknown as (
		req: NextRequest,
		context: unknown
	) => Promise<Response>)(req, context)
	return rewriteSetCookieHeaders(response)
}

export { handler as GET, handler as POST }