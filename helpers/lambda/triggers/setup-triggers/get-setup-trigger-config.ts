import type { NetworkIds } from 'blockchain/networks'
import { networkSetById } from 'blockchain/networks'
import type { SupportedLambdaProtocols } from 'helpers/lambda/triggers/common'
import { supportedLambdaProtocolsList } from 'helpers/lambda/triggers/common'
import { LendingProtocol } from 'lendingProtocols'

export interface GetSetupTriggerConfigParams {
  networkId: NetworkIds
  protocol: SupportedLambdaProtocols
  path:
    | 'auto-buy'
    | 'auto-sell'
    | 'dma-stop-loss'
    | 'dma-trailing-stop-loss'
    | 'dma-partial-take-profit'
}

export const getSetupTriggerConfig = (params: GetSetupTriggerConfigParams) => {
  if (!supportedLambdaProtocolsList.includes(params.protocol)) {
    throw new Error(
      `Only protocols supported for getting trigger data from API: ${supportedLambdaProtocolsList.join(
        ',',
      )}`,
    )
  }

  const networkConfig = networkSetById[params.networkId]
  const rpc = networkConfig?.isCustomFork ? networkConfig.rpcUrl : undefined

  return {
    url: `/api/triggers/${params.networkId}/${
      {
        [LendingProtocol.AaveV3]: 'aave3',
        [LendingProtocol.SparkV3]: 'spark',
      }[params.protocol]
    }/${params.path}`,
    customRpc: rpc,
  }
}
