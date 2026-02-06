import { z } from 'zod'

// Ethereum address regex (0x followed by 40 hex characters)
const addressRegex = /^0x[a-fA-F0-9]{40}$/

// Zod schemas for SIWE
export const SiweChallengeRequestSchema = z.object({
  address: z.string().regex(addressRegex, 'Invalid Ethereum address'),
})

export const SiweVerifyRequestSchema = z.object({
  payload: z.object({
    message: z.string().min(1, 'message is required'),
    signature: z.string().min(1, 'signature is required'),
  }),
  nonce: z.string().min(1, 'nonce is required'),
})

// Type exports
export type SiweChallengeRequest = z.infer<typeof SiweChallengeRequestSchema>

export type SiweChallengeResponse = {
  nonce: string
  issued_at: string
  expiration_time: string
}

export type SiweVerifyRequest = z.infer<typeof SiweVerifyRequestSchema>

export type SiweVerifyResponse = {
  address: string
  bound: boolean
  idempotent?: boolean
}

export type WalletsResponse = {
  wallets: Array<{
    address: string
    chain: string
    verified_at: string
    verification_method: string
  }>
}
