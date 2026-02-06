import { NextRequest, NextResponse } from 'next/server'
import { consumeBridge } from '@/domains/bridge/server'
import { BridgeConsumeRequestSchema } from '@/shared/contracts'
import { errorResponse, ErrorCodes, ApiError } from '@/core/api'
import { createSessionToken, setSessionCookie } from '@/core/session'
import { checkRateLimit } from '@/core/rate-limit'
import type { BridgeConsumeResponse } from '@/shared/contracts'

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
    // 1. Parse and validate request body
    const body = await request.json()
    const parseResult = BridgeConsumeRequestSchema.safeParse(body)

    if (!parseResult.success) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Invalid request',
        400,
        parseResult.error.flatten()
      )
    }

    const { code } = parseResult.data

    const clientIp = getClientIp(request)
    const ipKey = `bridge:consume:code:${clientIp}:${code}`
    const ipLimit = checkRateLimit(ipKey, 10, 10 * 60 * 1000)
    if (!ipLimit.allowed) {
      return errorResponse(
        ErrorCodes.RATE_LIMITED,
        'Too many requests',
        429,
        { reset_at: new Date(ipLimit.resetAt).toISOString() }
      )
    }

    // 2. Consume bridge code (validates + returns human_id)
    const result = await consumeBridge(code, { ip: clientIp })

    // 3. Create session token and set cookie
    const token = await createSessionToken({ human_id: result.human_id })

    const responseData: BridgeConsumeResponse = { ok: true }
    const response = NextResponse.json(responseData)
    setSessionCookie(response, token)

    return response
  } catch (error) {
    if (error instanceof ApiError) {
      const statusMap: Record<string, number> = {
        [ErrorCodes.VALIDATION_ERROR]: 400,
        [ErrorCodes.INVALID_BRIDGE_CODE]: 400,
        [ErrorCodes.BRIDGE_EXPIRED]: 400,
        [ErrorCodes.BRIDGE_ALREADY_USED]: 400,
        [ErrorCodes.RATE_LIMITED]: 429,
        [ErrorCodes.INTERNAL_ERROR]: 500,
      }

      return errorResponse(
        error.code,
        error.message,
        statusMap[error.code] ?? 500,
        error.details
      )
    }

    console.error('Bridge consume error:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'An unexpected error occurred',
      500
    )
  }
}
