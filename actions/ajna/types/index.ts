import { AjnaPosition } from '@oasisdex/oasis-actions/lib/packages/oasis-actions/src/helpers/ajna'

export interface AjnaTxData {
  data: string
  to: string
  value: string
}

export interface AjnaValidationItem {
  name: string
  data?: {[key: string]: string}
}

export interface AjnaSimulationData {
  position: AjnaPosition
  swap: any[]
  errors: AjnaValidationItem[]
  warnings: AjnaValidationItem[]
}

// TODO use Strategy<AjnaPosition> from library once exported
export interface AjnaActionData {
  simulation: AjnaSimulationData
  tx: AjnaTxData
}
