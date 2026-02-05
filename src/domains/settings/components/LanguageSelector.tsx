'use client'

import { Card } from '@/shared/components/ui'
import { locales, type Locale } from '@/core/i18n'
import { useLanguage } from '../hooks/useLanguage'

const languageNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  th: 'ไทย',
  ja: '日本語',
  ko: '한국어',
  pt: 'Português',
}

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()

  return (
    <Card>
      <h3 className="font-semibold mb-4">Language</h3>
      <div className="grid grid-cols-2 gap-2">
        {locales.map((locale) => (
          <button
            key={locale}
            onClick={() => setLanguage(locale)}
            className={`px-4 py-2 rounded-lg text-left transition-colors ${
              language === locale
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            {languageNames[locale]}
          </button>
        ))}
      </div>
    </Card>
  )
}
