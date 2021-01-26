import { CatIlk, catIlk } from 'components/blockchain/calls/cat'
import { JugIlk, jugIlk } from 'components/blockchain/calls/jug'
import { CallObservable } from 'components/blockchain/calls/observe'
import { SpotIlk, spotIlk } from 'components/blockchain/calls/spot'
import { VatIlk, vatIlk } from 'components/blockchain/calls/vat'
import { combineLatest, Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

export type Ilk = VatIlk & SpotIlk & JugIlk & CatIlk
export function createIlk$(
  vatIlks$: CallObservable<typeof vatIlk>,
  spotIlks$: CallObservable<typeof spotIlk>,
  jugIlks$: CallObservable<typeof jugIlk>,
  catIlks$: CallObservable<typeof catIlk>,
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
