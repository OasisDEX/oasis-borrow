import { BigNumber } from 'bignumber.js'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { PriceInfo } from 'features/shared/priceInfo'
import { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory'
import moment from 'moment'
import { combineLatest, Observable, of } from 'rxjs'
import { map, startWith, switchMap } from 'rxjs/operators'

type VaultBannersState = Pick<
  Vault,
  | 'id'
  | 'token'
  | 'controller'
  | 'underCollateralized'
  | 'underCollateralizedAtNextPrice'
  | 'unlockedCollateral'
> &
  Pick<PriceInfo, 'dateNextCollateralPrice'> & {
    account?: string
    banner?: 'ownership' | 'liquidating' | 'liquidated'
    hasBeenLiquidated: boolean
  }

function assignBanner(state: VaultBannersState): VaultBannersState {
  const {
    hasBeenLiquidated,
    account,
    controller,
    underCollateralized,
    underCollateralizedAtNextPrice,
  } = state

  if (hasBeenLiquidated) {
    return {
      ...state,
      banner: 'liquidated',
    }
  }

  if (underCollateralized || underCollateralizedAtNextPrice) {
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
        switchMap(
          ([
            {
              token,
              liquidationPrice,
              controller,
              unlockedCollateral,
              underCollateralized,
              underCollateralizedAtNextPrice,
            },
            events,
          ]) => {
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
              underCollateralized,
              underCollateralizedAtNextPrice,
            }

            if (context.status !== 'connected') {
              return of(state as VaultBannersState)
            }

            return priceInfo$(token).pipe(
              map(({ dateNextCollateralPrice }) => {
                return {
                  ...state,
                  account: context.account,
                  dateNextCollateralPrice,
                }
              }),
            )
          },
        ),
        map(assignBanner),
      )
    }),
  )
}
