export const locales = ['en', 'es', 'th', 'ja', 'ko', 'pt'] as const
export const defaultLocale = 'en'
export type Locale = (typeof locales)[number]
