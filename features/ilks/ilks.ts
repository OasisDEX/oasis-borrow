import { CatIlk, catIlks } from 'components/blockchain/calls/cat'
import { JugIlk, jugIlks } from 'components/blockchain/calls/jug'
import { CallObservable } from 'components/blockchain/calls/observe'
import { SpotIlk, spotIlks } from 'components/blockchain/calls/spot'
import { VatIlk, vatIlks } from 'components/blockchain/calls/vat'
import { combineLatest, Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

export type Ilk = VatIlk & SpotIlk & JugIlk & CatIlk

export function createIlks$(
  vatIlks$: CallObservable<typeof vatIlks>,
  spotIlks$: CallObservable<typeof spotIlks>,
  jugIlks$: CallObservable<typeof jugIlks>,
  catIlks$: CallObservable<typeof catIlks>,
  ilk: string,
): Observable<Ilk> {
  return combineLatest(vatIlks$(ilk), spotIlks$(ilk), jugIlks$(ilk), catIlks$(ilk)).pipe(
    switchMap(
      ([
        { normalizedIlkDebt, debtScalingFactor, maxDebtPerUnitCollateral, debtCeiling, debtFloor },
        { priceFeedAddress, liquidationRatio },
        { stabilityFee, feeLastLevied },
        { liquidatorAddress, liquidationPenalty, maxAuctionLotSize },
      ]) =>
        of({
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
          maxAuctionLotSize,
        }),
    ),
  )
}
