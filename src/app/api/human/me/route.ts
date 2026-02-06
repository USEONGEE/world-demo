import { getCurrentHuman } from '@/domains/human/server'
import { successResponse, errorResponse, ErrorCodes } from '@/core/api'
import type { HumanMeResponse } from '@/shared/contracts'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET() {
  const route = 'GET /api/human/me'
  console.log(`[${route}] ← request received`)

  try {
    const human = await getCurrentHuman()

    if (!human) {
      console.log(`[${route}] → 401 no valid session`)
      return errorResponse(
        ErrorCodes.UNAUTHORIZED,
        'No valid session',
        401
      )
    }

    console.log(`[${route}] → 200 human_id=${human.human_id}`)

    const response: HumanMeResponse = {
      human_id: human.human_id,
    }

    return successResponse(response)
  } catch (error) {
    console.error(`[${route}] → Unexpected error:`, error)
    console.error(`[${route}] → Stack:`, error instanceof Error ? error.stack : 'no stack')
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'An unexpected error occurred',
      500
    )
  }
}
