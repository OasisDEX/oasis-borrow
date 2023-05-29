import { BaseContract, ethers } from 'ethers'
import { ContractDesc } from 'features/web3Context'
import { Observable, of } from 'rxjs'
import { catchError, first, shareReplay, switchMap } from 'rxjs/operators'
import { AccountFactory__factory, AccountGuard__factory } from 'types/ethers-contracts'
import { TypedEvent, TypedEventFilter } from 'types/ethers-contracts/common'

import { getNetworkContracts } from './contracts'
import { Context } from './network'
import { getRpcProvidersForLogs, NetworkIds } from './networks'

export interface UserDpmAccount {
  proxy: string
  user: string
  vaultId: string
}

function ensureAccountFactoryAndAccountGroundExist(
  chainId: NetworkIds,
  contracts: ReturnType<typeof getNetworkContracts>,
): asserts contracts is {
  accountFactory: ContractDesc & { genesisBlock: number }
  accountGuard: ContractDesc & { genesisBlock: number }
} {
  if (!contracts.hasOwnProperty('accountFactory') || !contracts.hasOwnProperty('accountGuard')) {
    throw new Error(`AccountFactory or AccountGuard not found on ${chainId}`)
  }
}

type GetLogsDelegate = <TEvent extends TypedEvent<any, any>>(
  topic: TypedEventFilter<TEvent>,
) => Promise<TEvent[]>

async function extendContract<TContract extends BaseContract>(
  contractDesc: ContractDesc & { genesisBlock: number },
  factory: {
    connect: (address: string, provider: ethers.providers.Provider) => TContract
  },
  mainProvider: ethers.providers.Provider,
  forkProvider?: ethers.providers.Provider,
): Promise<TContract & { getLogs: GetLogsDelegate }> {
  const contract = factory.connect(contractDesc.address, mainProvider)

  if (!forkProvider) {
    return {
      ...contract,
      getLogs: (topic) => contract.queryFilter(topic, contractDesc.genesisBlock, 'latest') as any,
    }
  }

  const forkContract = AccountFactory__factory.connect(contractDesc.address, forkProvider)
  const forkBlockNumber = await forkProvider.getBlockNumber()

  const mainRpcBlocks = {
    from: contractDesc.genesisBlock,
    to: forkBlockNumber - 1000,
  }
  const forkRpcBlocks = {
    from: forkBlockNumber - 1000 + 1,
    to: forkBlockNumber,
  }

  return {
    ...contract,
    getLogs: (topic) =>
      Promise.all([
        contract.queryFilter(topic, mainRpcBlocks.from, mainRpcBlocks.to),
        forkContract.queryFilter(topic, forkRpcBlocks.from, forkRpcBlocks.to),
      ]).then(([mainLogs, forkLogs]) => [...mainLogs, ...forkLogs]) as any,
  }
}
export function getUserDpmProxies$(
  context$: Observable<Context>,
  walletAddress: string,
): Observable<UserDpmAccount[]> {
  if (!walletAddress) {
    return of([])
  }

  return context$.pipe(
    switchMap(async ({ chainId }) => {
      const contracts = getNetworkContracts(chainId)
      ensureAccountFactoryAndAccountGroundExist(chainId, contracts)
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
      // Figure out Sentry logging pattern.
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
    switchMap(async ({ chainId }) => {
      const contracts = getNetworkContracts(chainId)
      ensureAccountFactoryAndAccountGroundExist(chainId, contracts)
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
        null,
        vaultId,
      )
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

      const proxyOwnershipTransferredFilter =
        accountGuardContract.filters.ProxyOwnershipTransferred(null, null, dpmProxy.proxy)

      const userProxyOwnershipTransferredEvents = await accountGuardContract.getLogs(
        proxyOwnershipTransferredFilter,
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
    switchMap(async ({ chainId }) => {
      const contracts = getNetworkContracts(chainId)
      ensureAccountFactoryAndAccountGroundExist(chainId, contracts)
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
