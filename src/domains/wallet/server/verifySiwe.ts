import 'server-only'

import { SiweMessage } from 'siwe'
import { createPublicClient, http, hashMessage } from 'viem'
import { worldchain } from 'viem/chains'
import { ApiError, ErrorCodes } from '@/shared/errors'
import {
  findChallengeByNonce,
  markChallengeUsed,
  findWalletBindingByChainAddress,
  insertWalletBinding,
} from '../repo'

const DEFAULT_CHAIN = 'evm'
const VERIFICATION_METHOD = 'SIWE'

export type VerifySiweResult = {
  address: string
  bound: boolean
  idempotent?: boolean
}

// EIP-1271 magic value
const EIP1271_MAGIC_VALUE = '0x1626ba7e'

// Public client for EIP-1271 verification
const publicClient = createPublicClient({
  chain: worldchain,
  transport: http(),
})

const log = (msg: string, data?: unknown) =>
  console.log(`[verifySiwe] ${msg}`, data !== undefined ? data : '')

const logError = (msg: string, data?: unknown) =>
  console.error(`[verifySiwe] ${msg}`, data !== undefined ? data : '')

/**
 * Verify SIWE signature and bind wallet to human
 */
export async function verifySiwe(
  humanId: string,
  payload: { message: string; signature: string },
  nonce: string
): Promise<VerifySiweResult> {
  log('called:', { humanId, nonce, messageLen: payload.message.length })

  // 1. Find challenge by nonce
  const challenge = await findChallengeByNonce(nonce)
  log('findChallengeByNonce result:', challenge ? { id: challenge.id, human_id: challenge.human_id, used: challenge.used } : null)

  if (!challenge) {
    logError('challenge not found for nonce:', nonce)
    throw new ApiError(
      ErrorCodes.INVALID_CHALLENGE,
      'Challenge not found',
    )
  }

  // 2. Validate challenge state
  if (challenge.used) {
    logError('challenge already used')
    throw new ApiError(
      ErrorCodes.INVALID_CHALLENGE,
      'Challenge already used',
    )
  }

  const now = new Date()
  const expirationTime = new Date(challenge.expiration_time)
  log('expiry check:', { now: now.toISOString(), expirationTime: expirationTime.toISOString(), isExpired: now > expirationTime })

  if (now > expirationTime) {
    logError('challenge expired')
    throw new ApiError(
      ErrorCodes.INVALID_CHALLENGE,
      'Challenge expired',
    )
  }

  if (challenge.human_id !== humanId) {
    logError('human_id mismatch:', { expected: challenge.human_id, got: humanId })
    throw new ApiError(
      ErrorCodes.INVALID_CHALLENGE,
      'Challenge does not belong to this user',
    )
  }

  // 3. Parse and verify SIWE message
  let siweMessage: SiweMessage
  try {
    siweMessage = new SiweMessage(payload.message)
    log('parsed SIWE message:', { address: siweMessage.address, nonce: siweMessage.nonce, domain: siweMessage.domain })
  } catch (err) {
    logError('failed to parse SIWE message:', err)
    throw new ApiError(
      ErrorCodes.INVALID_CHALLENGE,
      'Invalid SIWE message format',
    )
  }

  if (siweMessage.nonce !== nonce) {
    logError('nonce mismatch:', { expected: nonce, got: siweMessage.nonce })
    throw new ApiError(
      ErrorCodes.INVALID_CHALLENGE,
      'Nonce mismatch',
    )
  }

  // 4. Verify signature (EIP-191 first, then EIP-1271 for smart wallets)
  const address = siweMessage.address.toLowerCase()
  let isValidSignature = false

  try {
    log('trying EIP-191 verification...')
    await siweMessage.verify({
      signature: payload.signature,
      nonce,
    })
    isValidSignature = true
    log('EIP-191 verification succeeded')
  } catch (eip191Error) {
    log('EIP-191 failed, trying EIP-1271...', eip191Error instanceof Error ? eip191Error.message : eip191Error)
    try {
      const result = await publicClient.readContract({
        address: address as `0x${string}`,
        abi: [
          {
            name: 'isValidSignature',
            type: 'function',
            stateMutability: 'view',
            inputs: [
              { name: 'hash', type: 'bytes32' },
              { name: 'signature', type: 'bytes' },
            ],
            outputs: [{ name: 'magicValue', type: 'bytes4' }],
          },
        ],
        functionName: 'isValidSignature',
        args: [
          hashMessage(payload.message),
          payload.signature as `0x${string}`,
        ],
      })
      isValidSignature = result === EIP1271_MAGIC_VALUE
      log('EIP-1271 result:', { result, isValid: isValidSignature })
    } catch (eip1271Error) {
      logError('EIP-1271 also failed:', eip1271Error instanceof Error ? eip1271Error.message : eip1271Error)
      isValidSignature = false
    }
  }

  if (!isValidSignature) {
    logError('signature verification failed for address:', address)
    throw new ApiError(
      ErrorCodes.VERIFICATION_FAILED,
      'Invalid signature',
    )
  }

  // 5. Check for existing binding
  log('checking existing binding:', { chain: DEFAULT_CHAIN, address })
  const existingBinding = await findWalletBindingByChainAddress(DEFAULT_CHAIN, address)

  if (existingBinding) {
    log('existing binding found:', { human_id: existingBinding.human_id, isSame: existingBinding.human_id === humanId })

    if (existingBinding.human_id === humanId) {
      await markChallengeUsed(challenge.id)
      log('idempotent binding, returning')
      return {
        address,
        bound: true,
        idempotent: true,
      }
    }

    logError('address already bound to different human')
    throw new ApiError(
      ErrorCodes.ADDRESS_ALREADY_BOUND,
      'This wallet address is already bound to another account',
    )
  }

  // 6. Create binding and mark challenge as used
  log('creating new binding')
  await markChallengeUsed(challenge.id)

  await insertWalletBinding({
    human_id: humanId,
    chain: DEFAULT_CHAIN,
    address,
    verification_method: VERIFICATION_METHOD,
  })

  log('binding created successfully')

  return {
    address,
    bound: true,
  }
}
