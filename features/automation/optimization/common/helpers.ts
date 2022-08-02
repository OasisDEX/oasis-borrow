import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import { DEFAULT_BASIC_BS_MAX_SLIDER_VALUE } from 'features/automation/protection/common/consts/automationDefaults'
import { getBasicSellMinMaxValues } from 'features/automation/protection/common/helpers'
import { StopLossTriggerData } from 'features/automation/protection/common/stopLossTriggerData'

export function getConstantMutliplyMinMaxValues({
  ilkData,
  autoBuyTriggerData,
  stopLossTriggerData,
  lockedCollateralUSD,
}: {
  ilkData: IlkData
  autoBuyTriggerData: BasicBSTriggerData
  stopLossTriggerData: StopLossTriggerData
  lockedCollateralUSD: BigNumber
}) {
  return {
    min: getBasicSellMinMaxValues({
      autoBuyTriggerData,
      stopLossTriggerData,
      ilkData,
    }).min,
    max: BigNumber.minimum(
      lockedCollateralUSD.div(ilkData.debtFloor),
      DEFAULT_BASIC_BS_MAX_SLIDER_VALUE,
    )
      .times(100)
      .decimalPlaces(0, BigNumber.ROUND_DOWN),
  }
}
