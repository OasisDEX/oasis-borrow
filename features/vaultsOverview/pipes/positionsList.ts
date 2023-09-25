import type { Context } from 'blockchain/network.types'
import type { IlkWithBalance } from 'features/ilks/ilksWithBalances'
import type { VaultWithHistory } from 'features/vaultHistory/vaultsHistory.types'
import type { Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
import { shareReplay } from 'rxjs/internal/operators'
import { map, switchMap } from 'rxjs/operators'

export type MakerPositionDetails = VaultWithHistory &
  IlkWithBalance & {
    isOwner: boolean
  }

export function createMakerPositionsList$(
  context$: Observable<Context>,
  ilksListWithBalances$: Observable<IlkWithBalance[]>,
  vaultsWithHistory$: (address: string) => Observable<VaultWithHistory[]>,
  address: string,
): Observable<MakerPositionDetails[]> {
  return vaultsWithHistory$(address).pipe(
    switchMap((vaultsWithHistory) =>
      combineLatest(context$, ilksListWithBalances$).pipe(
        map(([context, ilksListWithBalances]) => {
          return vaultsWithHistory.map((vaultWithHistory) => {
            const balance = ilksListWithBalances.find(
              (balance) => balance.ilk === vaultWithHistory.ilk,
            )
            const isOwner =
              context.status === 'connected' && context.account === vaultWithHistory.controller
            return {
              ...vaultWithHistory,
              ...balance,
              isOwner,
            }
          })
        }),
      ),
    ),
    shareReplay(1),
  )
}
