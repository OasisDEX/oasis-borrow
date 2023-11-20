import type BigNumber from 'bignumber.js'
import type { ContextConnected } from 'blockchain/network.types'
import type { Web3Context } from 'features/web3Context'
import { fetchPortfolioPositionsCount } from 'helpers/clients/portfolio-positions-count'
import { startWithDefault } from 'helpers/operators'
import type { Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
import { fromPromise } from 'rxjs/internal-compatibility'
import { filter, map, shareReplay, switchMap } from 'rxjs/operators'

export interface AccountDetails {
  amountOfPositions: number | undefined
  daiBalance: BigNumber | undefined
  ensName: string | null
}

export function createAccountData(
  context$: Observable<Web3Context>,
  balance$: (token: string, address: string) => Observable<BigNumber>,
  ensName$: (address: string) => Observable<string>,
): Observable<AccountDetails> {
  return context$.pipe(
    filter((context): context is ContextConnected => context.status === 'connected'),
    switchMap((context) =>
      combineLatest(
        startWithDefault(balance$('DAI', context.account), undefined),
        startWithDefault(ensName$(context.account), null),
        startWithDefault(fromPromise(fetchPortfolioPositionsCount(context.account)), undefined),
      ).pipe(
        map(([balance, ensName, portfolioPositions]) => {
          return {
            amountOfPositions: portfolioPositions?.positions.length,
            daiBalance: balance,
            ensName,
          }
        }),
      ),
    ),
    shareReplay(1),
  )
}
