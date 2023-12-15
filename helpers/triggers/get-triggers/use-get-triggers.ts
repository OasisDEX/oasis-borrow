import { useFetch } from 'usehooks-ts'

import { getTriggersConfig } from './get-triggers-config'
import type { GetTriggersParams, GetTriggersResponse } from './get-triggers-types'

export const useGetTriggers = (params: GetTriggersParams) => {
  const { url } = getTriggersConfig(params)
  return useFetch<GetTriggersResponse>(url)
}
