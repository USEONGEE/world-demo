'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { useWalletStore } from '@/domains/wallet/client'
import { calculateTax, exportTaxReport, TaxRequestError } from '@/domains/tax/client'
import type {
  CostBasisMethod,
  ExportReportResponse,
  TaxCalculateResponseData,
} from '@/domains/tax'

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/
const YEAR_OPTIONS = [2025, 2026]
const CHAIN_OPTIONS = [480, 999]
const COST_BASIS_OPTIONS: CostBasisMethod[] = ['FIFO', 'LIFO', 'HIFO', 'AVERAGE_COST']

function formatNumber(value: number | undefined | null) {
  if (typeof value !== 'number') return '-'
  return value.toLocaleString()
}

function formatDate(value: string | undefined | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString()
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-gray-200 px-3 py-2">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  )
}

export default function TaxPage() {
  const t = useTranslations('tax')
  const router = useRouter()
  const searchParams = useSearchParams()
  const wallets = useWalletStore((state) => state.wallets)
  const walletsLoading = useWalletStore((state) => state.isLoading)
  const walletsError = useWalletStore((state) => state.error)
  const fetchWallets = useWalletStore((state) => state.fetchWallets)

  const addressParam = searchParams.get('address')?.trim() ?? ''
  const normalizedAddress = addressParam.toLowerCase()

  const [year, setYear] = useState<number>(2026)
  const [chainId, setChainId] = useState<number>(480)
  const [costBasis, setCostBasis] = useState<CostBasisMethod>('FIFO')
  const [status, setStatus] = useState<'idle' | 'calculating' | 'calculated' | 'exporting' | 'ready'>('idle')
  const [calculation, setCalculation] = useState<TaxCalculateResponseData | null>(null)
  const [exportReport, setExportReport] = useState<ExportReportResponse | null>(null)
  const [calculationError, setCalculationError] = useState<string | null>(null)
  const [calculationValidationErrors, setCalculationValidationErrors] = useState<string[]>([])
  const [exportError, setExportError] = useState<string | null>(null)
  const [copiedAddress, setCopiedAddress] = useState(false)
  const [copiedExport, setCopiedExport] = useState(false)

  const isAddressValid = ADDRESS_REGEX.test(addressParam)

  const ownedWallet = useMemo(
    () => wallets.find((wallet) => wallet.address.toLowerCase() === normalizedAddress),
    [normalizedAddress, wallets]
  )

  useEffect(() => {
    fetchWallets()
  }, [fetchWallets])

  useEffect(() => {
    setCalculation(null)
    setExportReport(null)
    setStatus('idle')
    setCalculationError(null)
    setCalculationValidationErrors([])
    setExportError(null)
  }, [addressParam, chainId, costBasis, year])

  useEffect(() => {
    if (!copiedAddress) return
    const timer = setTimeout(() => setCopiedAddress(false), 1500)
    return () => clearTimeout(timer)
  }, [copiedAddress])

  useEffect(() => {
    if (!copiedExport) return
    const timer = setTimeout(() => setCopiedExport(false), 1500)
    return () => clearTimeout(timer)
  }, [copiedExport])

  const handleCopyAddress = useCallback(async () => {
    if (!addressParam) return
    await navigator.clipboard.writeText(addressParam)
    setCopiedAddress(true)
  }, [addressParam])

  const handleCalculate = useCallback(async () => {
    if (!addressParam) return
    setStatus('calculating')
    setCalculationError(null)
    setCalculationValidationErrors([])
    setExportReport(null)

    try {
      const response = await calculateTax(addressParam, {
        chain_id: chainId,
        year,
        cost_basis_method: costBasis,
        country: 'KR',
      })

      if (!response.success) {
        throw new TaxRequestError(t('calculation_failed'), 500)
      }

      setCalculation(response.data)
      setStatus('calculated')
    } catch (error) {
      if (error instanceof TaxRequestError) {
        setCalculationError(
          error.validationErrors && error.validationErrors.length > 0
            ? t('validation_error')
            : error.message
        )
        setCalculationValidationErrors(error.validationErrors ?? [])
      } else {
        setCalculationError(error instanceof Error ? error.message : t('calculation_failed'))
      }
      setStatus('idle')
    }
  }, [addressParam, chainId, costBasis, t, year])

  const handleExport = useCallback(async () => {
    if (!addressParam) return
    setStatus('exporting')
    setExportError(null)

    try {
      const response = await exportTaxReport(addressParam, {
        chain_id: chainId,
        year,
      })

      if (!response.success) {
        throw new TaxRequestError(t('export_failed'), 500)
      }

      setExportReport(response)
      setStatus('ready')
    } catch (error) {
      if (error instanceof TaxRequestError) {
        setExportError(error.message)
      } else {
        setExportError(error instanceof Error ? error.message : t('export_failed'))
      }
      setStatus('calculated')
    }
  }, [addressParam, chainId, t, year])

  const exportJson = exportReport ? JSON.stringify(exportReport.data, null, 2) : ''

  const handleCopyExport = useCallback(async () => {
    if (!exportJson) return
    await navigator.clipboard.writeText(exportJson)
    setCopiedExport(true)
  }, [exportJson])

  const handleDownloadExport = useCallback(() => {
    if (!exportJson) return
    const filename = `tax-report-${addressParam}-${year}-${chainId}.json`
    const blob = new Blob([exportJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
  }, [addressParam, chainId, exportJson, year])

  if (!addressParam) {
    return (
      <div className="py-8 space-y-4">
        <Card>
          <div className="space-y-3 text-center">
            <h1 className="text-xl font-bold">{t('no_address')}</h1>
            <p className="text-sm text-gray-600">{t('no_address_description')}</p>
            <Button onClick={() => router.push('/wallet')} className="w-full">
              {t('back_to_wallet')}
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!isAddressValid) {
    return (
      <div className="py-8 space-y-4">
        <Card>
          <div className="space-y-3 text-center">
            <h1 className="text-xl font-bold">{t('address_invalid_title')}</h1>
            <p className="text-sm text-gray-600">{t('address_invalid_description')}</p>
            <Button onClick={() => router.push('/wallet')} className="w-full">
              {t('back_to_wallet')}
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (walletsLoading && wallets.length === 0) {
    return (
      <div className="py-8">
        <Card className="animate-pulse">
          <div className="h-20 bg-gray-100 rounded" />
        </Card>
      </div>
    )
  }

  if (walletsError) {
    return (
      <div className="py-8">
        <Card className="bg-red-50 border-red-200">
          <div className="space-y-3">
            <p className="text-sm text-red-600">{t('wallet_fetch_error')}</p>
            <Button onClick={fetchWallets} variant="secondary" className="w-full">
              {t('retry')}
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!ownedWallet) {
    return (
      <div className="py-8 space-y-4">
        <Card>
          <div className="space-y-3 text-center">
            <h1 className="text-xl font-bold">{t('address_not_owned_title')}</h1>
            <p className="text-sm text-gray-600">{t('address_not_owned_description')}</p>
            <Button onClick={() => router.push('/wallet')} className="w-full">
              {t('back_to_wallet')}
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-sm text-gray-600">{t('description')}</p>
      </div>

      <Card>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-xs text-gray-500 mb-1">{t('address_label')}</p>
            <p className="font-mono text-sm text-gray-900 break-all">{addressParam}</p>
          </div>
          <Button size="sm" variant="secondary" onClick={handleCopyAddress}>
            {copiedAddress ? t('copied') : t('copy')}
          </Button>
        </div>
      </Card>

      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('year')}</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                value={year}
                onChange={(event) => setYear(Number(event.target.value))}
              >
                {YEAR_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('chain_id')}</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                value={chainId}
                onChange={(event) => setChainId(Number(event.target.value))}
              >
                {CHAIN_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('cost_basis')}</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                value={costBasis}
                onChange={(event) => setCostBasis(event.target.value as CostBasisMethod)}
              >
                {COST_BASIS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {calculationError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              <p>{calculationError}</p>
              {calculationValidationErrors.length > 0 && (
                <ul className="mt-2 list-disc list-inside space-y-1 text-xs text-red-500">
                  {calculationValidationErrors.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button onClick={handleCalculate} disabled={status === 'calculating'}>
              {status === 'calculating' ? t('calculating') : t('calculate')}
            </Button>
            <Button
              onClick={handleExport}
              disabled={!calculation || status === 'exporting'}
              variant="secondary"
            >
              {status === 'exporting' ? t('exporting') : t('export')}
            </Button>
          </div>

          {exportError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {exportError}
            </div>
          )}
        </div>
      </Card>

      {calculation && (
        <Card>
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">{t('result_title')}</h2>
              <p className="text-xs text-gray-500">{t('result_description')}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SummaryItem label={t('gross_gains')} value={formatNumber(calculation.taxResult.gross_gains)} />
              <SummaryItem label={t('gross_losses')} value={formatNumber(calculation.taxResult.gross_losses)} />
              <SummaryItem label={t('net_gains')} value={formatNumber(calculation.taxResult.net_gains)} />
              <SummaryItem label={t('taxable_income')} value={formatNumber(calculation.taxResult.taxable_income)} />
              <SummaryItem label={t('total_tax')} value={formatNumber(calculation.taxResult.total_tax)} />
              <SummaryItem label={t('effective_rate')} value={`${calculation.taxResult.effective_rate.toFixed(2)}%`} />
              <SummaryItem label={t('disposal_count')} value={String(calculation.taxResult.disposal_count)} />
              <SummaryItem label={t('lots_count')} value={String(calculation.lots.length)} />
              <SummaryItem label={t('currency')} value={calculation.taxResult.currency ?? 'KRW'} />
              <SummaryItem label={t('exchange_rate')} value={formatNumber(calculation.taxResult.exchange_rate_used)} />
              <SummaryItem label={t('filing_deadline')} value={formatDate(calculation.taxResult.filing_deadline)} />
              <SummaryItem label={t('country')} value={calculation.taxResult.country ?? 'KR'} />
            </div>
          </div>
        </Card>
      )}

      {exportReport && (
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-semibold">{t('export_title')}</h2>
                <p className="text-xs text-gray-500">{t('export_description')}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={handleCopyExport}>
                  {copiedExport ? t('copied') : t('copy_json')}
                </Button>
                <Button size="sm" onClick={handleDownloadExport}>
                  {t('download_json')}
                </Button>
              </div>
            </div>
            <pre className="max-h-80 overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-gray-100">
              {exportJson}
            </pre>
          </div>
        </Card>
      )}
    </div>
  )
}
