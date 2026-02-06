import { NextRequest, NextResponse } from 'next/server'
import { listWallets } from '@/domains/wallet/server'
import { ApiError, ErrorCodes, handleApiError } from '@/core/api'
import { getSession } from '@/core/session'
import type { WalletsResponse } from '@/shared/contracts'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const route = 'GET /api/wallet/bindings'
  console.log(`[${route}] ← request received`)

  try {
    // 1. Verify session
    const session = await getSession()
    console.log(`[${route}] session:`, session ? { human_id: session.human_id } : null)

    if (!session) {
      console.log(`[${route}] → 401 no session`)
      throw new ApiError(ErrorCodes.UNAUTHORIZED, 'Session required')
    }

    // 2. Get wallet bindings
    const wallets = await listWallets(session.human_id)
    console.log(`[${route}] found ${wallets.length} wallets for human=${session.human_id}`)

    // 3. Return response
    const responseData: WalletsResponse = {
      wallets: wallets.map((w) => ({
        address: w.address,
        chain: w.chain,
        verified_at: w.verified_at,
        verification_method: w.verification_method,
      })),
    }

    console.log(`[${route}] → 200 OK`)
    return NextResponse.json(responseData)
  } catch (error) {
    return handleApiError(error, route)
  }
}
