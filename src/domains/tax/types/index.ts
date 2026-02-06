export type SupportedCountry = 'KR'

export type CostBasisMethod = 'FIFO' | 'LIFO' | 'HIFO' | 'AVERAGE_COST'

export type TaxCalculateRequest = {
  chain_id: number
  year: number
  cost_basis_method?: CostBasisMethod | null
  country?: SupportedCountry | null
}

export type LotUsage = {
  lot_id: string
  amount_used: number
  cost_basis: number
  acquired_at: string
  holding_period_days: number
}

export type DisposalResult = {
  id: string
  asset: string
  amount_disposed: number
  proceeds: number
  cost_basis: number
  gain: number
  holding_period_days: number
  is_long_term: boolean
  lots_used: LotUsage[]
  disposed_at: string
  tx_hash?: string | null
  method: CostBasisMethod
}

export type TaxLot = {
  id: string
  asset: string
  amount: number
  remaining_amount: number
  cost_per_unit: number
  cost_basis_usd: number
  acquired_at: string
  tx_hash?: string | null
  source: string
  metadata?: Record<string, unknown> | null
}

export type KoreaTaxResult = {
  country?: SupportedCountry
  year: number
  currency?: string
  gross_gains: number
  gross_losses: number
  net_gains: number
  taxable_income: number
  total_tax: number
  effective_rate: number
  filing_deadline: string
  forms_required: string[]
  disposal_count: number
  by_asset: Record<string, Record<string, unknown>>
  basic_deduction: number
  national_tax: number
  local_tax: number
  exchange_rate_used: number
}

export type TaxCalculateResponseData = {
  taxResult: KoreaTaxResult
  lots: TaxLot[]
  disposals: DisposalResult[]
}

export type TaxCalculateResponse = {
  success: boolean
  data: TaxCalculateResponseData
}

export type ExportRequest = {
  chain_id: number
  year: number
}

export type ExportReportRow = {
  asset: string
  amount: number
  proceeds: number
  cost_basis: number
  gain: number
  disposed_at: string
  tx_hash: string
}

export type ExportReportData = {
  headers: string[]
  rows: ExportReportRow[]
}

export type ExportReportResponse = {
  success: boolean
  data: ExportReportData
}

export type ValidationError = {
  loc: Array<string | number>
  msg: string
  type: string
  input?: unknown
  ctx?: Record<string, unknown>
}

export type HttpValidationError = {
  detail?: ValidationError[]
}
