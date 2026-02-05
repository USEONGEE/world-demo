'use client'

import { useTranslations } from 'next-intl'

export default function HomePage() {
  const t = useTranslations('home')

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold mb-4">{t('welcome')}</h1>
      <p className="text-gray-600">{t('description')}</p>
    </div>
  )
}
