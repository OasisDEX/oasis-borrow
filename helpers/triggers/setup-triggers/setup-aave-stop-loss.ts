import type { SupportedLambdaProtocols } from 'helpers/triggers/common'
import {
  DmaAaveStopLossToCollateralV2ID,
  DmaAaveStopLossToDebtV2ID,
  DmaSparkStopLossToCollateralV2ID,
  DmaSparkStopLossToDebtV2ID,
} from 'helpers/triggers/get-triggers'
import { LendingProtocol } from 'lendingProtocols'

import { getSetupTriggerConfig } from './get-setup-trigger-config'
import type {
  SetupAaveStopLossParams,
  SetupBasicAutoResponse,
  SetupBasicStopLossResponse,
} from './setup-triggers-types'
import { TriggersApiErrorCode } from './setup-triggers-types'

export const setupAaveLikeStopLoss = async (
  params: SetupAaveStopLossParams,
): Promise<SetupBasicStopLossResponse> => {
  const { url, customRpc } = getSetupTriggerConfig({ ...params, path: 'dma-stop-loss' })

  const triggerTypeMap = {
    [LendingProtocol.AaveV3]: {
      collateral: DmaAaveStopLossToCollateralV2ID.toString(),
      debt: DmaAaveStopLossToDebtV2ID.toString(),
    },
    [LendingProtocol.SparkV3]: {
      collateral: DmaSparkStopLossToCollateralV2ID.toString(),
      debt: DmaSparkStopLossToDebtV2ID.toString(),
    },
  }

  const triggerTypePicker: keyof (typeof triggerTypeMap)[SupportedLambdaProtocols] =
    params.executionToken === params.strategy.collateralAddress ? 'collateral' : 'debt'

  const body = JSON.stringify({
    dpm: params.dpm,
    triggerData: {
      type: triggerTypeMap[params.protocol][triggerTypePicker],
      executionLTV: params.executionLTV
        .times(10 ** 2)
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
    return (await response.json()) as Pick<SetupBasicAutoResponse, 'errors'>
  }

  if (response.status === 200) {
    return (await response.json()) as Omit<SetupBasicAutoResponse, 'errors'>
  }

  const responseBody = await response.text()

  throw new Error(
    `Unexpected response status from triggers API: ${response.status} with body: ${responseBody}`,
  )
}
