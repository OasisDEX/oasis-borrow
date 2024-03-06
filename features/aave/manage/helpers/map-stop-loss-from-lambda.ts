import BigNumber from 'bignumber.js'
import { lambdaPercentageDenomination } from 'features/aave/constants'
import type { GetTriggersResponse } from 'helpers/triggers'

type StopLossTriggers = Pick<
  GetTriggersResponse['triggers'],
  | 'aaveStopLossToCollateral'
  | 'aaveStopLossToCollateralDMA'
  | 'aaveStopLossToDebt'
  | 'aaveStopLossToDebtDMA'
  | 'sparkStopLossToCollateral'
  | 'sparkStopLossToCollateralDMA'
  | 'sparkStopLossToDebt'
  | 'sparkStopLossToDebtDMA'
>

export const mapStopLossFromLambda = (triggers?: StopLossTriggers) => {
  if (!triggers) {
    return {}
  }
  const stopLossTriggersNames = Object.keys(triggers).filter((triggerName) =>
    triggerName.includes('StopLoss'),
  )
  if (stopLossTriggersNames.length > 1) {
    console.warn('Warning: more than one stop loss trigger found:', stopLossTriggersNames)
  }
  const stopLossTriggerName = stopLossTriggersNames[0] as keyof StopLossTriggers
  const trigger = triggers[stopLossTriggerName]
  if (trigger) {
    const stopLossLevel = trigger.decodedParams.executionLtv || trigger.decodedParams.ltv
    return {
      stopLossLevel: stopLossLevel
        ? new BigNumber(Number(stopLossLevel)).div(lambdaPercentageDenomination)
        : undefined,
      stopLossToken: stopLossTriggerName.includes('Debt')
        ? ('debt' as const)
        : ('collateral' as const),
      stopLossData: trigger,
      triggerId: trigger.triggerId,
      stopLossTriggerName,
    }
  }
  return {}
}
