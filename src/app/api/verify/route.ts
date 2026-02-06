import { NextRequest, NextResponse } from 'next/server'
import { verifyHuman } from '@/domains/human/server'
import { handleApiError } from '@/core/api'
import { setSessionCookie } from '@/core/session'
import type { VerifyResponse } from '@/shared/contracts'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const route = 'POST /api/verify'
  console.log(`[${route}] ← request received`)

  try {
    const payload = await request.json()
    console.log(`[${route}] payload:`, JSON.stringify(payload, null, 2))

    const result = await verifyHuman(payload)
    console.log(`[${route}] verifyHuman result:`, {
      human_id: result.human_id,
      is_new: result.is_new,
      hasToken: !!result.sessionToken,
    })

    // Create response with session cookie
    const responseData: VerifyResponse = {
      human_id: result.human_id,
      is_new: result.is_new,
    }

    const response = NextResponse.json(responseData)
    setSessionCookie(response, result.sessionToken)

    console.log(`[${route}] → 200 OK`)
    return response
  } catch (error) {
    return handleApiError(error, route)
  }
}
