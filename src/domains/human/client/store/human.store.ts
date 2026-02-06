'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MiniKit, VerificationLevel } from '@worldcoin/minikit-js'
import { analytics } from '@/core/analytics'
import type { HumanState, VerifyStatus } from '../../types'
import type { VerifyResponse, HumanMeResponse } from '@/shared/contracts'

// World ID action name
const VERIFY_ACTION = 'verify-human'

// Timeout for verify command (10 seconds)
const VERIFY_TIMEOUT = 10000
// Timeout for verify API call (10 seconds)
const VERIFY_API_TIMEOUT = 10000

interface HumanStore extends HumanState {}

export const useHumanStore = create<HumanStore>()(
  persist(
    (set, get) => ({
      humanId: null,
      isVerified: false,
      isLoading: false,
      error: null,
      status: 'idle' as VerifyStatus,
      isHydrated: false,

      verify: async () => {
        const state = get()
        if (state.isLoading) return

        set({ isLoading: true, error: null, status: 'verifying' })

        analytics.track({
          name: 'verify_start',
          properties: {},
          timestamp: new Date(),
        })

        try {
          // Check MiniKit installation
          if (!MiniKit.isInstalled()) {
            throw new Error('MiniKit is not installed')
          }

          // Call MiniKit verify command with timeout
          const verifyPromise = MiniKit.commandsAsync.verify({
            action: VERIFY_ACTION,
            verification_level: VerificationLevel.Device,
          })

          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Verification timeout')), VERIFY_TIMEOUT)
          )

          const result = await Promise.race([verifyPromise, timeoutPromise])

          // MiniKit returns finalPayload with verification result
          const payload = result.finalPayload

          // Check if verification was successful (status is in finalPayload)
          if ('status' in payload && payload.status !== 'success') {
            const errorMessage = String(payload.status ?? 'Verification failed')
            set({
              isLoading: false,
              error: errorMessage,
              status: 'error',
            })
            analytics.track({
              name: 'verify_fail',
              properties: { reason: errorMessage },
              timestamp: new Date(),
            })
            return
          }

          // Send proof to backend
          const controller = new AbortController()
          const apiTimeout = setTimeout(() => controller.abort(), VERIFY_API_TIMEOUT)

          // Ensure action is always present (MiniKit payload may omit it)
          const requestPayload = {
            ...payload,
            action: VERIFY_ACTION,
          }

          const response = await fetch('/api/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestPayload),
            signal: controller.signal,
          }).finally(() => clearTimeout(apiTimeout))

          if (!response.ok) {
            const errorData = await response.json()
            const errorMessage = errorData.error?.message ?? 'Backend verification failed'

            // Check if it's a duplicate verification
            if (errorData.error?.code === 'CONFLICT') {
              set({
                isLoading: false,
                error: null,
                status: 'duplicate',
              })
              analytics.track({
                name: 'verify_duplicate',
                properties: {},
                timestamp: new Date(),
              })
              return
            }

            throw new Error(errorMessage)
          }

          const data: VerifyResponse = await response.json()

          set({
            humanId: data.human_id,
            isVerified: true,
            isLoading: false,
            error: null,
            status: data.is_new ? 'success' : 'duplicate',
          })

          if (data.is_new) {
            analytics.track({
              name: 'verify_success',
              properties: { human_id: data.human_id },
              timestamp: new Date(),
            })
          } else {
            analytics.track({
              name: 'verify_duplicate',
              properties: { human_id: data.human_id },
              timestamp: new Date(),
            })
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error && error.name === 'AbortError'
              ? 'Verification timeout'
              : error instanceof Error
                ? error.message
                : 'Unknown error'
          set({
            isLoading: false,
            error: errorMessage,
            status: 'error',
          })
          analytics.track({
            name: 'verify_fail',
            properties: { reason: errorMessage },
            timestamp: new Date(),
          })
        }
      },

      checkSession: async () => {
        try {
          const response = await fetch('/api/human/me')

          if (response.ok) {
            const data: HumanMeResponse = await response.json()
            set({
              humanId: data.human_id,
              isVerified: true,
              status: 'success',
            })
          } else {
            // No valid session
            set({
              humanId: null,
              isVerified: false,
              status: 'idle',
            })
          }
        } catch {
          // Network error - keep current state
        }
      },

      reset: () => {
        set({
          humanId: null,
          isVerified: false,
          isLoading: false,
          error: null,
          status: 'idle',
        })
      },

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'world-gate-human',
      partialize: (state: HumanStore) => ({
        humanId: state.humanId,
        isVerified: state.isVerified,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated()
      },
    }
  )
)
