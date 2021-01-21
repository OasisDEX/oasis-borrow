import { CatIlkData, catIlks } from 'components/blockchain/calls/cat'
import { JugIlkData, jugIlks } from 'components/blockchain/calls/jug'
import { CallObservable } from 'components/blockchain/calls/observe'
import { SpotIlkData, spotIlks } from 'components/blockchain/calls/spot'
import { VatIlkData, vatIlks } from 'components/blockchain/calls/vat'
import { Ilk } from 'components/blockchain/maker'
import { combineLatest, Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

export type IlkData<Ilk> = VatIlkData & SpotIlkData<Ilk> & JugIlkData<Ilk> & CatIlkData<Ilk>

export function createIlks$(
  vatIlks$: CallObservable<typeof vatIlks>,
  spotIlks$: CallObservable<typeof spotIlks>,
  jugIlks$: CallObservable<typeof jugIlks>,
  catIlks$: CallObservable<typeof catIlks>,
  ilk: Ilk,
): Observable<IlkData<Ilk>> {
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
