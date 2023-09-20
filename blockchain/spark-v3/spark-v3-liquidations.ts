import { NetworkIds } from 'blockchain/networks'
import type { SparkV3Pool } from 'types/ethers-contracts'
import { SparkV3Pool__factory } from 'types/ethers-contracts'
import type { LiquidationCallEvent } from 'types/ethers-contracts/SparkV3Pool'

import type { BaseParameters, ContractForNetwork } from './utils'
import { getNetworkMapping } from './utils'

async function getLastLiquidationEvent(
  { contractGenesis, contract }: ContractForNetwork<SparkV3Pool>,
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

export interface GetSparkV3PositionLiquidationParameters extends BaseParameters {
  proxyAddress: string | undefined
}

const networkMappings = {
  [NetworkIds.MAINNET]: () =>
    getNetworkMapping(SparkV3Pool__factory, NetworkIds.MAINNET, 'sparkV3Pool'),
}

export async function getSparkV3PositionLiquidation({
  proxyAddress,
  networkId,
}: GetSparkV3PositionLiquidationParameters): Promise<LiquidationCallEvent[]> {
  if (!proxyAddress) {
    return []
  }

  const result = networkMappings[networkId]()

  return await getLastLiquidationEvent(result, proxyAddress)
}
