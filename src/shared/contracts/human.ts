import { z } from 'zod'

// Zod schema for verify payload
export const VerifyPayloadSchema = z
  .object({
    action: z.string().min(1, 'action is required'),
    proof: z.string().min(1, 'proof is required'),
    merkle_root: z.string().min(1, 'merkle_root is required'),
    nullifier_hash: z.string().min(1, 'nullifier_hash is required'),
    // Optional fields from MiniKit
    status: z.enum(['success', 'error']).optional(),
    verification_level: z.enum(['orb', 'device', 'secure_document']).optional(),
    signal: z.string().optional(),
  })
  .passthrough() // Allow extra fields

export type VerifyPayload = z.infer<typeof VerifyPayloadSchema>

export type VerifyRequest = {
  action: string
  proof: string
  merkle_root: string
  nullifier_hash: string
  verification_level?: string
  signal?: string
}

export type VerifyResponse = {
  human_id: string
  is_new: boolean
}

export type HumanMeResponse = {
  human_id: string
}
