import { getNetworkId } from '@oasisdex/web3-context'
import { accountFactoryNetworkMap } from 'blockchain/dpm/accountFactory'
import { accountGuardNetworkMap } from 'blockchain/dpm/accountGuard'
import { combineLatest, Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { AccountFactory } from 'types/web3-v1-contracts/account-factory'
import { AccountGuard } from 'types/web3-v1-contracts/account-guard'

import { Context, NetworkIds } from './network'

interface UserDpmProxy {
  proxy: string
  user: string
  vaultId: string
}

export function getUserDpmProxies$(
  context$: Observable<Context>,
  onEveryBlock$: Observable<number>,
  walletAddress: string,
): Observable<UserDpmProxy[]> {
  if (!walletAddress) {
    return of([])
  }

  const chainId = getNetworkId() as NetworkIds
  const accountGuardGenesisBlock = accountGuardNetworkMap[chainId]
  const accountFactoryGenesisBlock = accountFactoryNetworkMap[chainId]

  return combineLatest(context$, onEveryBlock$).pipe(
    switchMap(async ([{ accountFactory, accountGuard, contract }]) => {
      const accountFactoryContract = contract<AccountFactory>(accountFactory)
      const accountGuardContract = contract<AccountGuard>(accountGuard)

      const [userAccountCreatedEvents, userProxyOwnershipTransferredEvents] = await Promise.all([
        accountFactoryContract.getPastEvents('AccountCreated', {
          filter: { user: walletAddress },
          fromBlock: accountFactoryGenesisBlock,
          toBlock: 'latest',
        }),
        accountGuardContract.getPastEvents('ProxyOwnershipTransferred', {
          filter: { newOwner: walletAddress },
          fromBlock: accountGuardGenesisBlock,
          toBlock: 'latest',
        }),
      ])

      const userAssumedProxies = [
        ...userAccountCreatedEvents,
        ...userProxyOwnershipTransferredEvents,
      ].map((event) => event.returnValues.proxy)

      const userAssumedProxiesTransferredEvents = await Promise.all(
        userAssumedProxies.map((proxyAddress) =>
          accountGuardContract.getPastEvents('ProxyOwnershipTransferred', {
            filter: { proxy: proxyAddress },
            fromBlock: accountGuardGenesisBlock,
            toBlock: 'latest',
          }),
        ),
      )

      const proxiesNotOwnedAnymore = userAssumedProxiesTransferredEvents
        .flatMap((x) => x[x.length - 1])
        .filter((x) => x)
        .flatMap((event) => event)
        .filter(
          (event) => event.returnValues.newOwner.toLowerCase() !== walletAddress.toLowerCase(),
        )
        .map((event) => event.returnValues.proxy)

      const userProxies = [
        ...new Set(userAssumedProxies.filter((x) => !proxiesNotOwnedAnymore.includes(x))),
      ]

      const userProxiesData = await Promise.all(
        userProxies.map((proxyAddress) =>
          accountFactoryContract.getPastEvents('AccountCreated', {
            filter: { proxy: proxyAddress },
            fromBlock: accountFactoryGenesisBlock,
            toBlock: 'latest',
          }),
        ),
      )

      return userProxiesData.flatMap((item) => ({
        proxy: item[0].returnValues.proxy,
        vaultId: item[0].returnValues.vaultId,
        user: walletAddress,
      }))
    }),
  )
}
