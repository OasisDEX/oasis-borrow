import { Strategy } from '@oasisdex/dma-library'

export interface AjnaTxData {
  data: string
  to: string
  value: string
}

export interface AjnaSimulationValidationItem {
  name: string
  data?: { [key: string]: string }
}

export type AjnaSimulationData<P> = Strategy<P>['simulation']
