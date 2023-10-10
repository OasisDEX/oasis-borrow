import type BigNumber from 'bignumber.js'
import type { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData.types'

export interface CancelAutoBSInfoSectionProps {
  positionRatio: BigNumber
  liquidationPrice: BigNumber
  debt: BigNumber
  title: string
  targetLabel: string
  triggerLabel: string
  autoBSTriggerData: AutoBSTriggerData
}
