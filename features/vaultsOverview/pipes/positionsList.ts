import { combineLatest, Observable } from 'rxjs'
import { shareReplay } from 'rxjs/internal/operators'
import { map, switchMap } from 'rxjs/operators'

import { Context } from '../../../blockchain/network'
import { IlkWithBalance } from '../../ilks/ilksWithBalances'
import { VaultWithHistory } from '../../vaultHistory/vaultsHistory'

export type PositionDetails = VaultWithHistory &
  IlkWithBalance & {
    isOwner: boolean
  }

export function createPositionsList$(
  context$: Observable<Context>,
  ilksListWithBalances$: Observable<IlkWithBalance[]>,
  vaultsWithHistory$: (address: string) => Observable<VaultWithHistory[]>,
  address: string,
): Observable<PositionDetails[]> {
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
