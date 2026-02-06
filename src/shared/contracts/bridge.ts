import { z } from 'zod'

// 8-character Base32 code (A-H, J-N, P-Z, 2-9)
const BRIDGE_CODE_REGEX = /^[A-HJ-NP-Z2-9]{8}$/

export const BridgeConsumeRequestSchema = z.object({
  code: z.preprocess(
    (value) => (typeof value === 'string' ? value.trim().toUpperCase() : value),
    z.string().regex(BRIDGE_CODE_REGEX, 'Code must be 8 characters (A-H, J-N, P-Z, 2-9)')
  ),
})

export type BridgeConsumeRequest = z.infer<typeof BridgeConsumeRequestSchema>

export type BridgeIssueResponse = {
  code: string
  expires_at: string
}

export type BridgeConsumeResponse = {
  ok: boolean
}
