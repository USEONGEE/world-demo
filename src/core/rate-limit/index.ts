export type RateLimitResult = {
  allowed: boolean
  remaining: number
  resetAt: number
}

type RateLimitEntry = {
  timestamps: number[]
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now()
  const windowStart = now - windowMs

  const entry = rateLimitStore.get(key)
  const timestamps = entry?.timestamps.filter((ts) => ts > windowStart) ?? []

  if (timestamps.length >= limit) {
    const oldest = timestamps[0] ?? now
    const resetAt = oldest + windowMs
    rateLimitStore.set(key, { timestamps })
    return {
      allowed: false,
      remaining: 0,
      resetAt,
    }
  }

  const nextTimestamps = [...timestamps, now]
  rateLimitStore.set(key, { timestamps: nextTimestamps })

  return {
    allowed: true,
    remaining: Math.max(0, limit - nextTimestamps.length),
    resetAt: now + windowMs,
  }
}
