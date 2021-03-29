import { BigNumber } from 'bignumber.js'
import { Vault } from 'blockchain/vaults'
import { UserTokenInfo } from 'features/shared/userTokenInfo'
import { Observable } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import { ContextConnected } from '@oasisdex/transactions/lib/src/callHelpersContextParametrized'

interface VaultBannersState {
  token: string
  id: BigNumber
  liquidationPrice: BigNumber
  nextCollateralPrice?: BigNumber
  dateNextCollateralPrice?: Date | undefined
}

export function createVaultsBanners$(
  context$: Observable<ContextConnected>,
  userTokenInfo$: (token: string, account: string) => Observable<UserTokenInfo>,
  vault$: (id: BigNumber) => Observable<Vault>,
  id: BigNumber,
): Observable<VaultBannersState> {
  return context$.pipe(
    switchMap(({ account }) => {
      return vault$(id).pipe(
        switchMap(({ token, liquidationPrice }) => {
          return userTokenInfo$(token, account).pipe(
            map(({ nextCollateralPrice, dateNextCollateralPrice }) => {
              return {
                token,
                id,
                liquidationPrice,
                nextCollateralPrice,
                dateNextCollateralPrice,
              }
            }),
          )
        }),
      )
    }),
  )
}
