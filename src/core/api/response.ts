import { NextResponse } from 'next/server'
import { ErrorCode } from './errors'

export function successResponse<T>(data: T) {
  return NextResponse.json(data)
}

export function errorResponse(
  code: ErrorCode,
  message: string,
  status: number,
  details?: unknown
) {
  return NextResponse.json(
    {
      error: { code, message, details },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    },
    { status }
  )
}
