import { lambdaPercentageDenomination } from 'features/aave/constants'
import { getLocalAppConfig } from 'helpers/config'

import { getSetupTriggerConfig } from './get-setup-trigger-config'
import type {
  SetupAavePartialTakeProfitParams,
  SetupPartialTakeProfitResponse,
} from './setup-triggers-types'
import { TriggersApiErrorCode } from './setup-triggers-types'

export const setupAaveLikePartialTakeProfit = async (
  params: SetupAavePartialTakeProfitParams,
): Promise<SetupPartialTakeProfitResponse> => {
  const { url, customRpc } = getSetupTriggerConfig({ ...params, path: 'dma-partial-take-profit' })
  const shouldSkipValidation = getLocalAppConfig('features').AaveV3LambdaSuppressValidation

  const body = JSON.stringify({
    dpm: params.dpm,
    triggerData: {
      withdrawToken: params.executionToken,
      executionLTV: params.triggerLtv.times(lambdaPercentageDenomination).integerValue().toString(),
      withdrawStep: params.withdrawalLtv
        .times(lambdaPercentageDenomination)
        .integerValue()
        .toString(),
      executionPrice: params.startingTakeProfitPrice.integerValue().toString(),
      stopLoss: params.stopLoss
        ? {
            triggerData: {
              executionLTV: params.stopLoss.triggerData.executionLTV
                .times(lambdaPercentageDenomination)
                .integerValue()
                .toString(),
              token: params.stopLoss.triggerData.token,
            },
            action: params.stopLoss.action,
          }
        : undefined,
      // trailingStopLoss: params.trailingStopLoss, // possibly in the future
    },
    position: {
      collateral: params.strategy.collateralAddress,
      debt: params.strategy.debtAddress,
    },
    rpc: customRpc,
    action: params.action,
  })

  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: shouldSkipValidation
        ? {
            'x-summer-skip-validation': '1',
          }
        : undefined,
      body: body,
    })
  } catch (error) {
    console.error('Error while setting up stop loss', error)
    return {
      errors: [
        {
          code: TriggersApiErrorCode.InternalError,
          message: 'Internal error',
        },
      ],
    }
  }

  if (response.status === 400) {
    return (await response.json()) as Pick<SetupPartialTakeProfitResponse, 'errors'>
  }

  if (response.status === 200) {
    return (await response.json()) as Omit<SetupPartialTakeProfitResponse, 'errors'>
  }

  const responseBody = await response.text()

  throw new Error(
    `Unexpected response status from triggers API: ${response.status} with body: ${responseBody}`,
  )
}
