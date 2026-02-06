import { NextRequest, NextResponse } from 'next/server'
import { issueBridge } from '@/domains/bridge/server'
import { errorResponse, ErrorCodes, ApiError } from '@/core/api'
import { getSession } from '@/core/session'
import { checkRateLimit } from '@/core/rate-limit'
import type { BridgeIssueResponse } from '@/shared/contracts'

export const dynamic = 'force-dynamic'

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() ?? 'unknown'
  }
  return (
    request.headers.get('x-real-ip') ??
    request.headers.get('cf-connecting-ip') ??
    'unknown'
  )
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verify session
    const session = await getSession()
    if (!session) {
      return errorResponse(
        ErrorCodes.UNAUTHORIZED,
        'Session required',
        401
      )
    }

    const clientIp = getClientIp(request)
    const rateKey = `bridge:issue:${clientIp}:${session.human_id}`
    const limit = checkRateLimit(rateKey, 5, 10 * 60 * 1000)
    if (!limit.allowed) {
      return errorResponse(
        ErrorCodes.RATE_LIMITED,
        'Too many requests',
        429,
        { reset_at: new Date(limit.resetAt).toISOString() }
      )
    }

    // 2. Issue bridge code
    const result = await issueBridge(session.human_id)

    // 3. Return response
    const responseData: BridgeIssueResponse = {
      code: result.code,
      expires_at: result.expires_at,
    }

    return NextResponse.json(responseData)
  } catch (error) {
    if (error instanceof ApiError) {
      return errorResponse(
        error.code,
        error.message,
        500,
        error.details
      )
    }

    console.error('Bridge issue error:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'An unexpected error occurred',
      500
    )
  }
}
