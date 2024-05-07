import BigNumber from 'bignumber.js'
import { lambdaPercentageDenomination } from 'features/aave/constants'
import type { GetTriggersResponse } from 'helpers/lambda/triggers'
import { LendingProtocol } from 'lendingProtocols'

interface MapStopLossFromLambdaParams {
  poolId?: string
  protocol: LendingProtocol
  triggers?: GetTriggersResponse['triggers']
}

const getTrigger = ({ protocol, triggers, poolId }: MapStopLossFromLambdaParams) => {
  if (!triggers) return []

  switch (protocol) {
    case LendingProtocol.AaveV3: {
      return [
        triggers.aave3.stopLossToCollateral,
        triggers.aave3.stopLossToCollateralDMA,
        triggers.aave3.stopLossToDebt,
        triggers.aave3.stopLossToDebtDMA,
      ]
    }
    case LendingProtocol.MorphoBlue: {
      if (`morphoblue-${poolId}` in triggers) return [triggers[`morphoblue-${poolId}`].stopLoss]
      else return []
    }
    case LendingProtocol.SparkV3: {
      return [
        triggers.spark.stopLossToCollateral,
        triggers.spark.stopLossToCollateralDMA,
        triggers.spark.stopLossToDebt,
        triggers.spark.stopLossToDebtDMA,
      ]
    }
    default:
      return []
  }
}

export const mapStopLossFromLambda = ({
  poolId,
  protocol,
  triggers,
}: MapStopLossFromLambdaParams) => {
  if (!triggers) return {}

  const triggersList = getTrigger({ poolId, protocol, triggers }).filter(
    (item) => item !== undefined,
  )
  const trigger = triggersList[0]

  if (triggersList.length > 1) {
    console.warn('Warning: more than one Stop-Loss trigger found:', triggersList)
  }

  if (trigger) {
    const stopLossLevel = trigger.decodedParams.executionLtv || trigger.decodedParams.ltv
    return {
      stopLossLevel: stopLossLevel
        ? new BigNumber(Number(stopLossLevel)).div(lambdaPercentageDenomination)
        : undefined,
      stopLossToken: trigger.triggerTypeName.includes('Debt')
        ? ('debt' as const)
        : ('collateral' as const),
      stopLossData: trigger,
      triggerId: trigger.triggerId,
    }
  } else return {}
}
