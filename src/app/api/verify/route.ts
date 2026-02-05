import { NextRequest, NextResponse } from 'next/server'
import { verifyHuman } from '@/domains/human/server'
import { successResponse, errorResponse, ErrorCodes, ApiError } from '@/core/api'
import { setSessionCookie } from '@/core/session'
import type { VerifyResponse } from '@/shared/contracts'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()

    const result = await verifyHuman(payload)

    // Create response with session cookie
    const responseData: VerifyResponse = {
      human_id: result.human_id,
      is_new: result.is_new,
    }

    const response = NextResponse.json(responseData)
    setSessionCookie(response, result.sessionToken)

    return response
  } catch (error) {
    if (error instanceof ApiError) {
      const statusMap: Record<string, number> = {
        [ErrorCodes.VALIDATION_ERROR]: 400,
        [ErrorCodes.VERIFICATION_FAILED]: 400,
        [ErrorCodes.UNAUTHORIZED]: 401,
        [ErrorCodes.CONFLICT]: 409,
        [ErrorCodes.NOT_FOUND]: 404,
        [ErrorCodes.INTERNAL_ERROR]: 500,
      }

      return errorResponse(
        error.code,
        error.message,
        statusMap[error.code] ?? 500,
        error.details
      )
    }

    console.error('Verify error:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'An unexpected error occurred',
      500
    )
  }
}
