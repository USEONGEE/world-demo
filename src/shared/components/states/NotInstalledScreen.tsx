'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/shared/components/ui'

export function NotInstalledScreen() {
  const t = useTranslations('notInstalled')

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
      <p className="text-gray-600 text-center mb-6">{t('description')}</p>
      <Button
        onClick={() => window.open('https://worldcoin.org/download', '_blank')}
      >
        {t('download')}
      </Button>
    </div>
  )
}
