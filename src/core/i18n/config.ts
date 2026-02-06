// NOTE: We only support English and Korean for now. Other locales are intentionally not managed.
export const locales = ['en', 'ko'] as const
export const defaultLocale = 'en'
export type Locale = (typeof locales)[number]
