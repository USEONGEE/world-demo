import 'server-only'

import { SiweMessage } from 'siwe'
import { createPublicClient, http, verifyMessage } from 'viem'
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

/**
 * Verify SIWE signature and bind wallet to human
 */
export async function verifySiwe(
  humanId: string,
  payload: { message: string; signature: string },
  nonce: string
): Promise<VerifySiweResult> {
  // 1. Find challenge by nonce
  const challenge = await findChallengeByNonce(nonce)

  if (!challenge) {
    throw new ApiError(
      ErrorCodes.INVALID_CHALLENGE,
      'Challenge not found',
    )
  }

  // 2. Validate challenge state
  // Check if already used
  if (challenge.used) {
    throw new ApiError(
      ErrorCodes.INVALID_CHALLENGE,
      'Challenge already used',
    )
  }

  // Check if expired
  const now = new Date()
  const expirationTime = new Date(challenge.expiration_time)
  if (now > expirationTime) {
    throw new ApiError(
      ErrorCodes.INVALID_CHALLENGE,
      'Challenge expired',
    )
  }

  // Check if human_id matches
  if (challenge.human_id !== humanId) {
    throw new ApiError(
      ErrorCodes.INVALID_CHALLENGE,
      'Challenge does not belong to this user',
    )
  }

  // 3. Parse and verify SIWE message
  let siweMessage: SiweMessage
  try {
    siweMessage = new SiweMessage(payload.message)
  } catch {
    throw new ApiError(
      ErrorCodes.INVALID_CHALLENGE,
      'Invalid SIWE message format',
    )
  }

  // Verify nonce matches
  if (siweMessage.nonce !== nonce) {
    throw new ApiError(
      ErrorCodes.INVALID_CHALLENGE,
      'Nonce mismatch',
    )
  }

  // 4. Verify signature (EIP-191 first, then EIP-1271 for smart wallets)
  const address = siweMessage.address.toLowerCase()
  let isValidSignature = false

  try {
    // Try EIP-191 (EOA)
    await siweMessage.verify({
      signature: payload.signature,
      nonce,
    })
    isValidSignature = true
  } catch {
    // Try EIP-1271 (Smart Contract Wallet)
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
          // Hash the message according to EIP-191
          await hashMessage(payload.message),
          payload.signature as `0x${string}`,
        ],
      })
      isValidSignature = result === EIP1271_MAGIC_VALUE
    } catch {
      isValidSignature = false
    }
  }

  if (!isValidSignature) {
    throw new ApiError(
      ErrorCodes.VERIFICATION_FAILED,
      'Invalid signature',
    )
  }

  // 5. Check for existing binding
  const existingBinding = await findWalletBindingByChainAddress(DEFAULT_CHAIN, address)

  if (existingBinding) {
    // Same human_id - idempotent
    if (existingBinding.human_id === humanId) {
      // Mark challenge as used even for idempotent case
      await markChallengeUsed(challenge.id)

      return {
        address,
        bound: true,
        idempotent: true,
      }
    }

    // Different human_id - conflict
    throw new ApiError(
      ErrorCodes.ADDRESS_ALREADY_BOUND,
      'This wallet address is already bound to another account',
    )
  }

  // 6. Create binding and mark challenge as used
  await markChallengeUsed(challenge.id)

  await insertWalletBinding({
    human_id: humanId,
    chain: DEFAULT_CHAIN,
    address,
    verification_method: VERIFICATION_METHOD,
  })

  return {
    address,
    bound: true,
  }
}

// Helper to hash message for EIP-1271
async function hashMessage(message: string): Promise<`0x${string}`> {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const prefix = encoder.encode(`\x19Ethereum Signed Message:\n${data.length}`)
  const combined = new Uint8Array(prefix.length + data.length)
  combined.set(prefix)
  combined.set(data, prefix.length)

  const hashBuffer = await crypto.subtle.digest('SHA-256', combined)
  const hashArray = new Uint8Array(hashBuffer)
  return `0x${Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('')}` as `0x${string}`
}
