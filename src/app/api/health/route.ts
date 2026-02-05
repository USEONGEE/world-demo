import { successResponse } from '@/core/api'

export async function GET() {
  return successResponse({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || '0.0.1',
  })
}
