import { getNetworkId } from '@oasisdex/web3-context'
import { Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { AccountFactory } from 'types/web3-v1-contracts/account-factory'
import { AccountGuard } from 'types/web3-v1-contracts/account-guard'

import { Context, NetworkIds } from './network'

const accountFactoryGenesisBlockGoerli = 8048105
const accountFactoryGenesisBlockMainnet = 16047226

const accountFactoryNetworkMap = {
  [NetworkIds.MAINNET]: accountFactoryGenesisBlockMainnet,
  [NetworkIds.HARDHAT]: accountFactoryGenesisBlockMainnet,
  [NetworkIds.GOERLI]: accountFactoryGenesisBlockGoerli,
}

const accountGuardGenesisBlockGoerli = 8048103
const accountGuardGenesisBlockMainnet = 16047224

const accountGuardNetworkMap = {
  [NetworkIds.MAINNET]: accountGuardGenesisBlockMainnet,
  [NetworkIds.HARDHAT]: accountGuardGenesisBlockMainnet,
  [NetworkIds.GOERLI]: accountGuardGenesisBlockGoerli,
}

export function getUserDpmProxies$(
  context$: Observable<Context>,
  walletAddress: string,
): Observable<string[]> {
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

      const transferredUserProxies = userAssumedProxiesTransferredEvents
        .flatMap((x) => x[x.length - 1])
        .filter((x) => x)
        .flatMap((event) => event)
        .filter(
          (event) => event.returnValues.newOwner.toLowerCase() !== walletAddress.toLowerCase(),
        )
        .map((event) => event.returnValues.proxy)

      return [...new Set(userAssumedProxies.filter((x) => !transferredUserProxies.includes(x)))]
    }),
  )
}
