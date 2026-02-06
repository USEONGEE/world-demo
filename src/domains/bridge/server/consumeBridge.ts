import 'server-only'

import { ApiError, ErrorCodes } from '@/shared/errors'
import { checkRateLimit } from '@/core/rate-limit'
import { findByCode, markUsed } from '../repo'

/**
 * Consume a bridge code: validate and return human_id
 */
export async function consumeBridge(
  code: string,
  options?: { ip?: string }
): Promise<{ human_id: string }> {
  // 1. Find bridge token by code
  const token = await findByCode(code)

  if (!token) {
    throw new ApiError(ErrorCodes.INVALID_BRIDGE_CODE, 'Invalid bridge code')
  }

  // 2. Check if already used
  if (token.used) {
    throw new ApiError(ErrorCodes.BRIDGE_ALREADY_USED, 'Bridge code already used')
  }

  // 3. Check if expired
  const now = new Date()
  const expiresAt = new Date(token.expires_at)
  if (now > expiresAt) {
    throw new ApiError(ErrorCodes.BRIDGE_EXPIRED, 'Bridge code expired')
  }

  // Optional rate limit by IP + human_id (10 per 10 minutes)
  if (options?.ip) {
    const key = `bridge:consume:human:${options.ip}:${token.human_id}`
    const limit = checkRateLimit(key, 10, 10 * 60 * 1000)
    if (!limit.allowed) {
      throw new ApiError(ErrorCodes.RATE_LIMITED, 'Too many requests', {
        reset_at: new Date(limit.resetAt).toISOString(),
      })
    }
  }

  // 4. Mark as used
  await markUsed(token.id)

  return { human_id: token.human_id }
}
