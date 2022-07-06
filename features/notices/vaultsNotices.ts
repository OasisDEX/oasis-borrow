import { BigNumber } from 'bignumber.js'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { PriceInfo } from 'features/shared/priceInfo'
import { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory'
import { zero } from 'helpers/zero'
import moment from 'moment'
import { combineLatest, Observable, of } from 'rxjs'
import { map, startWith, switchMap } from 'rxjs/operators'

type BannerTypes = 'ownership' | 'liquidating' | 'liquidated' | 'liquidatingNextPrice'

export type VaultNoticesState = Pick<
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
    banner?: BannerTypes
    hasBeenLiquidated: boolean
    isVaultController: boolean
  }

function assignBanner(state: VaultNoticesState): VaultNoticesState {
  const {
    hasBeenLiquidated,
    account,
    controller,
    underCollateralized,
    underCollateralizedAtNextPrice,
  } = state

  if (underCollateralized) {
    return {
      ...state,
      banner: 'liquidating',
    }
  }

  if (underCollateralizedAtNextPrice) {
    return {
      ...state,
      banner: 'liquidatingNextPrice',
    }
  }

  if (hasBeenLiquidated) {
    return {
      ...state,
      banner: 'liquidated',
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
  return event.kind === 'AUCTION_STARTED' || event.kind === 'AUCTION_STARTED_V2'
}

function eventsFromLastWeek(event: VaultHistoryEvent) {
  return moment(event.timestamp).isAfter(moment().subtract(1, 'weeks'))
}

export function createVaultsNotices$(
  context$: Observable<Context>,
  priceInfo$: (token: string) => Observable<PriceInfo>,
  vault$: (id: BigNumber, chainId: number) => Observable<Vault>,
  vaultHistory$: (id: BigNumber, chainId: number) => Observable<VaultHistoryEvent[]>,
  id: BigNumber,
): Observable<VaultNoticesState> {
  return context$.pipe(
    switchMap((context) => {
      return combineLatest(
        vault$(id, context.chainId),
        vaultHistory$(id, context.chainId).pipe(startWith([] as VaultHistoryEvent[])),
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

            const isVaultController =
              context.status === 'connected' ? context.account === controller : false

            const state = {
              token,
              id,
              liquidationPrice,
              controller,
              unlockedCollateral,
              underCollateralized,
              underCollateralizedAtNextPrice,
              hasBeenLiquidated: auctionsStarted.length > 0 || unlockedCollateral.gt(zero),
              isVaultController,
            }

            if (context.status !== 'connected') {
              return of(state as VaultNoticesState)
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
