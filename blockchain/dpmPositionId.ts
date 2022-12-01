import { getNetworkId } from '@oasisdex/web3-context'
import { accountFactoryNetworkMap } from 'blockchain/dpm/accountFactory'
import { Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { AccountFactory } from 'types/web3-v1-contracts/account-factory'

import { Context, NetworkIds } from './network'

export function getDpmPositionId$(
  context$: Observable<Context>,
  proxyAddress: string,
): Observable<number | null> {
  if (!proxyAddress) {
    return of(null)
  }

  const chainId = getNetworkId() as NetworkIds
  const accountFactoryGenesisBlock = accountFactoryNetworkMap[chainId]

  return context$.pipe(
    switchMap(async ({ accountFactory, contract }) => {
      const accountFactoryContract = contract<AccountFactory>(accountFactory)

      const accountCreatedEvents = await accountFactoryContract.getPastEvents('AccountCreated', {
        filter: { proxy: proxyAddress },
        fromBlock: accountFactoryGenesisBlock,
        toBlock: 'latest',
      })

      if (!accountCreatedEvents.length) {
        return null
      }

      return accountCreatedEvents[0].returnValues.vaultId
    }),
  )
}
