import { AjnaPosition } from '@oasisdex/oasis-actions/lib/packages/oasis-actions/src/helpers/ajna'

export interface AjnaTxData {
  data: string
  to: string
  value: string
}

// TODO use Strategy<AjnaPosition> from library once exported
export interface AjnaActionData {
  simulation: {
    targetPosition: AjnaPosition
    swap: any[]
  }
  tx: AjnaTxData
}
