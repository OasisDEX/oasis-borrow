import type { NetworkIds } from 'blockchain/networks'
import { networkSetById } from 'blockchain/networks'
import type { SupportedLambdaProtocols } from 'helpers/triggers/common'
import { supportedLambdaProtocolsList } from 'helpers/triggers/common'
import { LendingProtocol } from 'lendingProtocols'

export interface GetSetupTriggerConfigParams {
  networkId: NetworkIds
  protocol: SupportedLambdaProtocols
  path: 'auto-buy' | 'auto-sell' | 'dma-stop-loss' | 'dma-trailing-stop-loss'
}

export const getSetupTriggerConfig = (params: GetSetupTriggerConfigParams) => {
  console.log('getSetupTriggerConfig 1')
  if (!supportedLambdaProtocolsList.includes(params.protocol)) {
    throw new Error(
      `Only protocols supported for getting trigger data from API: ${supportedLambdaProtocolsList.join(
        ',',
      )}`,
    )
  }

  console.log('getSetupTriggerConfig 2')
  const networkConfig = networkSetById[params.networkId]
  const rpc = networkConfig?.isCustomFork ? networkConfig.rpcUrl : undefined

  console.log('getSetupTriggerConfig 3', {
    url: `/api/triggers/${params.networkId}/${
      {
        [LendingProtocol.AaveV3]: 'aave3',
        [LendingProtocol.SparkV3]: 'spark',
      }[params.protocol]
    }/${params.path}`,
    customRpc: rpc,
  })
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
