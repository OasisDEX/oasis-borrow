import { OasisStats } from 'features/homepage/OasisStats'
import { useFetch } from 'usehooks-ts'

export function useOasisStats() {
  return useFetch<OasisStats>('/api/stats')
}
