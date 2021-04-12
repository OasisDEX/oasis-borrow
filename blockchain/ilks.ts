import BigNumber from 'bignumber.js'
import { CatIlk, catIlk } from 'blockchain/calls/cat'
import { JugIlk, jugIlk } from 'blockchain/calls/jug'
import { CallObservable } from 'blockchain/calls/observe'
import { SpotIlk, spotIlk } from 'blockchain/calls/spot'
import { VatIlk, vatIlk } from 'blockchain/calls/vat'
import { Context } from 'blockchain/network'
import { ilkToToken$ } from 'components/AppContext'
import { PriceInfo } from 'features/shared/priceInfo'
import { now } from 'helpers/time'
import { one, zero } from 'helpers/zero'
import { of } from 'rxjs'
import { combineLatest, Observable } from 'rxjs'
import { distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators'

export function createIlks$(context$: Observable<Context>): Observable<string[]> {
  return context$.pipe(
    map((context) => Object.keys(context.joins).filter((join) => join !== 'DAI' && join !== 'SAI')),
  )
}

interface DerivedIlkData {
  token: string
  ilk: string
  ilkDebt: BigNumber
  ilkDebtAvailable: BigNumber
}
export type IlkData = VatIlk & SpotIlk & JugIlk & CatIlk & DerivedIlkData

export function createIlkData$(
  vatIlks$: CallObservable<typeof vatIlk>,
  spotIlks$: CallObservable<typeof spotIlk>,
  jugIlks$: CallObservable<typeof jugIlk>,
  catIlks$: CallObservable<typeof catIlk>,
  ilkToToken$: Observable<(ilk: string) => string>,
  ilk: string,
): Observable<IlkData> {
  return combineLatest(
    vatIlks$(ilk),
    spotIlks$(ilk),
    jugIlks$(ilk),
    catIlks$(ilk),
    ilkToToken$,
  ).pipe(
    switchMap(
      ([
        { normalizedIlkDebt, debtScalingFactor, maxDebtPerUnitCollateral, debtCeiling, debtFloor },
        { priceFeedAddress, liquidationRatio },
        { stabilityFee, feeLastLevied },
        { liquidatorAddress, liquidationPenalty, maxAuctionLotSize },
        ilkToToken,
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
          token: ilkToToken(ilk),
          ilk,
          ilkDebt: debtScalingFactor
            .times(normalizedIlkDebt)
            .decimalPlaces(18, BigNumber.ROUND_DOWN),
          ilkDebtAvailable: BigNumber.max(
            debtCeiling
              .minus(debtScalingFactor.times(normalizedIlkDebt))
              .decimalPlaces(18, BigNumber.ROUND_DOWN),
            zero,
          ),
        }),
    ),
  )
}

export type IlkDataList = IlkData[]

export function createIlkDataList$(
  ilkData$: (ilk: string) => Observable<IlkData>,
  ilks$: Observable<string[]>,
): Observable<IlkDataList> {
  return ilks$.pipe(
    switchMap((ilks) => combineLatest(ilks.map((ilk) => ilkData$(ilk)))),
    distinctUntilChanged(),
    shareReplay(1),
  )
}

export interface IlkDataChange {
  kind: 'ilkData'
  ilkData: IlkData
}

export function createIlkDataChange$(
  ilkData$: (ilk: string) => Observable<IlkData>,
  ilk: string,
): Observable<IlkDataChange> {
  return ilkData$(ilk).pipe(map((ilkData) => ({ kind: 'ilkData', ilkData })))
}

export const protoETHAIlkData: IlkData = {
  debtCeiling: new BigNumber('1482351717.8074963620138921299'),
  debtFloor: new BigNumber('2000'),
  debtScalingFactor: new BigNumber('1.03252304318189770482'),
  feeLastLevied: now,
  ilk: 'ETH-A',
  ilkDebt: new BigNumber('1417402362.052916865548128154'),
  ilkDebtAvailable: new BigNumber('64949355.754579496465763975'),
  liquidationPenalty: new BigNumber('0.13'),
  liquidationRatio: new BigNumber('1.5'),
  liquidatorAddress: '0xF32836B9E1f47a0515c6Ec431592D5EbC276407f',
  maxAuctionLotSize: new BigNumber('50000'),
  maxDebtPerUnitCollateral: new BigNumber('1187.13333333333333333333'),
  normalizedIlkDebt: new BigNumber('1372756154.366247564502420602'),
  priceFeedAddress: '0x81FE72B5A8d1A857d176C3E7d5Bd2679A9B85763',
  stabilityFee: new BigNumber(
    '0.054999999999991559213658976792039293404550595107713042286458478527410020941495574539245120619341733',
  ),
  token: 'ETH',
}

export const protoWBTCAIlkData: IlkData = {
  debtCeiling: new BigNumber('282897479.11236999035644766557'),
  debtFloor: new BigNumber('2000'),
  debtScalingFactor: new BigNumber('1.02360932507235653375'),
  feeLastLevied: now,
  ilk: 'WBTC-A',
  ilkDebt: new BigNumber('269203682.978267290292807367'),
  ilkDebtAvailable: new BigNumber('13693796.134102700063640297'),
  liquidationPenalty: new BigNumber('0.13'),
  liquidationRatio: new BigNumber('1.5'),
  liquidatorAddress: '0x58CD24ac7322890382eE45A3E4F903a5B22Ee930',
  maxAuctionLotSize: new BigNumber('50000'),
  maxDebtPerUnitCollateral: new BigNumber('37451.17333333333333333333'),
  normalizedIlkDebt: new BigNumber('262994558.943899730116777436'),
  priceFeedAddress: '0xf185d0682d50819263941e5f4EacC763CC5C6C42',
  stabilityFee: new BigNumber(
    '0.044999999999894654754833429952693264878294382475669356753434716561425711705437754164710051744608456',
  ),
  token: 'WBTC',
}

export const protoUSDCAIlkData: IlkData = {
  debtCeiling: new BigNumber('0'),
  debtFloor: new BigNumber('2000'),
  debtScalingFactor: new BigNumber('1.03102744355779205622'),
  feeLastLevied: now,
  ilk: 'USDC-A',
  ilkDebt: new BigNumber('331518098.058419701965172664'),
  ilkDebtAvailable: new BigNumber('0'),
  liquidationPenalty: new BigNumber('0.13'),
  liquidationRatio: new BigNumber('1.01'),
  liquidatorAddress: '0xbe359e53038E41a1ffA47DAE39645756C80e557a',
  maxAuctionLotSize: new BigNumber('50000'),
  maxDebtPerUnitCollateral: new BigNumber('0.99009900990099009901'),
  normalizedIlkDebt: new BigNumber('321541487.697400130582559103'),
  priceFeedAddress: '0x77b68899b99b686F415d074278a9a16b336085A0',
  stabilityFee: new BigNumber('0.05'),
  token: 'USDC',
}

export const DEFAULT_DEBT_SCALING_FACTOR = one

export interface BuildIlkDataProps {
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

export function buildIlkData$({
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
}: BuildIlkDataProps): Observable<IlkData> {
  const normalizedIlkDebt = ilkDebt.div(DEFAULT_DEBT_SCALING_FACTOR)

  const maxDebtPerUnitCollateral$ = _priceInfo$
    ? _priceInfo$.pipe(
        switchMap(({ currentCollateralPrice }) => of(currentCollateralPrice.div(liquidationRatio))),
      )
    : of(currentCollateralPrice.div(liquidationRatio))

  const vatIlks$ = () =>
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

  const spotIlks$ = () =>
    _spotIlk$ || of({ priceFeedAddress: '0xPriceFeedAddress', liquidationRatio })
  const jugIlks$ = () => _jugIlk$ || of({ feeLastLevied: new Date(), stabilityFee })
  const catIlks$ = () =>
    _catIlk$ ||
    of({
      liquidatorAddress: '0xLiquidatorAddress',
      liquidationPenalty: new BigNumber('0.13'),
      maxAuctionLotSize: new BigNumber('50000'),
    })
  return createIlkData$(vatIlks$, spotIlks$, jugIlks$, catIlks$, ilkToToken$, ilk)
}
