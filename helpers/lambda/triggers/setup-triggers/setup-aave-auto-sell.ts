import { getLocalAppConfig } from 'helpers/config'

import { getSetupTriggerConfig } from './get-setup-trigger-config'
import type { SetupAaveBasicAutomationParams, SetupBasicAutoResponse } from './setup-triggers-types'
import { TriggersApiErrorCode } from './setup-triggers-types'

export const setupAaveAutoSell = async (
  params: SetupAaveBasicAutomationParams,
): Promise<SetupBasicAutoResponse> => {
  const { common, url } = getSetupTriggerConfig({ ...params, path: 'auto-sell' })
  const shouldSkipValidation = getLocalAppConfig('features').AaveV3LambdaSuppressValidation

  const body = JSON.stringify({
    ...common,
    triggerData: {
      executionLTV: params.executionLTV.integerValue().toString(),
      targetLTV: params.targetLTV.integerValue().toString(),
      minSellPrice: params.price?.integerValue().toString(),
      maxBaseFee: params.maxBaseFee.integerValue().toString(),
      useMinSellPrice: params.usePrice,
    },
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
