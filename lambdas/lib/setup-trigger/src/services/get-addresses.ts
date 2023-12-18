import { ADDRESSES } from '@oasisdex/addresses'
import { ChainId, NetworkByChainID, Address } from 'shared/domain-types'

export interface Addresses {
  AutomationBot: Address
  AaveDataPoolProvider: Address
  AaveOracle: Address
}
export function getAddresses(chainId: ChainId): Addresses {
  const network = NetworkByChainID[chainId]
  const addresses = ADDRESSES[network]

  return {
    AutomationBot: addresses['automation']['AutomationBotV2'] as Address,
    AaveDataPoolProvider: addresses['aave']['v3'].PoolDataProvider as Address,
    AaveOracle: addresses['aave']['v3'].Oracle as Address,
  }
}
