import { AnalyticsTracker } from './types'
import { ConsoleTracker } from './console.tracker'

export const analytics: AnalyticsTracker = new ConsoleTracker()
