import 'server-only'

import { randomInt } from 'crypto'
import { insertBridgeToken, markUnusedByHumanId } from '../repo'

// Bridge code TTL: 10 minutes
const BRIDGE_TTL_MS = 10 * 60 * 1000

// 8-char Base32 alphabet without O/0 and I/1
const BRIDGE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const BRIDGE_CODE_LENGTH = 8

// Max retries for code collision
const MAX_RETRIES = 3

export type IssueBridgeResult = {
  code: string
  expires_at: string
}

const log = (msg: string, data?: unknown) =>
  console.log(`[issueBridge] ${msg}`, data !== undefined ? data : '')

const logError = (msg: string, data?: unknown) =>
  console.error(`[issueBridge] ${msg}`, data !== undefined ? data : '')

/**
 * Generate an 8-character bridge code and store in DB
 */
export async function issueBridge(humanId: string): Promise<IssueBridgeResult> {
  log('called for human:', humanId)

  const now = new Date()
  const expiresAt = new Date(now.getTime() + BRIDGE_TTL_MS).toISOString()

  // Invalidate any previous unused codes for this human
  log('marking previous unused codes')
  await markUnusedByHumanId(humanId)

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    let code = ''
    for (let i = 0; i < BRIDGE_CODE_LENGTH; i++) {
      code += BRIDGE_ALPHABET[randomInt(0, BRIDGE_ALPHABET.length)]
    }

    log(`attempt ${attempt + 1}: generated code=${code}`)

    try {
      await insertBridgeToken({
        human_id: humanId,
        code,
        expires_at: expiresAt,
      })

      log('bridge token inserted successfully')
      return { code, expires_at: expiresAt }
    } catch (error: unknown) {
      // Unique constraint violation → retry
      const pgError = error as { code?: string }
      if (pgError.code === '23505' && attempt < MAX_RETRIES - 1) {
        log('code collision (23505), retrying...')
        continue
      }
      logError('insert failed:', error)
      throw error
    }
  }

  // Should never reach here due to throw above
  throw new Error('Failed to generate unique bridge code')
}
