import 'server-only'

import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import type { NextRequest, NextResponse } from 'next/server'

// Session payload type
export type SessionPayload = {
  human_id: string
  iat: number
  exp: number
}

// Default cookie name for session
const DEFAULT_COOKIE_NAME = 'wg_session'

// Get secret key from environment
function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error('SESSION_SECRET environment variable is required')
  }
  return new TextEncoder().encode(secret)
}

// Get cookie name (default: wg_session)
function getCookieName(): string {
  return process.env.SESSION_COOKIE_NAME ?? DEFAULT_COOKIE_NAME
}

// Get expiration time (default: 7 days)
function getExpiresIn(): string {
  const ttlSeconds = process.env.SESSION_TTL_SECONDS
  if (ttlSeconds) {
    const parsed = Number(ttlSeconds)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new Error('SESSION_TTL_SECONDS must be a positive number')
    }
    return `${Math.floor(parsed)}s`
  }

  return process.env.SESSION_EXPIRES_IN ?? '7d'
}

/**
 * Create a JWT session token
 */
export async function createSessionToken(payload: { human_id: string }): Promise<string> {
  const secretKey = getSecretKey()
  const expiresIn = getExpiresIn()

  const token = await new SignJWT({ human_id: payload.human_id })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey)

  return token
}

/**
 * Verify a JWT session token and return the payload
 */
export async function verifySessionToken(token: string): Promise<SessionPayload> {
  const secretKey = getSecretKey()

  const { payload } = await jwtVerify<SessionPayload>(token, secretKey)

  return {
    human_id: payload.human_id,
    iat: payload.iat ?? 0,
    exp: payload.exp ?? 0,
  }
}

/**
 * Set session cookie on a response
 */
export function setSessionCookie(response: NextResponse, token: string): void {
  const isProduction = process.env.NODE_ENV === 'production'
  const cookieName = getCookieName()

  response.cookies.set(cookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    path: '/',
  })
}

/**
 * Get session from request cookies
 * Returns the session payload if valid, null otherwise
 */
export async function getSessionFromCookie(request: NextRequest): Promise<SessionPayload | null> {
  const cookieName = getCookieName()
  const token = request.cookies.get(cookieName)?.value

  if (!token) {
    return null
  }

  try {
    return await verifySessionToken(token)
  } catch {
    return null
  }
}

/**
 * Get session from cookies (for server components/actions)
 * Returns the session payload if valid, null otherwise
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const cookieName = getCookieName()
  const token = cookieStore.get(cookieName)?.value

  if (!token) {
    return null
  }

  try {
    return await verifySessionToken(token)
  } catch {
    return null
  }
}
