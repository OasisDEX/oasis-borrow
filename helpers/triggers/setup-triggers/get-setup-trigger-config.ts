import type { TriggerType } from '@oasisdex/automation'
import { NetworkIds, networkSetById } from 'blockchain/networks'
import { LendingProtocol } from 'lendingProtocols'
import getConfig from 'next/config'

export interface GetSetupTriggerConfigParams {
  triggerType: TriggerType
  networkId: NetworkIds
  protocol: LendingProtocol
}

export const getSetupTriggerConfig = (params: GetSetupTriggerConfigParams) => {
  if (params.protocol !== LendingProtocol.AaveV3) {
    throw new Error('Only AaveV3 is supported for getting trigger data from API')
  }

  if (params.networkId !== NetworkIds.MAINNET) {
    throw new Error('Only Mainnet is supported for getting trigger data from API')
  }

  const networkConfig = networkSetById[params.networkId]
  const rpc = networkConfig?.isCustomFork ? networkConfig.rpcUrl : undefined

  const config = getConfig()

  const baseUrl = config?.publicRuntimeConfig.setupTriggerUrl

  // TODO: Add proper triggers.

  return {
    url: `${baseUrl}/${params.networkId}/aave3/auto-buy`,
    customRpc: rpc,
  }
}
