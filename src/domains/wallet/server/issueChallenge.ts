import 'server-only'

import { generateNonce } from 'siwe'
import { getSession } from '@/core/session'
import { ApiError, ErrorCodes } from '@/shared/errors'
import { insertChallenge } from '../repo'

// Challenge validity period: 10 minutes
const CHALLENGE_VALIDITY_MS = 10 * 60 * 1000

export type IssueChallengeResult = {
  nonce: string
  issued_at: string
  expiration_time: string
}

const log = (msg: string, data?: unknown) =>
  console.log(`[issueChallenge] ${msg}`, data !== undefined ? data : '')

/**
 * Issue a SIWE challenge for wallet binding
 */
export async function issueChallenge(
  humanId: string,
  address: string
): Promise<IssueChallengeResult> {
  log('called:', { humanId, address })

  // Generate nonce using siwe library
  const nonce = generateNonce()

  const now = new Date()
  const issuedAt = now.toISOString()
  const expirationTime = new Date(now.getTime() + CHALLENGE_VALIDITY_MS).toISOString()

  log('inserting challenge:', { nonce, issuedAt, expirationTime })

  // Store challenge in DB
  await insertChallenge({
    human_id: humanId,
    address: address.toLowerCase(),
    nonce,
    issued_at: issuedAt,
    expiration_time: expirationTime,
  })

  log('challenge inserted successfully')

  return {
    nonce,
    issued_at: issuedAt,
    expiration_time: expirationTime,
  }
}
