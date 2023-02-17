import { getNetworkId } from '@oasisdex/web3-context'
import { accountFactoryNetworkMap } from 'blockchain/dpm/accountFactory'
import { accountGuardNetworkMap } from 'blockchain/dpm/accountGuard'
import { Observable, of } from 'rxjs'
import { first, shareReplay, switchMap } from 'rxjs/operators'
import { AccountFactory } from 'types/web3-v1-contracts/account-factory'
import { AccountGuard } from 'types/web3-v1-contracts/account-guard'

import { Context, NetworkIds } from './network'

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

  const chainId = getNetworkId() as NetworkIds
  const accountGuardGenesisBlock = accountGuardNetworkMap[chainId]
  const accountFactoryGenesisBlock = accountFactoryNetworkMap[chainId]

  return context$.pipe(
    switchMap(async ({ accountFactory, accountGuard, contract }) => {
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
    shareReplay(1),
  )
}

export function getUserDpmProxy$(
  context$: Observable<Context>,
  vaultId: number,
): Observable<UserDpmAccount | undefined> {
  return context$.pipe(
    switchMap(async ({ accountFactory, accountGuard, contract }) => {
      const accountFactoryContract = contract<AccountFactory>(accountFactory)
      const accountGuardContract = contract<AccountGuard>(accountGuard)

      const chainId = getNetworkId() as NetworkIds
      const accountFactoryGenesisBlock = accountFactoryNetworkMap[chainId]
      const accountGuardGenesisBlock = accountGuardNetworkMap[chainId]

      const userAccountCreatedEvents = await accountFactoryContract.getPastEvents(
        'AccountCreated',
        {
          filter: { vaultId: vaultId.toString() },
          fromBlock: accountFactoryGenesisBlock,
          toBlock: 'latest',
        },
      )

      const dpmProxy = userAccountCreatedEvents
        .map<UserDpmAccount>((event) => ({
          proxy: event.returnValues.proxy,
          vaultId: event.returnValues.vaultId,
          user: event.returnValues.user,
        }))
        .reverse()
        .pop()

      if (!dpmProxy) {
        return undefined
      }

      const userProxyOwnershipTransferredEvents = await accountGuardContract.getPastEvents(
        'ProxyOwnershipTransferred',
        {
          filter: { proxy: dpmProxy.proxy },
          fromBlock: accountGuardGenesisBlock,
          toBlock: 'latest',
        },
      )

      const newestOwner = userProxyOwnershipTransferredEvents
        .map<string>((event) => event.returnValues.newOwner)
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
  const chainId = getNetworkId() as NetworkIds
  const accountFactoryGenesisBlock = accountFactoryNetworkMap[chainId]

  return context$.pipe(
    switchMap(async ({ accountFactory, contract }) => {
      const accountFactoryContract = contract<AccountFactory>(accountFactory)

      const event = await accountFactoryContract.getPastEvents('AccountCreated', {
        filter: { proxy: dpmProxy },
        fromBlock: accountFactoryGenesisBlock,
        toBlock: 'latest',
      })

      if (!event.length) {
        console.warn('No event found for proxy', dpmProxy)
        return undefined
      }

      return event[0].returnValues.vaultId
    }),
    first(),
  )
}

export function getDpmProxyFromPositionId$(
  context$: Observable<Context>,
  vaultId: string,
): Observable<string | undefined> {
  const chainId = getNetworkId() as NetworkIds
  const accountFactoryGenesisBlock = accountFactoryNetworkMap[chainId]

  return context$.pipe(
    switchMap(async ({ accountFactory, contract }) => {
      const accountFactoryContract = contract<AccountFactory>(accountFactory)

      const event = await accountFactoryContract.getPastEvents('AccountCreated', {
        filter: { vaultId },
        fromBlock: accountFactoryGenesisBlock,
        toBlock: 'latest',
      })

      if (!event.length) {
        console.warn('No event found for vaultId', vaultId)
        return undefined
      }

      return event[0].returnValues.proxy
    }),
    first(),
  )
}