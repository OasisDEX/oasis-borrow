import { Web3Context } from '@oasisdex/web3-context'
import BigNumber from 'bignumber.js'
import { ContextConnected } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { startWithDefault } from 'helpers/operators'
import { combineLatest, Observable } from 'rxjs'
import { filter, map, switchMap } from 'rxjs/operators'

export interface AccountDetails {
  numberOfVaults: number | undefined
  daiBalance: BigNumber | undefined
}

export function createAccountData(
  context$: Observable<Web3Context>,
  balance$: (token: string, address: string) => Observable<BigNumber>,
  vaults$: (address: string) => Observable<Vault[]>,
): Observable<AccountDetails> {
  return context$.pipe(
    filter((context): context is ContextConnected => context.status === 'connected'),
    switchMap((context) =>
      combineLatest(
        startWithDefault(balance$('DAI', context.account), undefined),
        startWithDefault(vaults$(context.account).pipe(map((vault) => vault.length)), undefined),
      ).pipe(
        map(([balance, numberOfVaults]) => ({
          numberOfVaults,
          daiBalance: balance,
        })),
      ),
    ),
  )
}
