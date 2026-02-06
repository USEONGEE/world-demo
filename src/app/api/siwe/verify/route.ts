import { NextRequest, NextResponse } from 'next/server'
import { verifySiwe } from '@/domains/wallet/server'
import { SiweVerifyRequestSchema } from '@/shared/contracts'
import { errorResponse, ErrorCodes, ApiError } from '@/core/api'
import { getSession } from '@/core/session'
import type { SiweVerifyResponse } from '@/shared/contracts'

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
    const parseResult = SiweVerifyRequestSchema.safeParse(body)

    if (!parseResult.success) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Invalid request',
        400,
        parseResult.error.flatten()
      )
    }

    const { payload, nonce } = parseResult.data

    // 3. Verify SIWE and bind wallet
    const result = await verifySiwe(session.human_id, payload, nonce)

    // 4. Return response
    const responseData: SiweVerifyResponse = {
      address: result.address,
      bound: result.bound,
      ...(result.idempotent !== undefined && { idempotent: result.idempotent }),
    }

    return NextResponse.json(responseData)
  } catch (error) {
    if (error instanceof ApiError) {
      const statusMap: Record<string, number> = {
        [ErrorCodes.VALIDATION_ERROR]: 400,
        [ErrorCodes.UNAUTHORIZED]: 401,
        [ErrorCodes.INVALID_CHALLENGE]: 400,
        [ErrorCodes.ADDRESS_ALREADY_BOUND]: 409,
        [ErrorCodes.VERIFICATION_FAILED]: 400,
        [ErrorCodes.INTERNAL_ERROR]: 500,
      }

      return errorResponse(
        error.code,
        error.message,
        statusMap[error.code] ?? 500,
        error.details
      )
    }

    console.error('SIWE verify error:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'An unexpected error occurred',
      500
    )
  }
}
