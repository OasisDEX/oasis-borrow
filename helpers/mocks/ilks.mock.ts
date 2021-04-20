import { BigNumber } from 'bignumber.js'
import { CatIlk } from 'blockchain/calls/cat'
import { JugIlk } from 'blockchain/calls/jug'
import { SpotIlk } from 'blockchain/calls/spot'
import { VatIlk } from 'blockchain/calls/vat'
import { createIlkData$, IlkData } from 'blockchain/ilks'
import { ilkToToken$ } from 'components/AppContext'
import { PriceInfo } from 'features/shared/priceInfo'
import { one } from 'helpers/zero'
import { Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

export const DEFAULT_DEBT_SCALING_FACTOR = one

export interface MockIlkDataProps {
  _priceInfo$?: Observable<PriceInfo>
  _vatIlk$?: Observable<VatIlk>
  _spotIlk$?: Observable<SpotIlk>
  _jugIlk$?: Observable<JugIlk>
  _catIlk$?: Observable<CatIlk>
  debtFloor?: BigNumber
  debtCeiling?: BigNumber
  ilkDebt?: BigNumber
  liquidationRatio?: BigNumber
  stabilityFee?: BigNumber
  currentCollateralPrice?: BigNumber
  ilk?: string
}

const defaultDebtFloor = new BigNumber('2000')
const defaultIlkDebt = new BigNumber('8000000')
const defaultLiquidationRatio = new BigNumber('1.5')
const defaultStabilityFee = new BigNumber('0.045')
const defaultCollateralPrice = new BigNumber('1000')
const defaultIlk = 'WBTC-A'

export function mockIlkData$({
  _priceInfo$,
  _vatIlk$,
  _spotIlk$,
  _jugIlk$,
  _catIlk$,
  debtFloor = defaultDebtFloor,
  debtCeiling,
  ilkDebt = defaultIlkDebt,
  liquidationRatio = defaultLiquidationRatio,
  stabilityFee = defaultStabilityFee,
  currentCollateralPrice = defaultCollateralPrice,
  ilk = defaultIlk,
}: MockIlkDataProps): Observable<IlkData> {
  const normalizedIlkDebt = ilkDebt.div(DEFAULT_DEBT_SCALING_FACTOR)

  const maxDebtPerUnitCollateral$ = _priceInfo$
    ? _priceInfo$.pipe(
        switchMap(({ currentCollateralPrice }) => of(currentCollateralPrice.div(liquidationRatio))),
      )
    : of(currentCollateralPrice.div(liquidationRatio))

  function vatIlks$() {
    return (
      _vatIlk$ ||
      maxDebtPerUnitCollateral$.pipe(
        switchMap((maxDebtPerUnitCollateral) =>
          of({
            normalizedIlkDebt,
            debtScalingFactor: DEFAULT_DEBT_SCALING_FACTOR,
            maxDebtPerUnitCollateral,
            debtCeiling:
              debtCeiling || normalizedIlkDebt.times(DEFAULT_DEBT_SCALING_FACTOR).times(2.5),
            debtFloor,
          }),
        ),
      )
    )
  }

  function spotIlks$() {
    return _spotIlk$ || of({ priceFeedAddress: '0xPriceFeedAddress', liquidationRatio })
  }

  function jugIlks$() {
    return _jugIlk$ || of({ feeLastLevied: new Date(), stabilityFee })
  }

  function catIlks$() {
    return (
      _catIlk$ ||
      of({
        liquidatorAddress: '0xLiquidatorAddress',
        liquidationPenalty: new BigNumber('0.13'),
        maxAuctionLotSize: new BigNumber('50000'),
      })
    )
  }

  return createIlkData$(vatIlks$, spotIlks$, jugIlks$, catIlks$, ilkToToken$, ilk).pipe(
    switchMap((ilkData) =>
      of({
        ...ilkData,
        ...(debtCeiling ? { ilkDebtAvailable: debtCeiling.minus(ilkData.ilkDebt) } : {}),
      }),
    ),
  )
}
