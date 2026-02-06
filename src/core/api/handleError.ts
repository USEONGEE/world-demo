import { ApiError, ErrorCodes, type ErrorCode } from './errors'
import { errorResponse } from './response'

const DEFAULT_STATUS_MAP: Record<ErrorCode, number> = {
  [ErrorCodes.VALIDATION_ERROR]: 400,
  [ErrorCodes.NOT_FOUND]: 404,
  [ErrorCodes.INTERNAL_ERROR]: 500,
  [ErrorCodes.UNAUTHORIZED]: 401,
  [ErrorCodes.RATE_LIMITED]: 429,
  [ErrorCodes.CONFLICT]: 409,
  [ErrorCodes.VERIFICATION_FAILED]: 400,
  [ErrorCodes.INVALID_CHALLENGE]: 400,
  [ErrorCodes.ADDRESS_ALREADY_BOUND]: 409,
  [ErrorCodes.INVALID_BRIDGE_CODE]: 400,
  [ErrorCodes.BRIDGE_EXPIRED]: 400,
  [ErrorCodes.BRIDGE_ALREADY_USED]: 400,
}

export function handleApiError(
  error: unknown,
  route: string,
  statusMap: Partial<Record<ErrorCode, number>> = {}
) {
  if (error instanceof ApiError) {
    console.error(`[${route}] → ApiError:`, {
      code: error.code,
      message: error.message,
      details: error.details,
    })

    const status = statusMap[error.code] ?? DEFAULT_STATUS_MAP[error.code] ?? 500
    return errorResponse(error.code, error.message, status, error.details)
  }

  console.error(`[${route}] → Unexpected error:`, error)
  console.error(`[${route}] → Stack:`, error instanceof Error ? error.stack : 'no stack')
  return errorResponse(
    ErrorCodes.INTERNAL_ERROR,
    'An unexpected error occurred',
    500
  )
}
