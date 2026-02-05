import { getCurrentHuman } from '@/domains/human/server'
import { successResponse, errorResponse, ErrorCodes } from '@/core/api'
import type { HumanMeResponse } from '@/shared/contracts'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const human = await getCurrentHuman()

    if (!human) {
      return errorResponse(
        ErrorCodes.UNAUTHORIZED,
        'No valid session',
        401
      )
    }

    const response: HumanMeResponse = {
      human_id: human.human_id,
    }

    return successResponse(response)
  } catch (error) {
    console.error('Get current human error:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'An unexpected error occurred',
      500
    )
  }
}
