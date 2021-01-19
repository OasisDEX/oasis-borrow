import bigInt from 'big-integer'
import { CatIlk, catIlks } from 'components/blockchain/calls/cat'
import { JugIlk, jugIlks } from 'components/blockchain/calls/jug'
import { CallObservable } from 'components/blockchain/calls/observe'
import { SpotIlk, spotIlks } from 'components/blockchain/calls/spot'
import { VatIlk, vatIlks } from 'components/blockchain/calls/vat'
import { $create } from 'components/currency/currency'
import { combineLatest, Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

const a = bigInt('1')
const ETH = $create('ETH')(18)

export const IlkList = []

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
