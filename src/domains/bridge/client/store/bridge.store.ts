'use client'

import { create } from 'zustand'
import { analytics } from '@/core/analytics'
import type { BridgeIssueResponse } from '@/shared/contracts'

const API_TIMEOUT = 10000

interface BridgeStore {
  code: string | null
  expiresAt: string | null
  isLoading: boolean
  error: string | null

  issueBridge: () => Promise<void>
  reset: () => void
}

export const useBridgeStore = create<BridgeStore>()((set, get) => ({
  code: null,
  expiresAt: null,
  isLoading: false,
  error: null,

  issueBridge: async () => {
    const state = get()
    if (state.isLoading) return

    set({ isLoading: true, error: null })
    let failureReason: string | null = null

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), API_TIMEOUT)

      const response = await fetch('/api/bridge/issue', {
        method: 'POST',
        signal: controller.signal,
      }).finally(() => clearTimeout(timeout))

      if (!response.ok) {
        const errorData = await response.json()
        failureReason = errorData.error?.code ?? errorData.error?.message ?? 'Failed to issue bridge code'
        throw new Error(errorData.error?.message ?? 'Failed to issue bridge code')
      }

      const data: BridgeIssueResponse = await response.json()

      analytics.track({
        name: 'bridge_code_issued',
        properties: { expires_at: data.expires_at },
        timestamp: new Date(),
      })

      set({
        code: data.code,
        expiresAt: data.expires_at,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error && error.name === 'AbortError'
          ? 'Request timeout'
          : error instanceof Error
            ? error.message
            : 'Unknown error'

      analytics.track({
        name: 'bridge_code_issue_fail',
        properties: { reason: failureReason ?? errorMessage },
        timestamp: new Date(),
      })

      set({
        isLoading: false,
        error: errorMessage,
      })
    }
  },

  reset: () => {
    set({
      code: null,
      expiresAt: null,
      isLoading: false,
      error: null,
    })
  },
}))
