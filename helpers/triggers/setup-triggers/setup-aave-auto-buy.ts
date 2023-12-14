import type BigNumber from 'bignumber.js'
import type { LendingProtocol } from 'lendingProtocols'

import { getSetupTriggerConfig } from './get-setup-trigger-config'
import type { SetupAutoBuyResponse } from './setup-triggers-types'

interface StrategyLike {
  collateralAddress: string
  debtAddress: string
}

export interface SetupAaveAutoBuyParams {
  maxBuyPrice: BigNumber
  executionLTV: BigNumber
  targetLTV: BigNumber
  maxBaseFee: BigNumber
  dpm: string
  strategy: StrategyLike
  triggerType: number
  networkId: number
  protocol: LendingProtocol
}
export const setupAaveAutoBuy = async (
  params: SetupAaveAutoBuyParams,
): Promise<SetupAutoBuyResponse> => {
  const { url, customRpc } = getSetupTriggerConfig({ ...params })

  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        dpm: params.dpm,
        triggerData: {
          executionLTV: params.executionLTV.integerValue().toString(),
          targetLTV: params.targetLTV.integerValue().toString(),
          maxBuyPrice: params.maxBuyPrice.integerValue().toString(),
          maxBaseFee: params.maxBaseFee.integerValue().toString(),
        },
        position: {
          collateral: params.strategy.collateralAddress,
          debt: params.strategy.debtAddress,
        },
        rpc: customRpc,
      }),
    })
  } catch (error) {
    console.error('Error while setting up auto buy', error)
    return {
      errors: [
        {
          code: 'internal_error',
          message: 'Internal error',
        },
      ],
    }
  }

  if (response.status === 400) {
    return (await response.json()) as Pick<SetupAutoBuyResponse, 'errors'>
  }

  if (response.status === 200) {
    return (await response.json()) as Omit<SetupAutoBuyResponse, 'errors'>
  }

  const body = await response.text()

  throw new Error(
    `Unexpected response status from triggers API: ${response.status} with body: ${body}`,
  )
}
