import BigNumber from 'bignumber.js'
import { lambdaPriceDenomination } from 'features/aave/constants'
import type { GetTriggersResponse } from 'helpers/lambda/triggers'
import { LendingProtocol } from 'lendingProtocols'

interface MapTrailingStopLossFromLambdaParams {
  poolId?: string
  protocol: LendingProtocol
  triggers?: GetTriggersResponse['triggers']
}

const denominate = (value: string | number) =>
  new BigNumber(Number(value)).div(lambdaPriceDenomination)

const getTrigger = ({ protocol, triggers, poolId }: MapTrailingStopLossFromLambdaParams) => {
  if (!triggers) return undefined

  switch (protocol) {
    case LendingProtocol.AaveV3: {
      return triggers.aave3.trailingStopLossDMA
    }
    case LendingProtocol.MorphoBlue: {
      if (`morphoblue-${poolId}` in triggers)
        return triggers[`morphoblue-${poolId}`].trailingStopLoss
      else return undefined
    }
    case LendingProtocol.SparkV3: {
      return triggers.spark.trailingStopLossDMA
    }
    default:
      return undefined
  }
}

export const mapTrailingStopLossFromLambda = ({
  poolId,
  protocol,
  triggers,
}: MapTrailingStopLossFromLambdaParams) => {
  if (!triggers) return {}

  const trigger = getTrigger({ poolId, protocol, triggers })

  if (trigger) {
    return {
      trailingDistance: denominate(trigger.decodedParams.trailingDistance),
      trailingStopLossToken: trigger.decodedParams.closeToCollateral
        ? ('collateral' as const)
        : ('debt' as const),
      trailingStopLossData: trigger,
      triggerId: trigger.triggerId,
      dynamicParams: {
        executionPrice: denominate(trigger.dynamicParams.executionPrice ?? 0),
        originalExecutionPrice: denominate(trigger.dynamicParams.originalExecutionPrice ?? 0),
      },
    }
  } else return {}
}
