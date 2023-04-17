import { getNetworkContracts } from 'blockchain/contracts'
import { Context } from 'blockchain/network'
import { ethers } from 'ethers'
import { ContractDesc } from 'features/web3Context'
import { Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { AaveV2LendingPool__factory } from 'types/ethers-contracts'
import { LiquidationCallEvent } from 'types/ethers-contracts/AaveV2LendingPool'

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

export function getAaveV2PositionLiquidation$(
  context$: Observable<Context>,
  proxyAddress: string,
): Observable<LiquidationCallEvent[]> {
  if (!proxyAddress) {
    return of([])
  }

  return context$.pipe(
    switchMap(
      async ({ chainId, rpcProvider }) =>
        await getLastLiquidationEvent(
          getNetworkContracts(chainId).aaveV2LendingPool,
          rpcProvider,
          proxyAddress,
        ),
    ),
  )
}
