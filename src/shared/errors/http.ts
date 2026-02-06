export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  CONFLICT: 'CONFLICT',
  VERIFICATION_FAILED: 'VERIFICATION_FAILED',
  INVALID_CHALLENGE: 'INVALID_CHALLENGE',
  ADDRESS_ALREADY_BOUND: 'ADDRESS_ALREADY_BOUND',
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
