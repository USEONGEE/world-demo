import { NextRequest, NextResponse } from 'next/server'
import { issueChallenge } from '@/domains/wallet/server'
import { SiweChallengeRequestSchema } from '@/shared/contracts'
import { errorResponse, ErrorCodes, ApiError } from '@/core/api'
import { getSession } from '@/core/session'
import type { SiweChallengeResponse } from '@/shared/contracts'

export const dynamic = 'force-dynamic'

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

    // 2. Parse and validate request body
    const body = await request.json()
    const parseResult = SiweChallengeRequestSchema.safeParse(body)

    if (!parseResult.success) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Invalid request',
        400,
        parseResult.error.flatten()
      )
    }

    const { address } = parseResult.data

    // 3. Issue challenge
    const result = await issueChallenge(session.human_id, address)

    // 4. Return response
    const responseData: SiweChallengeResponse = {
      nonce: result.nonce,
      issued_at: result.issued_at,
      expiration_time: result.expiration_time,
    }

    return NextResponse.json(responseData)
  } catch (error) {
    if (error instanceof ApiError) {
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

    console.error('SIWE challenge error:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'An unexpected error occurred',
      500
    )
  }
}
