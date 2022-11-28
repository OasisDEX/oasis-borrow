import { Web3Context } from '@oasisdex/web3-context'
import BigNumber from 'bignumber.js'
import { ContextConnected } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { startWithDefault } from 'helpers/operators'
import { combineLatest, Observable } from 'rxjs'
import { filter, map, shareReplay, switchMap } from 'rxjs/operators'

export interface AccountDetails {
  numberOfVaults: number | undefined
  daiBalance: BigNumber | undefined
  ensName: string | null
}

export function createAccountData(
  context$: Observable<Web3Context>,
  balance$: (token: string, address: string) => Observable<BigNumber>,
  vaults$: (address: string) => Observable<Vault[]>,
  hasAavePosition$: (address: string) => Observable<boolean>,
  ensName$: (address: string) => Observable<string>,
): Observable<AccountDetails> {
  return context$.pipe(
    filter((context): context is ContextConnected => context.status === 'connected'),
    switchMap((context) =>
      combineLatest(
        startWithDefault(balance$('DAI', context.account), undefined),
        startWithDefault(vaults$(context.account).pipe(map((vault) => vault.length)), undefined),
        startWithDefault(ensName$(context.account), null),
        startWithDefault(hasAavePosition$(context.account), false),
      ).pipe(
        map(([balance, numberOfVaults, ensName, hasAavePosition]) => ({
          numberOfVaults: hasAavePosition ? (numberOfVaults || 0) + 1 : numberOfVaults,
          daiBalance: balance,
          ensName,
        })),
      ),
    ),
    shareReplay(1),
  )
}
