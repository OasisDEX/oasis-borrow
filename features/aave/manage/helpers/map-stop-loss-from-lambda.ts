import BigNumber from 'bignumber.js'
import type { GetTriggersResponse } from 'helpers/triggers'

export const mapStopLossFromLambda = (triggers?: GetTriggersResponse['triggers']) => {
  if (!triggers) {
    return {}
  }
  const stopLossTriggersNames = Object.keys(triggers).filter((triggerName) =>
    triggerName.includes('StopLoss'),
  )
  if (stopLossTriggersNames.length > 1) {
    console.warn('Warning: more than one stop loss trigger found:', stopLossTriggersNames)
  }
  const stopLossTriggerName = stopLossTriggersNames[0] as keyof GetTriggersResponse['triggers']
  const trigger = triggers[stopLossTriggerName]
  if (trigger) {
    return {
      stopLossLevel: trigger.decodedParams.executionLtv
        ? new BigNumber(Number(trigger.decodedParams.executionLtv)).div(10 ** 2)
        : undefined,
      stopLossToken: stopLossTriggerName.includes('Debt')
        ? ('debt' as const)
        : ('collateral' as const),
      stopLossData: trigger,
      stopLossTriggerName,
    }
  }
  return {}
}
