import type {
  ExportReportResponse,
  ExportRequest,
  HttpValidationError,
  TaxCalculateRequest,
  TaxCalculateResponse,
  ValidationError,
} from '@/domains/tax'

const API_TIMEOUT_MS = 20000

export class TaxRequestError extends Error {
  status: number
  validationErrors?: string[]

  constructor(message: string, status: number, validationErrors?: string[]) {
    super(message)
    this.name = 'TaxRequestError'
    this.status = status
    this.validationErrors = validationErrors
  }
}

function formatValidationErrors(errors?: ValidationError[]): string[] {
  if (!errors || errors.length === 0) return []
  return errors.map((error) => {
    const path = error.loc?.join('.') ?? 'request'
    return `${path}: ${error.msg}`
  })
}

function parseErrorPayload(payload: unknown, fallback: string): { message: string; validationErrors?: string[] } {
  if (!payload || typeof payload !== 'object') {
    return { message: fallback }
  }

  const maybeValidation = payload as HttpValidationError
  const validationErrors = formatValidationErrors(maybeValidation.detail)
  if (validationErrors.length > 0) {
    return { message: 'Validation error', validationErrors }
  }

  const maybeError = payload as { error?: { message?: string } }
  if (maybeError.error?.message) {
    return { message: maybeError.error.message }
  }

  const maybeMessage = payload as { message?: string }
  if (maybeMessage.message) {
    return { message: maybeMessage.message }
  }

  return { message: fallback }
}

async function requestJson<T>(url: string, init: RequestInit, timeoutMs = API_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, { ...init, signal: controller.signal })
    const contentType = response.headers.get('content-type') ?? ''
    const isJson = contentType.includes('application/json')
    const payload = isJson ? await response.json().catch(() => null) : null

    if (!response.ok) {
      const { message, validationErrors } = parseErrorPayload(payload, response.statusText || 'Request failed')
      throw new TaxRequestError(message, response.status, validationErrors)
    }

    return payload as T
  } catch (error) {
    if (error instanceof TaxRequestError) throw error
    if (error instanceof Error && error.name === 'AbortError') {
      throw new TaxRequestError('Request timeout', 408)
    }
    const message = error instanceof Error ? error.message : 'Request failed'
    throw new TaxRequestError(message, 500)
  } finally {
    clearTimeout(timeout)
  }
}

export async function calculateTax(address: string, body: TaxCalculateRequest): Promise<TaxCalculateResponse> {
  return requestJson<TaxCalculateResponse>(`/api/tax/${encodeURIComponent(address)}/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export async function exportTaxReport(address: string, body: ExportRequest): Promise<ExportReportResponse> {
  return requestJson<ExportReportResponse>(`/api/tax/${encodeURIComponent(address)}/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
