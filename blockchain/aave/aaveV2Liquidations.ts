import { getNetworkId } from '@oasisdex/web3-context'
import { Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { AaveV2LendingPool } from 'types/web3-v1-contracts/aave-v2-lending-pool'

import { Context, NetworkIds } from '../network'

// TODO probably we would like to set here a block numbers of our aave deployment
const aaveV2LendingPoolGenesisBlockMainnet = 11362579
const aaveV2LendingPoolGenesisBlockGoerli = 7480475

const networkMap = {
  [NetworkIds.MAINNET]: aaveV2LendingPoolGenesisBlockMainnet,
  [NetworkIds.HARDHAT]: aaveV2LendingPoolGenesisBlockMainnet,
  [NetworkIds.GOERLI]: aaveV2LendingPoolGenesisBlockGoerli,
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

export function getAaveV2PositionLiquidation$(
  context$: Observable<Context>,
  proxyAddress: string,
): Observable<Web3ContractEvent[]> {
  if (!proxyAddress) {
    return of([])
  }

  const chainId = getNetworkId() as NetworkIds
  const genesisBlock = networkMap[chainId]

  return context$.pipe(
    switchMap(async ({ aaveV2LendingPool, contract }) => {
      const aaveLendingPoolContract = contract<AaveV2LendingPool>(aaveV2LendingPool)

      const contractCalls = Promise.all<Web3ContractEvent[], Web3ContractEvent[]>([
        aaveLendingPoolContract.getPastEvents('LiquidationCall', {
          filter: { user: proxyAddress },
          fromBlock: genesisBlock,
          toBlock: 'latest',
        }),
        aaveLendingPoolContract.getPastEvents('Deposit', {
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
