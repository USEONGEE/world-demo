export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  RATE_LIMITED: 'RATE_LIMITED',
  CONFLICT: 'CONFLICT',
  VERIFICATION_FAILED: 'VERIFICATION_FAILED',
  INVALID_CHALLENGE: 'INVALID_CHALLENGE',
  ADDRESS_ALREADY_BOUND: 'ADDRESS_ALREADY_BOUND',
  INVALID_BRIDGE_CODE: 'INVALID_BRIDGE_CODE',
  BRIDGE_EXPIRED: 'BRIDGE_EXPIRED',
  BRIDGE_ALREADY_USED: 'BRIDGE_ALREADY_USED',
} as const

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]

export class ApiError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
