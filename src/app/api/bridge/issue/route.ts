import { NextRequest, NextResponse } from 'next/server'
import { issueBridge } from '@/domains/bridge/server'
import { errorResponse, ErrorCodes, handleApiError } from '@/core/api'
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
  const route = 'POST /api/bridge/issue'
  console.log(`[${route}] ← request received`)

  try {
    // 1. Verify session
    const session = await getSession()
    console.log(`[${route}] session:`, session ? { human_id: session.human_id } : null)

    if (!session) {
      console.log(`[${route}] → 401 no session`)
      return errorResponse(
        ErrorCodes.UNAUTHORIZED,
        'Session required',
        401
      )
    }

    const clientIp = getClientIp(request)
    console.log(`[${route}] clientIp=${clientIp}`)
    const rateKey = `bridge:issue:${clientIp}:${session.human_id}`
    const limit = checkRateLimit(rateKey, 5, 10 * 60 * 1000)
    if (!limit.allowed) {
      console.log(`[${route}] → 429 rate limited, resetAt=${new Date(limit.resetAt).toISOString()}`)
      return errorResponse(
        ErrorCodes.RATE_LIMITED,
        'Too many requests',
        429,
        { reset_at: new Date(limit.resetAt).toISOString() }
      )
    }

    // 2. Issue bridge code
    console.log(`[${route}] issuing bridge for human=${session.human_id}`)
    const result = await issueBridge(session.human_id)
    console.log(`[${route}] bridge issued: code=${result.code}, expires_at=${result.expires_at}`)

    // 3. Return response
    const responseData: BridgeIssueResponse = {
      code: result.code,
      expires_at: result.expires_at,
    }

    console.log(`[${route}] → 200 OK`)
    return NextResponse.json(responseData)
  } catch (error) {
    return handleApiError(error, route)
  }
}
