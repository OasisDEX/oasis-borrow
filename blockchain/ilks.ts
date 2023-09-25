import BigNumber from 'bignumber.js'
import type { dogIlk } from 'blockchain/calls/dog'
import type { jugIlk } from 'blockchain/calls/jug'
import type { CallObservable } from 'blockchain/calls/observe'
import type { spotIlk } from 'blockchain/calls/spot'
import type { vatIlk } from 'blockchain/calls/vat'
import { one, zero } from 'helpers/zero'
import type { Observable } from 'rxjs'
import { combineLatest, of } from 'rxjs'
import { distinctUntilChanged, map, retry, shareReplay, switchMap } from 'rxjs/operators'

import { getNetworkContracts } from './contracts'
import { COLLATERALIZATION_DANGER_OFFSET, COLLATERALIZATION_WARNING_OFFSET } from './ilks.constants'
import type { IlkData, IlkDataChange, IlkDataList } from './ilks.types'
import type { Context } from './network.types'
import { NetworkIds } from './networks'

export function createIlksSupportedOnNetwork$(context$: Observable<Context>): Observable<string[]> {
  return context$.pipe(
    map((context) =>
      Object.keys(getNetworkContracts(NetworkIds.MAINNET, context.chainId).joins).filter(
        (join) => !['DAI', 'SAI'].includes(join),
      ),
    ),
  )
}

export function createIlkData$(
  vatIlks$: CallObservable<typeof vatIlk>,
  spotIlks$: CallObservable<typeof spotIlk>,
  jugIlks$: CallObservable<typeof jugIlk>,
  dogIlks$: CallObservable<typeof dogIlk>,
  ilkToToken$: (ilk: string) => Observable<string>,
  ilk: string,
): Observable<IlkData> {
  return combineLatest(
    vatIlks$(ilk),
    spotIlks$(ilk),
    jugIlks$(ilk),
    dogIlks$(ilk),
    ilkToToken$(ilk),
  ).pipe(
    switchMap(
      ([
        { normalizedIlkDebt, debtScalingFactor, maxDebtPerUnitCollateral, debtCeiling, debtFloor },
        { priceFeedAddress, liquidationRatio },
        { stabilityFee, feeLastLevied },
        { liquidatorAddress, liquidationPenalty },
        token,
      ]) => {
        const collateralizationDangerThreshold = liquidationRatio.times(
          COLLATERALIZATION_DANGER_OFFSET.plus(one),
        )
        const collateralizationWarningThreshold = liquidationRatio.times(
          COLLATERALIZATION_WARNING_OFFSET.plus(one),
        )

        return of({
          collateralizationDangerThreshold,
          collateralizationWarningThreshold,
          normalizedIlkDebt,
          debtScalingFactor,
          maxDebtPerUnitCollateral,
          debtCeiling,
          debtFloor,
          priceFeedAddress,
          liquidationRatio,
          stabilityFee,
          feeLastLevied,
          liquidatorAddress,
          liquidationPenalty,
          token,
          ilk,
          ilkDebt: normalizedIlkDebt
            .times(debtScalingFactor)
            .decimalPlaces(18, BigNumber.ROUND_DOWN),
          ilkDebtAvailable: BigNumber.max(
            debtCeiling
              .minus(debtScalingFactor.times(normalizedIlkDebt))
              .decimalPlaces(18, BigNumber.ROUND_DOWN),
            zero,
          ),
        })
      },
    ),
  )
}

export function createIlkDataList$(
  ilkData$: (ilk: string) => Observable<IlkData>,
  ilks$: Observable<string[]>,
): Observable<IlkDataList> {
  return ilks$.pipe(
    switchMap((ilks) => combineLatest(ilks.map((ilk) => ilkData$(ilk)))),
    distinctUntilChanged(),
    retry(3),
    shareReplay(1),
  )
}

export function createIlkDataChange$(
  ilkData$: (ilk: string) => Observable<IlkData>,
  ilk: string,
): Observable<IlkDataChange> {
  return ilkData$(ilk).pipe(map((ilkData) => ({ kind: 'ilkData', ilkData })))
}
