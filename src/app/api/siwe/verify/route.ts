import { NextRequest, NextResponse } from 'next/server'
import { verifySiwe } from '@/domains/wallet/server'
import { SiweVerifyRequestSchema } from '@/shared/contracts'
import { errorResponse, ErrorCodes, ApiError } from '@/core/api'
import { getSession } from '@/core/session'
import type { SiweVerifyResponse } from '@/shared/contracts'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const route = 'POST /api/siwe/verify'
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
    console.log(`[${route}] body:`, JSON.stringify(body).slice(0, 500))
    const parseResult = SiweVerifyRequestSchema.safeParse(body)

    if (!parseResult.success) {
      console.error(`[${route}] → 400 validation:`, parseResult.error.flatten())
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Invalid request',
        400,
        parseResult.error.flatten()
      )
    }

    const { payload, nonce } = parseResult.data

    // 3. Verify SIWE and bind wallet
    console.log(`[${route}] verifying SIWE for human=${session.human_id}, nonce=${nonce}`)
    const result = await verifySiwe(session.human_id, payload, nonce)
    console.log(`[${route}] SIWE verified:`, { address: result.address, bound: result.bound, idempotent: result.idempotent })

    // 4. Return response
    const responseData: SiweVerifyResponse = {
      address: result.address,
      bound: result.bound,
      ...(result.idempotent !== undefined && { idempotent: result.idempotent }),
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

    console.error(`[${route}] → Unexpected error:`, error)
    console.error(`[${route}] → Stack:`, error instanceof Error ? error.stack : 'no stack')
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'An unexpected error occurred',
      500
    )
  }
}
