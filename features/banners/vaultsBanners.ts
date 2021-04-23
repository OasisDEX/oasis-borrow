import { BigNumber } from 'bignumber.js'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { PriceInfo } from 'features/shared/priceInfo'
import { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory'
import moment from 'moment'
import { combineLatest, Observable, of } from 'rxjs'
import { map, startWith, switchMap } from 'rxjs/operators'

interface VaultBannersState {
  banner?: 'ownership' | 'liquidating' | 'liquidated'
  controller: string
  account?: string
  token: string
  id: BigNumber
  hasBeenLiquidated: boolean
  liquidationPrice: BigNumber
  nextCollateralPrice: BigNumber
  unlockedCollateral: BigNumber
  dateNextCollateralPrice?: Date | undefined
}

function assignBanner(state: VaultBannersState): VaultBannersState {
  const { hasBeenLiquidated, nextCollateralPrice, liquidationPrice, account, controller } = state

  if (hasBeenLiquidated) {
    return {
      ...state,
      banner: 'liquidated',
    }
  }

  if (nextCollateralPrice.lt(liquidationPrice)) {
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

function onlyAuctionStartedEvents(event: VaultHistoryEvent) {
  return event.kind === 'AUCTION_STARTED'
}

function eventsFromLastWeek(event: VaultHistoryEvent) {
  return moment(event.timestamp).isAfter(moment().subtract(1, 'weeks'))
}

export function createVaultsBanners$(
  context$: Observable<Context>,
  priceInfo$: (token: string) => Observable<PriceInfo>,
  vault$: (id: BigNumber) => Observable<Vault>,
  vaultHistory$: (id: BigNumber) => Observable<VaultHistoryEvent[]>,
  id: BigNumber,
): Observable<VaultBannersState> {
  return context$.pipe(
    switchMap((context) => {
      return combineLatest(
        vault$(id),
        vaultHistory$(id).pipe(startWith([] as VaultHistoryEvent[])),
      ).pipe(
        switchMap(([{ token, liquidationPrice, controller, unlockedCollateral }, events]) => {
          const auctionsStarted = events
            .filter((event) => onlyAuctionStartedEvents(event) && eventsFromLastWeek(event))
            .map((event) => new Date(event.timestamp).getTime())
            .sort((prev, next) => {
              if (prev > next) return -1
              if (prev < next) return 1
              return 0
            })

          const state = {
            token,
            id,
            liquidationPrice,
            controller,
            unlockedCollateral,
            hasBeenLiquidated: auctionsStarted.length > 0,
          }

          if (context.status !== 'connected') {
            return of(state as VaultBannersState)
          }

          return priceInfo$(token).pipe(
            map(({ nextCollateralPrice, dateNextCollateralPrice }) => {
              return {
                ...state,
                account: context.account,
                nextCollateralPrice,
                dateNextCollateralPrice,
              }
            }),
          )
        }),
        map(assignBanner),
      )
    }),
  )
}
