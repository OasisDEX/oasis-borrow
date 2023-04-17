import { getNetworkContracts } from 'blockchain/contracts'
import { Context } from 'blockchain/network'
import { ethers } from 'ethers'
import { ContractDesc } from 'features/web3Context'
import { Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { AaveV3Pool__factory } from 'types/ethers-contracts'
import { LiquidationCallEvent } from 'types/ethers-contracts/AaveV3Pool'

async function getLastLiquidationEvent(
  aaveV3Pool: ContractDesc & { genesisBlock: number },
  rpcProvider: ethers.providers.Provider,
  proxyAddress: string,
): Promise<LiquidationCallEvent[]> {
  const pool = AaveV3Pool__factory.connect(aaveV3Pool.address, rpcProvider)

  const liquidationCallFilter = pool.filters.LiquidationCall(
    null,
    null,
    proxyAddress,
    null,
    null,
    null,
    null,
  )
  const depositFilter = pool.filters.Supply(null, null, proxyAddress, null, null)

  const [liquidationEvents, depositEvents] = await Promise.all([
    pool.queryFilter(liquidationCallFilter, aaveV3Pool.genesisBlock, 'latest'),
    pool.queryFilter(depositFilter, aaveV3Pool.genesisBlock, 'latest'),
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

export function getAaveV3PositionLiquidation$(
  context$: Observable<Context>,
  proxyAddress: string | undefined,
): Observable<LiquidationCallEvent[]> {
  if (!proxyAddress) {
    return of([])
  }
  return context$.pipe(
    switchMap(async ({ chainId, rpcProvider }) => {
      return await getLastLiquidationEvent(
        getNetworkContracts(chainId).aaveV3Pool,
        rpcProvider,
        proxyAddress,
      )
    }),
  )
}
