import { getSetupTriggerConfig } from './get-setup-trigger-config'
import type { SetupAaveBasicAutomationParams, SetupBasicAutoResponse } from './setup-triggers-types'
import { TriggersApiErrorCode } from './setup-triggers-types'

export const setupAaveAutoSell = async (
  params: SetupAaveBasicAutomationParams,
): Promise<SetupBasicAutoResponse> => {
  const { url, customRpc } = getSetupTriggerConfig({ ...params, path: 'auto-sell' })

  const body = JSON.stringify({
    dpm: params.dpm,
    triggerData: {
      executionLTV: params.executionLTV.integerValue().toString(),
      targetLTV: params.targetLTV.integerValue().toString(),
      minSellPrice: params.price?.integerValue().toString(),
      maxBaseFee: params.maxBaseFee.integerValue().toString(),
      useMinSellPrice: params.usePrice,
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
    console.error('Error while setting up auto buy', error)
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
