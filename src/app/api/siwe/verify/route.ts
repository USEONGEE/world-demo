import { NextRequest, NextResponse } from 'next/server'
import { verifySiwe } from '@/domains/wallet/server'
import { SiweVerifyRequestSchema } from '@/shared/contracts'
import { ApiError, ErrorCodes, handleApiError } from '@/core/api'
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
      throw new ApiError(ErrorCodes.UNAUTHORIZED, 'Session required')
    }

    // 2. Parse and validate request body
    const body = await request.json()
    console.log(`[${route}] body:`, JSON.stringify(body).slice(0, 500))
    const parseResult = SiweVerifyRequestSchema.safeParse(body)

    if (!parseResult.success) {
      console.error(`[${route}] → 400 validation:`, parseResult.error.flatten())
      throw new ApiError(
        ErrorCodes.VALIDATION_ERROR,
        'Invalid request',
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
    return handleApiError(error, route)
  }
}
