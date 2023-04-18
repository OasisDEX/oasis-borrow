import { Observable, of } from 'rxjs'
import { first, shareReplay, switchMap } from 'rxjs/operators'
import { AccountFactory__factory, AccountGuard__factory } from 'types/ethers-contracts'

import { getNetworkContracts } from './contracts'
import { Context } from './network'

export interface UserDpmAccount {
  proxy: string
  user: string
  vaultId: string
}

export function getUserDpmProxies$(
  context$: Observable<Context>,
  walletAddress: string,
): Observable<UserDpmAccount[]> {
  if (!walletAddress) {
    return of([])
  }

  return context$.pipe(
    switchMap(async ({ chainId, rpcProvider }) => {
      const { accountFactory, accountGuard } = getNetworkContracts(chainId)
      const accountFactoryContract = AccountFactory__factory.connect(
        accountFactory.address,
        rpcProvider,
      )
      const accountGuardContract = AccountGuard__factory.connect(accountGuard.address, rpcProvider)
      const accountCreatedFilter = accountFactoryContract.filters.AccountCreated(
        null,
        walletAddress,
        null,
      )
      const proxyOwnershipTransferredFilter =
        accountGuardContract.filters.ProxyOwnershipTransferred(walletAddress, null, null)

      const [userAccountCreatedEvents, userProxyOwnershipTransferredEvents] = await Promise.all([
        accountFactoryContract.queryFilter(
          accountCreatedFilter,
          accountFactory.genesisBlock,
          'latest',
        ),
        accountGuardContract.queryFilter(
          proxyOwnershipTransferredFilter,
          accountGuard.genesisBlock,
          'latest',
        ),
      ])

      const userAssumedProxies = [
        ...userAccountCreatedEvents,
        ...userProxyOwnershipTransferredEvents,
      ].map((event) => {
        return event.args.proxy
      })

      const userAssumedProxiesTransferredEvents = await Promise.all(
        userAssumedProxies.map((proxyAddress) =>
          accountGuardContract.queryFilter(
            accountGuardContract.filters.ProxyOwnershipTransferred(null, null, proxyAddress),
            accountGuard.genesisBlock,
            'latest',
          ),
        ),
      )

      const proxiesNotOwnedAnymore = userAssumedProxiesTransferredEvents
        .flatMap((x) => x[x.length - 1])
        .filter((x) => x)
        .flatMap((event) => event)
        .filter((event) => event.args.newOwner.toLowerCase() !== walletAddress.toLowerCase())
        .map((event) => event.args.proxy)

      const userProxies = [
        ...new Set(userAssumedProxies.filter((x) => !proxiesNotOwnedAnymore.includes(x))),
      ]

      const userProxiesData = await Promise.all(
        userProxies.map((proxyAddress) =>
          accountFactoryContract.queryFilter(
            accountFactoryContract.filters.AccountCreated(proxyAddress, null, null),
            accountFactory.genesisBlock,
            'latest',
          ),
        ),
      )

      return userProxiesData.flatMap((item) => ({
        proxy: item[0].args.proxy,
        vaultId: item[0].args.vaultId.toString(),
        user: walletAddress,
      }))
    }),
    shareReplay(1),
  )
}

export function getUserDpmProxy$(
  context$: Observable<Context>,
  vaultId: number,
): Observable<UserDpmAccount | undefined> {
  return context$.pipe(
    switchMap(async ({ chainId, rpcProvider }) => {
      const { accountFactory, accountGuard } = getNetworkContracts(chainId)
      const accountFactoryContract = AccountFactory__factory.connect(
        accountFactory.address,
        rpcProvider,
      )
      const accountGuardContract = AccountGuard__factory.connect(accountGuard.address, rpcProvider)

      const accountCreatedFilter = accountFactoryContract.filters.AccountCreated(
        null,
        null,
        vaultId,
      )
      const userAccountCreatedEvents = await accountFactoryContract.queryFilter(
        accountCreatedFilter,
        accountFactory.genesisBlock,
        'latest',
      )

      const dpmProxy = userAccountCreatedEvents
        .map<UserDpmAccount>((event) => ({
          proxy: event.args.proxy,
          vaultId: event.args.vaultId.toString(),
          user: event.args.user,
        }))
        .reverse()
        .pop()

      if (!dpmProxy) {
        return undefined
      }

      const proxyOwnershipTransferredFilter =
        accountGuardContract.filters.ProxyOwnershipTransferred(null, null, dpmProxy.proxy)

      const userProxyOwnershipTransferredEvents = await accountGuardContract.queryFilter(
        proxyOwnershipTransferredFilter,
        accountGuard.genesisBlock,
        'latest',
      )

      const newestOwner = userProxyOwnershipTransferredEvents
        .map((event) => event.args.newOwner)
        .pop()

      return {
        ...dpmProxy,
        user: newestOwner || dpmProxy.user,
      }
    }),
  )
}

export function getPositionIdFromDpmProxy$(
  context$: Observable<Context>,
  dpmProxy: string,
): Observable<string | undefined> {
  return context$.pipe(
    switchMap(async ({ chainId, rpcProvider }) => {
      const { accountFactory } = getNetworkContracts(chainId)
      const accountFactoryContract = AccountFactory__factory.connect(
        accountFactory.address,
        rpcProvider,
      )

      const filter = accountFactoryContract.filters.AccountCreated(dpmProxy, null, null)
      const event = await accountFactoryContract.queryFilter(
        filter,
        accountFactory.genesisBlock,
        'latest',
      )

      if (!event.length) {
        console.warn('No event found for proxy', dpmProxy)
        return undefined
      }

      return event[0].args.vaultId.toString()
    }),
    first(),
  )
}
