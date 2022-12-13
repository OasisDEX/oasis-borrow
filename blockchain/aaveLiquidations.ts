import { getNetworkId } from '@oasisdex/web3-context'
import { Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { AaveLendingPool } from 'types/web3-v1-contracts/aave-lending-pool'

import { Context, NetworkIds } from './network'

// TODO probably we would like to set here a block numbers of our aave deployment
const aaveLendingPoolGenesisBlockMainnet = 11362579
const aaveLendingPoolGenesisBlockGoerli = 7480475

const networkMap = {
  [NetworkIds.MAINNET]: aaveLendingPoolGenesisBlockMainnet,
  [NetworkIds.HARDHAT]: aaveLendingPoolGenesisBlockMainnet,
  [NetworkIds.GOERLI]: aaveLendingPoolGenesisBlockGoerli,
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

export function getAavePositionLiquidation$(
  context$: Observable<Context>,
  proxyAddress: string,
): Observable<Web3ContractEvent[]> {
  if (!proxyAddress) {
    return of([])
  }

  const chainId = getNetworkId() as NetworkIds
  const genesisBlock = networkMap[chainId]

  return context$.pipe(
    switchMap(async ({ aaveLendingPool, contract }) => {
      const aaveLendingPoolContract = contract<AaveLendingPool>(aaveLendingPool)

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
