import type { TriggerType } from '@oasisdex/automation'
import type { NetworkIds } from 'blockchain/networks'
import { networkSetById } from 'blockchain/networks'
import { LendingProtocol } from 'lendingProtocols'

export interface GetSetupTriggerConfigParams {
  triggerType: TriggerType
  networkId: NetworkIds
  protocol: LendingProtocol
  path: 'auto-buy' | 'auto-sell' | 'stop-loss'
}

export const getSetupTriggerConfig = (params: GetSetupTriggerConfigParams) => {
  if (params.protocol !== LendingProtocol.AaveV3) {
    throw new Error('Only AaveV3 is supported for getting trigger data from API')
  }

  const networkConfig = networkSetById[params.networkId]
  const rpc = networkConfig?.isCustomFork ? networkConfig.rpcUrl : undefined

  return {
    url: `/api/triggers/${params.networkId}/aave3/${params.path}`,
    customRpc: rpc,
  }
}
