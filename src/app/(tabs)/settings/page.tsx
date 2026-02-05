'use client'

import { useTranslations } from 'next-intl'
import { LanguageSelector, DeveloperContact } from '@/domains/settings/client'

export default function SettingsPage() {
  const t = useTranslations('tabs')

  return (
    <div className="py-8 space-y-8">
      <h1 className="text-2xl font-bold">{t('settings')}</h1>
      <LanguageSelector />
      <DeveloperContact />
    </div>
  )
}
