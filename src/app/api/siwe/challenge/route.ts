import { NextRequest, NextResponse } from 'next/server'
import { issueChallenge } from '@/domains/wallet/server'
import { SiweChallengeRequestSchema } from '@/shared/contracts'
import { errorResponse, ErrorCodes, ApiError } from '@/core/api'
import { getSession } from '@/core/session'
import type { SiweChallengeResponse } from '@/shared/contracts'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const route = 'POST /api/siwe/challenge'
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

    // 2. Parse and validate request body
    const body = await request.json()
    console.log(`[${route}] body:`, JSON.stringify(body))
    const parseResult = SiweChallengeRequestSchema.safeParse(body)

    if (!parseResult.success) {
      console.error(`[${route}] → 400 validation:`, parseResult.error.flatten())
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Invalid request',
        400,
        parseResult.error.flatten()
      )
    }

    const { address } = parseResult.data

    // 3. Issue challenge
    console.log(`[${route}] issuing challenge for human=${session.human_id}, address=${address}`)
    const result = await issueChallenge(session.human_id, address)
    console.log(`[${route}] challenge issued, nonce=${result.nonce}`)

    // 4. Return response
    const responseData: SiweChallengeResponse = {
      nonce: result.nonce,
      issued_at: result.issued_at,
      expiration_time: result.expiration_time,
    }

    console.log(`[${route}] → 200 OK`)
    return NextResponse.json(responseData)
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`[${route}] → ApiError:`, {
        code: error.code,
        message: error.message,
        details: error.details,
      })

      const statusMap: Record<string, number> = {
        [ErrorCodes.VALIDATION_ERROR]: 400,
        [ErrorCodes.UNAUTHORIZED]: 401,
        [ErrorCodes.INTERNAL_ERROR]: 500,
      }

      return errorResponse(
        error.code,
        error.message,
        statusMap[error.code] ?? 500,
        error.details
      )
    }

    console.error(`[${route}] → Unexpected error:`, error)
    console.error(`[${route}] → Stack:`, error instanceof Error ? error.stack : 'no stack')
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'An unexpected error occurred',
      500
    )
  }
}
