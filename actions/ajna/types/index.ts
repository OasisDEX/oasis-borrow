import { Strategy } from '@oasisdex/oasis-actions-poc/src/types/common'

export interface AjnaTxData {
  data: string
  to: string
  value: string
}

export interface AjnaValidationItem {
  name: string
  data?: { [key: string]: string }
}

export type AjnaSimulationData<P> = Strategy<P>['simulation']
