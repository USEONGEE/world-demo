import { getCurrentHuman } from '@/domains/human/server'
import { ApiError, ErrorCodes, handleApiError, successResponse } from '@/core/api'
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
      throw new ApiError(ErrorCodes.UNAUTHORIZED, 'No valid session')
    }

    console.log(`[${route}] → 200 human_id=${human.human_id}`)

    const response: HumanMeResponse = {
      human_id: human.human_id,
    }

    return successResponse(response)
  } catch (error) {
    return handleApiError(error, route)
  }
}
