import { NextRequest, NextResponse } from 'next/server'
import { consumeBridge } from '@/domains/bridge/server'
import { BridgeConsumeRequestSchema } from '@/shared/contracts'
import { ApiError, ErrorCodes, handleApiError } from '@/core/api'
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
  const route = 'POST /api/bridge/consume'
  console.log(`[${route}] ← request received`)

  try {
    // 1. Parse and validate request body
    const body = await request.json()
    console.log(`[${route}] body:`, JSON.stringify(body))
    const parseResult = BridgeConsumeRequestSchema.safeParse(body)

    if (!parseResult.success) {
      console.error(`[${route}] → 400 validation:`, parseResult.error.flatten())
      throw new ApiError(
        ErrorCodes.VALIDATION_ERROR,
        'Invalid request',
        parseResult.error.flatten()
      )
    }

    const { code } = parseResult.data

    const clientIp = getClientIp(request)
    console.log(`[${route}] clientIp=${clientIp}, code=${code}`)
    const ipKey = `bridge:consume:code:${clientIp}:${code}`
    const ipLimit = checkRateLimit(ipKey, 10, 10 * 60 * 1000)
    if (!ipLimit.allowed) {
      console.log(`[${route}] → 429 rate limited, resetAt=${new Date(ipLimit.resetAt).toISOString()}`)
      throw new ApiError(
        ErrorCodes.RATE_LIMITED,
        'Too many requests',
        { reset_at: new Date(ipLimit.resetAt).toISOString() }
      )
    }

    // 2. Consume bridge code (validates + returns human_id)
    console.log(`[${route}] consuming bridge code=${code}`)
    const result = await consumeBridge(code, { ip: clientIp })
    console.log(`[${route}] bridge consumed: human_id=${result.human_id}`)

    // 3. Create session token and set cookie
    const token = await createSessionToken({ human_id: result.human_id })

    const responseData: BridgeConsumeResponse = { ok: true }
    const response = NextResponse.json(responseData)
    setSessionCookie(response, token)

    console.log(`[${route}] → 200 OK`)
    return response
  } catch (error) {
    return handleApiError(error, route)
  }
}
