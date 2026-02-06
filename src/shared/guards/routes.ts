const PUBLIC_PATHS = ['/', '/home', '/bridge', '/consent'] as const
const SESSION_CHECK_PATHS = ['/home'] as const
const MINIKIT_OPTIONAL_PATHS = ['/home'] as const

function normalizePath(pathname: string | null): string {
  if (!pathname) return '/'
  if (pathname !== '/' && pathname.endsWith('/')) {
    return pathname.slice(0, -1)
  }
  return pathname
}

export function isPublicRoute(pathname: string | null): boolean {
  const path = normalizePath(pathname)
  return PUBLIC_PATHS.includes(path as (typeof PUBLIC_PATHS)[number])
}

export function shouldCheckSession(pathname: string | null): boolean {
  const path = normalizePath(pathname)
  if (!isPublicRoute(path)) return true
  return SESSION_CHECK_PATHS.includes(path as (typeof SESSION_CHECK_PATHS)[number])
}

export function allowWithoutMiniKit(pathname: string | null): boolean {
  const path = normalizePath(pathname)
  return MINIKIT_OPTIONAL_PATHS.includes(path as (typeof MINIKIT_OPTIONAL_PATHS)[number])
}
