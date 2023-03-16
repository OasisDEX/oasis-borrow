import { Context, NetworkIds } from 'blockchain/network'
import { getNetworkId } from 'features/web3Context'
import { Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { AaveV3Pool } from 'types/web3-v1-contracts/aave-v3-pool'

const aaveV3PoolGenesisBlockMainnet = 16291127
const aaveV3PoolGenesisBlockGoerli = 8294332

const networkMap = {
  [NetworkIds.MAINNET]: aaveV3PoolGenesisBlockMainnet,
  [NetworkIds.HARDHAT]: aaveV3PoolGenesisBlockMainnet,
  [NetworkIds.GOERLI]: aaveV3PoolGenesisBlockGoerli,
}

export interface Web3ContractEvent {
  event: string
  signature: string | null
  address: string
  returnValues: Record<string, string>
  logIndex: number
  transactionIndex: number
  transactionHash: string
  blockHash: string
  blockNumber: number
  raw: { data: string; topics: string[] }
}

export function getAaveV3PositionLiquidation$(
  context$: Observable<Context>,
  proxyAddress: string,
): Observable<Web3ContractEvent[]> {
  if (!proxyAddress) {
    return of([])
  }

  const chainId = getNetworkId() as NetworkIds
  const genesisBlock = networkMap[chainId]

  return context$.pipe(
    switchMap(async ({ aaveV3Pool, contract }) => {
      const pool = contract<AaveV3Pool>(aaveV3Pool)

      const contractCalls = Promise.all<Web3ContractEvent[]>([
        pool.getPastEvents('LiquidationCall', {
          filter: { user: proxyAddress },
          fromBlock: genesisBlock,
          toBlock: 'latest',
        }),
        pool.getPastEvents('Deposit', {
          filter: { onBehalfOf: proxyAddress },
          fromBlock: genesisBlock,
          toBlock: 'latest',
        }),
      ])

      const [liquidationEvents, depositEvents] = await contractCalls

      if (!liquidationEvents.length || !depositEvents.length) {
        return []
      }

      const mostRecentDepositEvent = depositEvents[depositEvents.length - 1]
      const mostRecentLiquidationEvent = liquidationEvents[liquidationEvents.length - 1]

      if (mostRecentDepositEvent.blockNumber > mostRecentLiquidationEvent.blockNumber) {
        return []
      }

      return [mostRecentLiquidationEvent]
    }),
  )
}
