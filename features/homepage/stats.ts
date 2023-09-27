import { useFetch } from 'usehooks-ts'

import type { OasisStats } from './OasisStats'

export function useOasisStats() {
  return useFetch<OasisStats>('/api/stats')
}
