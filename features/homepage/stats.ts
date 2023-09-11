import { useFetch } from 'usehooks-ts'

import { OasisStats } from './OasisStats'

export function useOasisStats() {
  return useFetch<OasisStats>('/api/stats')
}
