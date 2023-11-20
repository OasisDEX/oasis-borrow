import type BigNumber from 'bignumber.js'
import type { ContextConnected } from 'blockchain/network.types'
import type { Vault } from 'blockchain/vaults.types'
import type { PositionCreated } from 'features/aave/services'
import type { Web3Context } from 'features/web3Context'
import { getLocalAppConfig } from 'helpers/config'
import { startWithDefault } from 'helpers/operators'
import type { Observable } from 'rxjs'
import { combineLatest, of } from 'rxjs'
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
  hasActiveDsProxyAavePosition$: Observable<boolean>,
  readPositionCreatedEvents$: (wallet: string) => Observable<PositionCreated[]>,
  ensName$: (address: string) => Observable<string>,
): Observable<AccountDetails> {
  const { NewPortfolio } = getLocalAppConfig('features')
  return context$.pipe(
    filter((context): context is ContextConnected => context.status === 'connected'),
    switchMap((context) =>
      combineLatest(
        startWithDefault(balance$('DAI', context.account), undefined),
        startWithDefault(
          NewPortfolio ? of(0) : vaults$(context.account).pipe(map((vault) => vault.length)),
          undefined,
        ),
        startWithDefault(ensName$(context.account), null),
        startWithDefault(hasActiveDsProxyAavePosition$, false),
        startWithDefault(
          NewPortfolio ? of(undefined) : readPositionCreatedEvents$(context.account),
          [],
        ),
      ).pipe(
        map(([balance, numberOfVaults, ensName, hasAavePosition, dpmPositionCreatedEvents]) => {
          // dpm valuts contains aave & ajna positions
          const numberOfDpmVaults = dpmPositionCreatedEvents?.length
            ? dpmPositionCreatedEvents.length
            : 0
          // only one position per user is allowed on ds proxys
          const numberOfAavePositions = hasAavePosition ? 1 : 0

          return {
            numberOfVaults: (numberOfVaults ?? 0) + numberOfDpmVaults + numberOfAavePositions,
            daiBalance: balance,
            ensName,
          }
        }),
      ),
    ),
    shareReplay(1),
  )
}
