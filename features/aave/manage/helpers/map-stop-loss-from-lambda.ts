import BigNumber from 'bignumber.js'
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

type TrailingStopLossTriggers = Pick<GetTriggersResponse['triggers'], 'aaveTrailingStopLossDMA'>

export const mapStopLossFromLambda = (triggers?: StopLossTriggers | TrailingStopLossTriggers) => {
  if (!triggers) {
    return {}
  }
  const stopLossTriggersNames = Object.keys(triggers).filter((triggerName) =>
    triggerName.includes('StopLossTo'),
  )
  const trailingStopLossTriggersnames = Object.keys(triggers).filter((triggerName) =>
    triggerName.includes('TrailingStopLoss'),
  )
  if (stopLossTriggersNames.length > 1) {
    console.warn('Warning: more than one stop loss trigger found:', stopLossTriggersNames)
  }
  if (trailingStopLossTriggersnames.length > 1) {
    console.warn(
      'Warning: more than one trailing stop loss trigger found:',
      trailingStopLossTriggersnames,
    )
  }
  const stopLossTriggerName = stopLossTriggersNames[0] as keyof StopLossTriggers
  const trailingStopLossTriggerName =
    trailingStopLossTriggersnames[0] as keyof TrailingStopLossTriggers
  const trigger = (triggers as StopLossTriggers)[stopLossTriggerName]
  const trailingStopLossTrigger = (triggers as TrailingStopLossTriggers)[
    trailingStopLossTriggerName
  ]
  if (trailingStopLossTrigger) {
    // const stopLossLevel = trailingStopLossTrigger.decodedParams.trailingDistance || trailingStopLossTrigger.decodedParams.ltv || trailingStopLossTrigger.decodedParams
    // return {
    //   stopLossLevel: stopLossLevel ? new BigNumber(Number(stopLossLevel)).div(10 ** 2) : undefined,
    //   stopLossToken: stopLossTriggerName.includes('Debt')
    //     ? ('debt' as const)
    //     : ('collateral' as const),
    //   stopLossData: trailingStopLossTrigger,
    //   triggerId: trailingStopLossTrigger.triggerId,
    //   stopLossTriggerName,
    // }
  }
  if (trigger) {
    const stopLossLevel =
      trigger.decodedParams.executionLtv || trigger.decodedParams.ltv || trigger.decodedParams
    return {
      stopLossLevel: stopLossLevel ? new BigNumber(Number(stopLossLevel)).div(10 ** 2) : undefined,
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
