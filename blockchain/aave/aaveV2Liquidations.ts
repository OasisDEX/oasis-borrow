import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { networksById } from 'blockchain/networks'
import { ethers } from 'ethers'
import { ContractDesc } from 'features/web3Context'
import { AaveV2LendingPool__factory } from 'types/ethers-contracts'
import { LiquidationCallEvent } from 'types/ethers-contracts/AaveV2LendingPool'

// TODO: Move to subgraph.
async function getLastLiquidationEvent(
  aaveV2LendingPool: ContractDesc & { genesisBlock: number },
  rpcProvider: ethers.providers.Provider,
  proxyAddress: string,
): Promise<LiquidationCallEvent[]> {
  const aaveLendingPoolContract = AaveV2LendingPool__factory.connect(
    aaveV2LendingPool.address,
    rpcProvider,
  )

  const liquidationCallFilter = aaveLendingPoolContract.filters.LiquidationCall(
    null,
    null,
    proxyAddress,
    null,
    null,
    null,
    null,
  )
  const depositFilter = aaveLendingPoolContract.filters.Deposit(
    null,
    null,
    proxyAddress,
    null,
    null,
  )

  const [liquidationEvents, depositEvents] = await Promise.all([
    aaveLendingPoolContract.queryFilter(
      liquidationCallFilter,
      aaveV2LendingPool.genesisBlock,
      'latest',
    ),
    aaveLendingPoolContract.queryFilter(depositFilter, aaveV2LendingPool.genesisBlock, 'latest'),
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

export type GetAaveV2PositionLiquidationParameters = {
  proxyAddress: string | undefined
}

export async function getAaveV2PositionLiquidation({
  proxyAddress,
}: GetAaveV2PositionLiquidationParameters): Promise<LiquidationCallEvent[]> {
  if (!proxyAddress) {
    return []
  }

  return await getLastLiquidationEvent(
    getNetworkContracts(NetworkIds.MAINNET).aaveV2LendingPool,
    networksById[NetworkIds.MAINNET].readProvider,
    proxyAddress,
  )
}
