import { getSetupTriggerConfig } from './get-setup-trigger-config'
import type {
  SetupAaveStopLossParams,
  SetupBasicAutoResponse,
  SetupBasicStopLossResponse,
} from './setup-triggers-types'
import { TriggersApiErrorCode } from './setup-triggers-types'

export const setupAaveStopLoss = async (
  params: SetupAaveStopLossParams,
): Promise<SetupBasicStopLossResponse> => {
  const { url, customRpc } = getSetupTriggerConfig({ ...params, path: 'stop-loss' })

  const body = JSON.stringify({
    dpm: params.dpm,
    triggerData: {
      executionLTV: params.executionLTV.integerValue().toString(),
      targetLTV: params.targetLTV.integerValue().toString(),
      executionToken: params.executionToken,
    },
    position: {
      collateral: params.strategy.collateralAddress,
      debt: params.strategy.debtAddress,
    },
    rpc: customRpc,
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
