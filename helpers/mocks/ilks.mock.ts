import { BigNumber } from 'bignumber.js'
import { CatIlk } from 'blockchain/calls/cat'
import { JugIlk } from 'blockchain/calls/jug'
import { SpotIlk } from 'blockchain/calls/spot'
import { VatIlk } from 'blockchain/calls/vat'
import { createIlkData$, IlkData } from 'blockchain/ilks'
import { ilkToToken$ } from 'components/AppContext'
import { SECONDS_PER_YEAR } from 'components/constants'
import { Decimal } from 'decimal.js'
import { PriceInfo } from 'features/shared/priceInfo'
import { getStateUnpacker } from 'helpers/testHelpers'
import { one } from 'helpers/zero'
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

Decimal.set({ precision: 100 })

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
  currentCollateralPrice?: BigNumber
  ilk?: string
}

// stabilityFee :: 8% = 1.08
// bc -l <<< 'scale=27; e( l(1.08)/(60 * 60 * 24 * 365) )'
export function calcDebtScalingFactor(stabilityFee: BigNumber, seconds: number) {
  const duty = new BigNumber(
    Decimal.exp(Decimal.ln(new Decimal(stabilityFee.toString())).div(SECONDS_PER_YEAR))
      .toDecimalPlaces(27, Decimal.ROUND_DOWN)
      .toString(),
  )

  const r_zero = DEFAULT_DEBT_SCALING_FACTOR
  return r_zero.times(duty.pow(seconds)).dp(27, BigNumber.ROUND_DOWN)
}

const defaultDebtFloor = new BigNumber('2000')
export const defaultIlkDebt = new BigNumber('8000000')
export const defaultLiquidationRatio = new BigNumber('1.5')
const defaultCollateralPrice = new BigNumber('1000')
const defaultIlk = 'WBTC-A'

const DEFAULT_STABILITY_FEE = new BigNumber('0.045')
export const DEFAULT_DEBT_SCALING_FACTOR = one

export const RANDOM_DEBT_SCALING_FACTOR = calcDebtScalingFactor(DEFAULT_STABILITY_FEE.plus(one), 15)
export const debtScalingFactor$ = new BehaviorSubject<BigNumber>(DEFAULT_DEBT_SCALING_FACTOR)

export function mockIlkData$({
  _priceInfo$,
  _vatIlk$,
  _spotIlk$,
  _jugIlk$,
  _catIlk$,
  debtFloor,
  debtCeiling,
  ilkDebt,
  liquidationRatio,
  currentCollateralPrice,
  ilk,
}: MockIlkDataProps = {}): Observable<IlkData> {
  const normalizedIlkDebt = (ilkDebt || defaultIlkDebt).div(DEFAULT_DEBT_SCALING_FACTOR)

  const maxDebtPerUnitCollateral$ = _priceInfo$
    ? _priceInfo$.pipe(
        switchMap(({ currentCollateralPrice }) =>
          of(currentCollateralPrice.div(liquidationRatio || defaultLiquidationRatio)),
        ),
      )
    : of(
        (currentCollateralPrice || defaultCollateralPrice).div(
          liquidationRatio || defaultLiquidationRatio,
        ),
      )

  function vatIlks$() {
    return (
      _vatIlk$ ||
      combineLatest(maxDebtPerUnitCollateral$, debtScalingFactor$).pipe(
        switchMap(([maxDebtPerUnitCollateral, debtScalingFactor]) =>
          of({
            normalizedIlkDebt,
            debtScalingFactor: debtScalingFactor,
            maxDebtPerUnitCollateral,
            debtCeiling:
              debtCeiling || normalizedIlkDebt.times(DEFAULT_DEBT_SCALING_FACTOR).times(2.5),
            debtFloor: debtFloor || defaultDebtFloor,
          }),
        ),
      )
    )
  }

  function spotIlks$() {
    return (
      _spotIlk$ ||
      of({
        priceFeedAddress: '0xPriceFeedAddress',
        liquidationRatio: liquidationRatio || defaultLiquidationRatio,
      })
    )
  }

  function jugIlks$() {
    return _jugIlk$ || of({ feeLastLevied: new Date(), stabilityFee: DEFAULT_STABILITY_FEE })
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

  return createIlkData$(vatIlks$, spotIlks$, jugIlks$, catIlks$, ilkToToken$, ilk || defaultIlk)
}

export function mockIlkData(props: MockIlkDataProps = {}) {
  return getStateUnpacker(mockIlkData$(props))
}
