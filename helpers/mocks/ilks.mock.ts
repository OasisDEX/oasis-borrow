import { BigNumber } from 'bignumber.js'
import { DogIlk } from 'blockchain/calls/dog'
import { JugIlk } from 'blockchain/calls/jug'
import { SpotIlk } from 'blockchain/calls/spot'
import { VatIlk } from 'blockchain/calls/vat'
import { createIlkData$, IlkData, IlkDataList } from 'blockchain/ilks'
import { SECONDS_PER_YEAR } from 'components/constants'
import { Decimal } from 'decimal.js'
import { PriceInfo } from 'features/shared/priceInfo'
import { getStateUnpacker } from 'helpers/testHelpers'
import { one, zero } from 'helpers/zero'
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

Decimal.set({ precision: 100 })

export interface MockIlkDataProps {
  _priceInfo$?: Observable<PriceInfo>
  _vatIlk$?: Observable<VatIlk>
  _spotIlk$?: Observable<SpotIlk>
  _jugIlk$?: Observable<JugIlk>
  _dogIlk$?: Observable<DogIlk>
  stabilityFee?: BigNumber
  debtFloor?: BigNumber
  debtCeiling?: BigNumber
  ilkDebt?: BigNumber
  liquidationRatio?: BigNumber
  currentCollateralPrice?: BigNumber
  ilkDebtAvailable?: BigNumber
  ilk?: string
  token?: string
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

const defaultStabilityFee = new BigNumber('0.045')
export const DEFAULT_DEBT_SCALING_FACTOR = one

export const RANDOM_DEBT_SCALING_FACTOR = calcDebtScalingFactor(defaultStabilityFee.plus(one), 15)
export const debtScalingFactor$ = new BehaviorSubject<BigNumber>(DEFAULT_DEBT_SCALING_FACTOR)

export function mockIlkData$({
  _priceInfo$,
  _vatIlk$,
  _spotIlk$,
  _jugIlk$,
  _dogIlk$,
  stabilityFee,
  debtFloor,
  debtCeiling,
  ilkDebt,
  liquidationRatio,
  currentCollateralPrice,
  ilk,
}: MockIlkDataProps = {}): Observable<IlkData> {
  const normalizedIlkDebt = (ilkDebt || defaultIlkDebt).div(
    stabilityFee ? calcDebtScalingFactor(stabilityFee, 1) : DEFAULT_DEBT_SCALING_FACTOR,
  )

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

  const _debtScalingFactor$ = stabilityFee
    ? of(calcDebtScalingFactor(stabilityFee, 1))
    : debtScalingFactor$
  function vatIlks$() {
    return (
      _vatIlk$ ||
      combineLatest(maxDebtPerUnitCollateral$, _debtScalingFactor$).pipe(
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
    return (
      _jugIlk$ ||
      of({ feeLastLevied: new Date(), stabilityFee: stabilityFee || defaultStabilityFee })
    )
  }

  function dogIlks$() {
    return (
      _dogIlk$ ||
      of({
        liquidatorAddress: '0xLiquidatorAddress',
        liquidationPenalty: new BigNumber('0.13'),
      })
    )
  }

  return createIlkData$(vatIlks$, spotIlks$, jugIlks$, dogIlks$, mockIlkToToken$, ilk || defaultIlk)
}

export function mockIlkData(props: MockIlkDataProps = {}) {
  return getStateUnpacker(mockIlkData$(props))
}

export function mockIlkDataList() {
  const cheapest = mockIlkData({
    ilk: 'WBTC-A',
    stabilityFee: new BigNumber('0.045'),
  })
  const zeroDebt = mockIlkData({
    ilk: 'USDC-A',
    ilkDebt: new BigNumber('10000'),
    debtCeiling: new BigNumber('10001'),
    stabilityFee: zero,
  })
  const popular = mockIlkData({
    ilk: 'ETH-A',
    ilkDebt: new BigNumber('10000000'),
  })
  const newest = mockIlkData({
    ilk: 'LINK-A',
    stabilityFee: new BigNumber('0.08'),
  })

  return [cheapest, zeroDebt, popular, newest].map((mockIlkData) => mockIlkData()) as IlkDataList
}

export function mockIlkToToken$(ilk: string) {
  return of(ilk.split('-')[0])
}
