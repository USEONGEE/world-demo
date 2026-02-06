import 'server-only'

import { ApiError, ErrorCodes } from '@/shared/errors'
import { checkRateLimit } from '@/core/rate-limit'
import { findByCode, markUsed } from '../repo'

const log = (msg: string, data?: unknown) =>
  console.log(`[consumeBridge] ${msg}`, data !== undefined ? data : '')

const logError = (msg: string, data?: unknown) =>
  console.error(`[consumeBridge] ${msg}`, data !== undefined ? data : '')

/**
 * Consume a bridge code: validate and return human_id
 */
export async function consumeBridge(
  code: string,
  options?: { ip?: string }
): Promise<{ human_id: string }> {
  log('called with code:', code)

  // 1. Find bridge token by code
  const token = await findByCode(code)
  log('findByCode result:', token ? { id: token.id, human_id: token.human_id, used: token.used, expires_at: token.expires_at } : null)

  if (!token) {
    logError('bridge code not found')
    throw new ApiError(ErrorCodes.INVALID_BRIDGE_CODE, 'Invalid bridge code')
  }

  // 2. Check if already used
  if (token.used) {
    logError('bridge code already used')
    throw new ApiError(ErrorCodes.BRIDGE_ALREADY_USED, 'Bridge code already used')
  }

  // 3. Check if expired
  const now = new Date()
  const expiresAt = new Date(token.expires_at)
  log('expiry check:', { now: now.toISOString(), expiresAt: expiresAt.toISOString(), isExpired: now > expiresAt })

  if (now > expiresAt) {
    logError('bridge code expired')
    throw new ApiError(ErrorCodes.BRIDGE_EXPIRED, 'Bridge code expired')
  }

  // Optional rate limit by IP + human_id (10 per 10 minutes)
  if (options?.ip) {
    const key = `bridge:consume:human:${options.ip}:${token.human_id}`
    const limit = checkRateLimit(key, 10, 10 * 60 * 1000)
    log('rate limit check:', { key, allowed: limit.allowed })
    if (!limit.allowed) {
      logError('rate limited')
      throw new ApiError(ErrorCodes.RATE_LIMITED, 'Too many requests', {
        reset_at: new Date(limit.resetAt).toISOString(),
      })
    }
  }

  // 4. Mark as used
  await markUsed(token.id)
  log('marked as used, returning human_id:', token.human_id)

  return { human_id: token.human_id }
}
