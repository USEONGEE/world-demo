import 'server-only'

import { verifyCloudProof, VerificationLevel, type IVerifyResponse } from '@worldcoin/minikit-js'
import { VerifyPayloadSchema, type VerifyPayload } from '@/shared/contracts'
import { ApiError, ErrorCodes } from '@/shared/errors'
import { createSessionToken, getSession } from '@/core/session'
import { findHumanByActionNullifier, insertHuman } from '../repo'
import type { Human } from '../types'

export type VerifyHumanResult = {
  human_id: string
  is_new: boolean
  sessionToken: string
}

// Timeout for verifyCloudProof (10 seconds)
const VERIFY_TIMEOUT = 10000
// Max retries for verifyCloudProof
const MAX_RETRIES = 1

const log = (msg: string, data?: unknown) =>
  console.log(`[verifyHuman] ${msg}`, data !== undefined ? data : '')

const logError = (msg: string, data?: unknown) =>
  console.error(`[verifyHuman] ${msg}`, data !== undefined ? data : '')

/**
 * Verify World ID proof and create or retrieve human record
 */
export async function verifyHuman(payload: unknown): Promise<VerifyHumanResult> {
  log('called with payload:', JSON.stringify(payload, null, 2))

  // 1. Validate payload with Zod
  const parseResult = VerifyPayloadSchema.safeParse(payload)
  if (!parseResult.success) {
    logError('Zod validation failed:', parseResult.error.flatten())
    throw new ApiError(
      ErrorCodes.VALIDATION_ERROR,
      'Invalid verify payload',
      parseResult.error.flatten()
    )
  }

  const data = parseResult.data as VerifyPayload
  log('parsed payload:', {
    action: data.action,
    status: data.status,
    verification_level: data.verification_level,
    proof: data.proof?.slice(0, 20) + '...',
    merkle_root: data.merkle_root?.slice(0, 20) + '...',
    nullifier_hash: data.nullifier_hash?.slice(0, 20) + '...',
    signal: data.signal,
  })

  // 2. Check status if present (FE payload may include status)
  if (data.status && data.status !== 'success') {
    logError('status is not success:', data.status)
    throw new ApiError(
      ErrorCodes.VALIDATION_ERROR,
      `Verification status is not success: ${data.status}`,
    )
  }

  // 3. Verify proof with World ID (with timeout and retry)
  const appId = process.env.WLD_APP_ID as `app_${string}` | undefined
  log('WLD_APP_ID:', appId ? `${appId.slice(0, 8)}...` : 'NOT SET')

  if (!appId) {
    logError('WLD_APP_ID not configured')
    throw new ApiError(ErrorCodes.INTERNAL_ERROR, 'WLD_APP_ID not configured')
  }

  const verificationLevel = (data.verification_level as VerificationLevel) ?? VerificationLevel.Device
  log('using verification_level:', verificationLevel)

  let verifyResponse: IVerifyResponse | null = null
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    log(`verifyCloudProof attempt ${attempt + 1}/${MAX_RETRIES + 1}`)
    try {
      verifyResponse = await Promise.race([
        verifyCloudProof(
          {
            proof: data.proof,
            merkle_root: data.merkle_root,
            nullifier_hash: data.nullifier_hash,
            verification_level: verificationLevel,
          },
          appId,
          data.action,
          data.signal
        ),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Verification timeout')), VERIFY_TIMEOUT)
        ),
      ])
      log('verifyCloudProof response:', JSON.stringify(verifyResponse))
      break // Success, exit retry loop
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      logError(`verifyCloudProof attempt ${attempt + 1} failed:`, lastError.message)
      if (attempt < MAX_RETRIES) {
        log('retrying in 1s...')
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }
  }

  if (!verifyResponse) {
    logError('all verifyCloudProof attempts failed, lastError:', lastError?.message)
    throw new ApiError(
      ErrorCodes.VERIFICATION_FAILED,
      lastError?.message ?? 'Failed to verify proof'
    )
  }

  if (!verifyResponse.success) {
    const code = (verifyResponse as { code?: string }).code
    if (code === 'max_verifications_reached') {
      // World ID: same person already verified for this action.
      // Treat as valid for session re-issuance / DB lookup.
      log('verifyCloudProof returned max_verifications_reached; treating as already verified')
    } else {
      logError('verifyCloudProof returned failure:', {
        success: verifyResponse.success,
        detail: verifyResponse.detail,
        code,
      })
      throw new ApiError(
        ErrorCodes.VERIFICATION_FAILED,
        verifyResponse.detail ?? 'Proof verification failed'
      )
    }
  }

  // 4. Check for existing human with same nullifier
  log('looking up existing human:', { action: data.action, nullifier_hash: data.nullifier_hash.slice(0, 20) + '...' })
  const existingHuman = await findHumanByActionNullifier(data.action, data.nullifier_hash)

  let human: Human
  let isNew: boolean

  if (existingHuman) {
    log('found existing human:', existingHuman.id)
    human = existingHuman
    isNew = false
  } else {
    log('no existing human, creating new record')
    human = await insertHuman({
      action: data.action,
      nullifier_hash: data.nullifier_hash,
    })
    log('created human:', human.id)
    isNew = true
  }

  // 5. Create session token
  const sessionToken = await createSessionToken({ human_id: human.id })
  log('session token created, human_id:', human.id)

  return {
    human_id: human.id,
    is_new: isNew,
    sessionToken,
  }
}

/**
 * Get current human from session cookie
 */
export async function getCurrentHuman(): Promise<{ human_id: string } | null> {
  const session = await getSession()

  if (!session) {
    return null
  }

  return { human_id: session.human_id }
}
