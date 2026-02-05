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

/**
 * Verify World ID proof and create or retrieve human record
 */
export async function verifyHuman(payload: unknown): Promise<VerifyHumanResult> {
  // 1. Validate payload with Zod
  const parseResult = VerifyPayloadSchema.safeParse(payload)
  if (!parseResult.success) {
    throw new ApiError(
      ErrorCodes.VALIDATION_ERROR,
      'Invalid verify payload',
      parseResult.error.flatten()
    )
  }

  const data = parseResult.data as VerifyPayload

  // 2. Check status if present (FE payload may include status)
  if (data.status && data.status !== 'success') {
    throw new ApiError(
      ErrorCodes.VALIDATION_ERROR,
      `Verification status is not success: ${data.status}`,
    )
  }

  // 3. Verify proof with World ID (with timeout and retry)
  const appId = process.env.WLD_APP_ID as `app_${string}` | undefined
  if (!appId) {
    throw new ApiError(ErrorCodes.INTERNAL_ERROR, 'WLD_APP_ID not configured')
  }

  let verifyResponse: IVerifyResponse | null = null
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      verifyResponse = await Promise.race([
        verifyCloudProof(
          {
            proof: data.proof,
            merkle_root: data.merkle_root,
            nullifier_hash: data.nullifier_hash,
            verification_level: (data.verification_level as VerificationLevel) ?? VerificationLevel.Orb,
          },
          appId,
          data.action,
          data.signal
        ),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Verification timeout')), VERIFY_TIMEOUT)
        ),
      ])
      break // Success, exit retry loop
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      if (attempt < MAX_RETRIES) {
        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }
  }

  if (!verifyResponse) {
    throw new ApiError(
      ErrorCodes.VERIFICATION_FAILED,
      lastError?.message ?? 'Failed to verify proof'
    )
  }

  if (!verifyResponse.success) {
    throw new ApiError(
      ErrorCodes.VERIFICATION_FAILED,
      verifyResponse.detail ?? 'Proof verification failed'
    )
  }

  // 4. Check for existing human with same nullifier
  const existingHuman = await findHumanByActionNullifier(data.action, data.nullifier_hash)

  let human: Human
  let isNew: boolean

  if (existingHuman) {
    // Already verified with this nullifier
    human = existingHuman
    isNew = false
  } else {
    // Create new human record
    human = await insertHuman({
      action: data.action,
      nullifier_hash: data.nullifier_hash,
    })
    isNew = true
  }

  // 5. Create session token
  const sessionToken = await createSessionToken({ human_id: human.id })

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
