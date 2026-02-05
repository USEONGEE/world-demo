'use client'

import { useHuman } from './useHuman'

/**
 * Specialized hook for verify functionality
 */
export function useVerify() {
  const { verify, isLoading, error, status, reset } = useHuman()

  return {
    verify,
    isVerifying: isLoading,
    error,
    status,
    isSuccess: status === 'success',
    isDuplicate: status === 'duplicate',
    isError: status === 'error',
    reset,
  }
}
