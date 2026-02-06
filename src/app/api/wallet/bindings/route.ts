import { NextRequest, NextResponse } from 'next/server'
import { listWallets } from '@/domains/wallet/server'
import { errorResponse, ErrorCodes, ApiError } from '@/core/api'
import { getSession } from '@/core/session'
import type { WalletsResponse } from '@/shared/contracts'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
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

    // 2. Get wallet bindings
    const wallets = await listWallets(session.human_id)

    // 3. Return response
    const responseData: WalletsResponse = {
      wallets: wallets.map((w) => ({
        address: w.address,
        chain: w.chain,
        verified_at: w.verified_at,
        verification_method: w.verification_method,
      })),
    }

    return NextResponse.json(responseData)
  } catch (error) {
    if (error instanceof ApiError) {
      const statusMap: Record<string, number> = {
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

    console.error('Wallet bindings error:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'An unexpected error occurred',
      500
    )
  }
}
