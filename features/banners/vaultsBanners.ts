import { BigNumber } from 'bignumber.js'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import {
  manageVaultReclaimCollateral,
  ReclaimChange,
} from 'features/manageVault/manageVaultTransactions'
import { PriceInfo } from 'features/shared/priceInfo'
import { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory'
import { Change } from 'helpers/form'
import moment from 'moment'
import { combineLatest, Observable, of, Subject } from 'rxjs'
import { map, mergeMap, scan, startWith, switchMap } from 'rxjs/operators'

export interface VaultBannersState {
  banner?: 'ownership' | 'liquidating' | 'liquidated'
  controller: string
  account?: string
  token: string
  ilk: string
  id: BigNumber
  hasBeenLiquidated: boolean
  liquidationPrice: BigNumber
  nextCollateralPrice?: BigNumber
  unlockedCollateral: BigNumber
  dateNextCollateralPrice?: Date | undefined
  reclaimTxState:
    | 'reclaimWaitingForApproval'
    | 'reclaimInProgress'
    | 'reclaimFailure'
    | 'reclaimSuccess'
  reclaim: () => void
}

function assignBanner(state: VaultBannersState): VaultBannersState {
  const { hasBeenLiquidated, nextCollateralPrice, liquidationPrice, account, controller } = state

  if (hasBeenLiquidated) {
    return {
      ...state,
      banner: 'liquidated',
    }
  }

  if (nextCollateralPrice?.lt(liquidationPrice)) {
    return {
      ...state,
      banner: 'liquidating',
    }
  }

  if (!account || account !== controller) {
    return {
      ...state,
      banner: 'ownership',
    }
  }

  return state
}

function apply(state: any, change: ReclaimChange) {
  return {
    ...state,
    reclaimTxState: change.kind,
  }
}

export type ManualChange = Change<VaultBannersState, 'reclaimTxState'>

export function createVaultsBanners$(
  context$: Observable<Context>,
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  priceInfo$: (token: string) => Observable<PriceInfo>,
  vault$: (id: BigNumber) => Observable<Vault>,
  vaultHistory$: (id: BigNumber) => Observable<VaultHistoryEvent[]>,
  id: BigNumber,
): Observable<VaultBannersState> {
  const change$ = new Subject<any>()

  function change(ch: ReclaimChange) {
    change$.next(ch)
  }
  return context$.pipe(
    switchMap((context) => {
      return combineLatest(vault$(id), vaultHistory$(id)).pipe(
        switchMap(([{ token, ilk, liquidationPrice, controller, unlockedCollateral }, events]) => {
          // All started auctions in the past week orders in a desc order by timestamp ( recent ones first )
          const auctionsStarted = events
            .filter((event) => event.kind === 'AUCTION_STARTED')
            .map((event) => parseInt(event.timestamp) >= moment().subtract(1, 'weeks').unix())
            .sort((prev, next) => {
              if (prev > next) return -1
              if (prev < next) return 1
              return 0
            })

          const state = {
            token,
            id,
            ilk,
            liquidationPrice,
            controller,
            unlockedCollateral,
            hasBeenLiquidated: auctionsStarted.length > 0,
          }

          if (context.status !== 'connected') {
            return of(state as VaultBannersState)
          }

          return combineLatest(priceInfo$(token), txHelpers$, proxyAddress$(context.account)).pipe(
            mergeMap(
              ([{ nextCollateralPrice, dateNextCollateralPrice }, txHelpers, proxyAddress]) => {
                return change$.pipe(
                  scan(apply, state),
                  startWith(state),
                  map((state) => {
                    return {
                      ...state,
                      account: context.account,
                      reclaim: () =>
                        manageVaultReclaimCollateral(
                          txHelpers,
                          change,
                          proxyAddress!,
                          state as VaultBannersState,
                        ),
                      nextCollateralPrice,
                      dateNextCollateralPrice,
                    }
                  }),
                )
              },
            ),
          )
        }),
        map(assignBanner),
      )
    }),
  )
}
