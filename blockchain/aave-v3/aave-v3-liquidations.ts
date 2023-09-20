import { NetworkIds } from 'blockchain/networks'
import type { AaveV3Pool } from 'types/ethers-contracts'
import { AaveV3Pool__factory } from 'types/ethers-contracts'
import type { LiquidationCallEvent } from 'types/ethers-contracts/AaveV3Pool'

import type { BaseParameters, ContractForNetwork } from './utils'
import { getNetworkMapping } from './utils'

async function getLastLiquidationEvent(
  { contractGenesis, contract }: ContractForNetwork<AaveV3Pool>,
  proxyAddress: string,
): Promise<LiquidationCallEvent[]> {
  const liquidationCallFilter = contract.filters.LiquidationCall(
    null,
    null,
    proxyAddress,
    null,
    null,
    null,
    null,
  )
  const depositFilter = contract.filters.Supply(null, null, proxyAddress, null, null)

  const [liquidationEvents, depositEvents] = await Promise.all([
    contract.queryFilter(liquidationCallFilter, contractGenesis, 'latest'),
    contract.queryFilter(depositFilter, contractGenesis, 'latest'),
  ])

  if (!liquidationEvents.length || !depositEvents.length) {
    return []
  }

  const mostRecentDepositEvent = depositEvents[depositEvents.length - 1]
  const mostRecentLiquidationEvent = liquidationEvents[liquidationEvents.length - 1]

  if (mostRecentDepositEvent.blockNumber > mostRecentLiquidationEvent.blockNumber) {
    return []
  }

  return [mostRecentLiquidationEvent]
}

export interface GetAaveV3PositionLiquidationParameters extends BaseParameters {
  proxyAddress: string | undefined
}

const networkMappings = {
  [NetworkIds.MAINNET]: () =>
    getNetworkMapping(AaveV3Pool__factory, NetworkIds.MAINNET, 'aaveV3Pool'),
  [NetworkIds.OPTIMISMMAINNET]: () =>
    getNetworkMapping(AaveV3Pool__factory, NetworkIds.OPTIMISMMAINNET, 'aaveV3Pool'),
  [NetworkIds.ARBITRUMMAINNET]: () =>
    getNetworkMapping(AaveV3Pool__factory, NetworkIds.ARBITRUMMAINNET, 'aaveV3Pool'),
}

export async function getAaveV3PositionLiquidation({
  proxyAddress,
  networkId,
}: GetAaveV3PositionLiquidationParameters): Promise<LiquidationCallEvent[]> {
  if (!proxyAddress) {
    return []
  }

  const result = networkMappings[networkId]()

  return await getLastLiquidationEvent(result, proxyAddress)
}
