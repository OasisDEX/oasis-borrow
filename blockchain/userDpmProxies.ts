import type { Observable } from 'rxjs'
import { of } from 'rxjs'
import { catchError, first, shareReplay, switchMap } from 'rxjs/operators'
import { AccountFactory__factory, AccountGuard__factory } from 'types/ethers-contracts'

import { ensureContractsExist, extendContract, getNetworkContracts } from './contracts'
import type { Context } from './network.types'
import type { NetworkIds } from './networks'
import { getRpcProvidersForLogs } from './networks'
import type { UserDpmAccount } from './userDpmProxies.types'

export function getUserDpmProxies$(
  context$: Observable<Pick<Context, 'chainId'>>,
  walletAddress: string,
): Observable<UserDpmAccount[]> {
  if (!walletAddress) {
    return of([])
  }

  return context$.pipe(
    switchMap(async ({ chainId }) => {
      const contracts = getNetworkContracts(chainId)
      ensureContractsExist(chainId, contracts, ['accountFactory', 'accountGuard'])
      const { accountFactory, accountGuard } = contracts
      const { mainProvider, forkProvider } = getRpcProvidersForLogs(chainId)

      const accountFactoryContract = await extendContract(
        accountFactory,
        AccountFactory__factory,
        mainProvider,
        forkProvider,
      )

      const accountGuardContract = await extendContract(
        accountGuard,
        AccountGuard__factory,
        mainProvider,
        forkProvider,
      )

      const accountCreatedFilter = accountFactoryContract.filters.AccountCreated(
        null,
        walletAddress,
        null,
      )
      const proxyOwnershipTransferredFilter =
        accountGuardContract.filters.ProxyOwnershipTransferred(walletAddress, null, null)

      const [userAccountCreatedEvents, userProxyOwnershipTransferredEvents] = await Promise.all([
        accountFactoryContract.getLogs(accountCreatedFilter),
        accountGuardContract.getLogs(proxyOwnershipTransferredFilter),
      ])

      const userAssumedProxies = [
        ...userAccountCreatedEvents,
        ...userProxyOwnershipTransferredEvents,
      ].map((event) => {
        return event.args.proxy
      })

      const userAssumedProxiesTransferredEvents = await Promise.all(
        userAssumedProxies.map((proxyAddress) =>
          accountGuardContract.getLogs(
            accountGuardContract.filters.ProxyOwnershipTransferred(null, null, proxyAddress),
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
          accountFactoryContract.getLogs(
            accountFactoryContract.filters.AccountCreated(proxyAddress, null, null),
          ),
        ),
      )

      return userProxiesData.flatMap((item) => ({
        proxy: item[0].args.proxy,
        vaultId: item[0].args.vaultId.toString(),
        user: walletAddress,
      }))
    }),
    catchError((error) => {
      console.error(`Error getting user DPM proxies`, walletAddress, error)
      return of([])
    }),
    shareReplay(1),
  )
}

export function getUserDpmProxy$(
  context$: Observable<Context>,
  vaultId: number,
): Observable<UserDpmAccount | undefined> {
  return context$.pipe(
    switchMap(({ chainId }) => {
      return getUserDpmProxy(vaultId, chainId)
    }),
  )
}

export async function getUserDpmProxy(
  vaultId: number,
  chainId: NetworkIds,
): Promise<UserDpmAccount | undefined> {
  const contracts = getNetworkContracts(chainId)
  ensureContractsExist(chainId, contracts, ['accountFactory', 'accountGuard'])
  const { accountFactory, accountGuard } = contracts

  const { mainProvider, forkProvider } = getRpcProvidersForLogs(chainId)

  const accountFactoryContract = await extendContract(
    accountFactory,
    AccountFactory__factory,
    mainProvider,
    forkProvider,
  )
  const accountGuardContract = await extendContract(
    accountGuard,
    AccountGuard__factory,
    mainProvider,
    forkProvider,
  )

  const accountCreatedFilter = accountFactoryContract.filters.AccountCreated(null, null, vaultId)
  const userAccountCreatedEvents = await accountFactoryContract.getLogs(accountCreatedFilter)

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

  const proxyOwnershipTransferredFilter = accountGuardContract.filters.ProxyOwnershipTransferred(
    null,
    null,
    dpmProxy.proxy,
  )

  const userProxyOwnershipTransferredEvents = await accountGuardContract.getLogs(
    proxyOwnershipTransferredFilter,
  )

  const newestOwner = userProxyOwnershipTransferredEvents.map((event) => event.args.newOwner).pop()

  return {
    ...dpmProxy,
    user: newestOwner || dpmProxy.user,
  }
}

export function getPositionIdFromDpmProxy$(
  context$: Observable<{ chainId: NetworkIds }>,
  dpmProxy: string,
): Observable<string | undefined> {
  return context$.pipe(
    switchMap(async ({ chainId }) => {
      const contracts = getNetworkContracts(chainId)
      ensureContractsExist(chainId, contracts, ['accountFactory'])
      const { accountFactory } = contracts
      const { mainProvider, forkProvider } = getRpcProvidersForLogs(chainId)
      const accountFactoryContract = await extendContract(
        accountFactory,
        AccountFactory__factory,
        mainProvider,
        forkProvider,
      )

      const filter = accountFactoryContract.filters.AccountCreated(dpmProxy, null, null)
      let events = []
      try {
        events = await accountFactoryContract.getLogs(filter)
      } catch (e) {
        console.error('Error getting events for proxy', dpmProxy, e)
        return undefined
      }

      if (!events.length) {
        console.warn('No event found for proxy', dpmProxy)
        return undefined
      }

      return events[0].args.vaultId.toString()
    }),
    first(),
  )
}
