import { lambdaPercentageDenomination } from 'features/aave/constants'
import { getLocalAppConfig } from 'helpers/config'

import { getSetupTriggerConfig } from './get-setup-trigger-config'
import type {
  SetupBasicAutoResponse,
  SetupBasicStopLossResponse,
  SetupStopLossParams,
} from './setup-triggers-types'
import { TriggersApiErrorCode } from './setup-triggers-types'

export const setupLambdaStopLoss = async (
  params: SetupStopLossParams,
): Promise<SetupBasicStopLossResponse> => {
  const { common, poolId, url } = getSetupTriggerConfig({ ...params, path: 'dma-stop-loss' })
  const shouldSkipValidation = getLocalAppConfig('features').AaveV3LambdaSuppressValidation

  const body = JSON.stringify({
    ...common,
    triggerData: {
      executionLTV: params.executionLTV
        .times(lambdaPercentageDenomination)
        .integerValue()
        .toString(),
      poolId,
      token: params.executionToken,
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
      body,
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
