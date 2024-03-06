import { lambdaPriceDenomination } from 'features/aave/constants'

import { getSetupTriggerConfig } from './get-setup-trigger-config'
import type {
  SetupAaveTrailingStopLossParams,
  SetupTrailingStopLossResponse,
} from './setup-triggers-types'
import { TriggersApiErrorCode } from './setup-triggers-types'

export const setupAaveLikeTrailingStopLoss = async (
  params: SetupAaveTrailingStopLossParams,
): Promise<SetupTrailingStopLossResponse> => {
  const { url, customRpc } = getSetupTriggerConfig({ ...params, path: 'dma-trailing-stop-loss' })

  const body = JSON.stringify({
    dpm: params.dpm,
    triggerData: {
      trailingDistance: params.trailingDistance
        .times(lambdaPriceDenomination)
        .integerValue()
        .toString(),
      token: params.executionToken,
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
    return (await response.json()) as Pick<SetupTrailingStopLossResponse, 'errors'>
  }

  if (response.status === 200) {
    return (await response.json()) as Omit<SetupTrailingStopLossResponse, 'errors'>
  }

  const responseBody = await response.text()

  throw new Error(
    `Unexpected response status from triggers API: ${response.status} with body: ${responseBody}`,
  )
}
