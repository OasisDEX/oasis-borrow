import { Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { AaveLendingPool } from 'types/web3-v1-contracts/aave-lending-pool'

import { Context } from './network'

const aaveLendingPoolGenesisBlock = 11362579 // TODO probably we would like to set here a block number of our aave deployment

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
  return context$.pipe(
    switchMap(async ({ aaveLendingPool, contract }) => {
      const aaveLendingPoolContract = contract<AaveLendingPool>(aaveLendingPool)

      const contractCalls = Promise.all<Web3ContractEvent[], Web3ContractEvent[]>([
        aaveLendingPoolContract.getPastEvents('LiquidationCall', {
          filter: { user: proxyAddress },
          fromBlock: aaveLendingPoolGenesisBlock,
          toBlock: 'latest',
        }),
        aaveLendingPoolContract.getPastEvents('Deposit', {
          filter: { onBehalfOf: proxyAddress },
          fromBlock: aaveLendingPoolGenesisBlock,
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
