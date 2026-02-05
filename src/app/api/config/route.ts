import { successResponse } from '@/core/api'
import { locales, defaultLocale } from '@/core/i18n'

export async function GET() {
  return successResponse({
    appId: process.env.NEXT_PUBLIC_WLD_APP_ID,
    appName: process.env.NEXT_PUBLIC_APP_NAME || 'World Gate',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '0.0.1',
    supportedLanguages: locales,
    defaultLanguage: defaultLocale,
    features: {
      worldId: process.env.NEXT_PUBLIC_ENABLE_WORLD_ID === 'true',
      walletBinding: process.env.NEXT_PUBLIC_ENABLE_WALLET_BINDING === 'true',
    },
    contact: {
      email: process.env.NEXT_PUBLIC_DEVELOPER_EMAIL,
      supportUrl: process.env.NEXT_PUBLIC_SUPPORT_URL,
    },
  })
}
