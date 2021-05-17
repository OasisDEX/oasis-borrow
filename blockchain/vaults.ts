import BigNumber from 'bignumber.js'
import { call } from 'blockchain/calls/callsHelpers'
import { Context } from 'blockchain/network'
import { HOUR, SECONDS_PER_YEAR } from 'components/constants'
import { one, zero } from 'helpers/zero'
import { isEqual } from 'lodash'
import { combineLatest, Observable, of } from 'rxjs'
import { distinctUntilChanged, map, mergeMap, shareReplay, switchMap, tap } from 'rxjs/operators'

import { cdpManagerIlks, cdpManagerOwner, cdpManagerUrns } from './calls/cdpManager'
import { getCdps } from './calls/getCdps'
import { CallObservable } from './calls/observe'
import { vatGem, vatUrns } from './calls/vat'
import { IlkData } from './ilks'
import { OraclePriceData } from './prices'

BigNumber.config({
  POW_PRECISION: 100,
})

export function createVaults$(
  onEveryBlock$: Observable<number>,
  context$: Observable<Context>,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  vault$: (id: BigNumber) => Observable<Vault>,
  address: string,
): Observable<Vault[]> {
  return combineLatest(context$, proxyAddress$(address)).pipe(
    switchMap(([context, proxyAddress]) => {
      if (!proxyAddress) return of([])

      function fetchVaultIds(): Observable<string[]> {
        return onEveryBlock$.pipe(
          switchMap(() =>
            call(
              context,
              getCdps,
            )({ proxyAddress: proxyAddress!, descending: true }).pipe(
              switchMap(({ ids }) => of(ids)),
            ),
          ),
          distinctUntilChanged(isEqual),
        )
      }

      return fetchVaultIds().pipe(
        switchMap((ids) =>
          ids.length === 0 ? of([]) : combineLatest(ids.map((id) => vault$(new BigNumber(id)))),
        ),
      )
    }),
    shareReplay(1),
  )
}

export interface Vault {
  id: BigNumber
  owner: string
  controller?: string
  token: string
  ilk: string
  address: string
  lockedCollateral: BigNumber
  unlockedCollateral: BigNumber
  lockedCollateralUSD: BigNumber
  lockedCollateralUSDAtNextPrice: BigNumber
  backingCollateral: BigNumber
  backingCollateralAtNextPrice: BigNumber
  backingCollateralUSD: BigNumber
  backingCollateralUSDAtNextPrice: BigNumber
  freeCollateral: BigNumber
  freeCollateralAtNextPrice: BigNumber
  freeCollateralUSD: BigNumber
  freeCollateralUSDAtNextPrice: BigNumber
  debt: BigNumber
  debtOffset: BigNumber
  normalizedDebt: BigNumber
  availableDebt: BigNumber
  availableDebtAtNextPrice: BigNumber
  collateralizationRatio: BigNumber
  collateralizationRatioAtNextPrice: BigNumber
  liquidationPrice: BigNumber
  daiYieldFromLockedCollateral: BigNumber

  atRiskLevelWarning: boolean
  atRiskLevelDanger: boolean
  underCollateralized: boolean

  atRiskLevelWarningAtNextPrice: boolean
  atRiskLevelDangerAtNextPrice: boolean
  underCollateralizedAtNextPrice: boolean
}

export function createController$(
  proxyOwner$: (proxyAddress: string) => Observable<string | undefined>,
  cdpManagerOwner$: CallObservable<typeof cdpManagerOwner>,
  id: BigNumber,
) {
  return cdpManagerOwner$(id).pipe(mergeMap((owner) => proxyOwner$(owner)))
}

export function createVault$(
  cdpManagerUrns$: CallObservable<typeof cdpManagerUrns>,
  cdpManagerIlks$: CallObservable<typeof cdpManagerIlks>,
  cdpManagerOwner$: CallObservable<typeof cdpManagerOwner>,
  vatUrns$: CallObservable<typeof vatUrns>,
  vatGem$: CallObservable<typeof vatGem>,
  ilkData$: (ilk: string) => Observable<IlkData>,
  oraclePriceData$: (token: string) => Observable<OraclePriceData>,
  controller$: (id: BigNumber) => Observable<string | undefined>,
  ilkToToken$: Observable<(ilk: string) => string>,
  id: BigNumber,
): Observable<Vault> {
  return combineLatest(
    cdpManagerUrns$(id),
    cdpManagerIlks$(id),
    cdpManagerOwner$(id),
    controller$(id),
    ilkToToken$,
  ).pipe(
    switchMap(([urnAddress, ilk, owner, controller, ilkToToken]) => {
      const token = ilkToToken(ilk)
      return combineLatest(
        vatUrns$({ ilk, urnAddress }),
        vatGem$({ ilk, urnAddress }),
        oraclePriceData$(token),
        ilkData$(ilk),
      ).pipe(
        switchMap(
          ([
            { collateral, normalizedDebt },
            unlockedCollateral,
            { currentPrice, nextPrice },
            {
              debtScalingFactor,
              liquidationRatio,
              collateralizationDangerThreshold,
              collateralizationWarningThreshold,
              stabilityFee,
              ilkDebtAvailable,
            },
          ]) => {
            const collateralUSD = collateral.times(currentPrice)
            const collateralUSDAtNextPrice = nextPrice ? collateral.times(nextPrice) : currentPrice

            const debt = debtScalingFactor.times(normalizedDebt)

            const debtOffset = !debt.isZero()
              ? debt
                  .times(one.plus(stabilityFee.div(SECONDS_PER_YEAR)).pow(HOUR * 5))
                  .minus(debt)
                  .dp(18, BigNumber.ROUND_DOWN)
              : new BigNumber('1e-18')

            const backingCollateral = debt.times(liquidationRatio).div(currentPrice)

            const backingCollateralAtNextPrice = debt.times(liquidationRatio).div(nextPrice)
            const backingCollateralUSD = backingCollateral.times(currentPrice)
            const backingCollateralUSDAtNextPrice = backingCollateralAtNextPrice.times(nextPrice)

            const freeCollateral = backingCollateral.gte(collateral)
              ? zero
              : collateral.minus(backingCollateral)
            const freeCollateralAtNextPrice = backingCollateralAtNextPrice.gte(collateral)
              ? zero
              : collateral.minus(backingCollateralAtNextPrice)

            const freeCollateralUSD = freeCollateral.times(currentPrice)
            const freeCollateralUSDAtNextPrice = freeCollateralAtNextPrice.times(nextPrice)

            const collateralizationRatio = debt.isZero() ? zero : collateralUSD.div(debt)
            const collateralizationRatioAtNextPrice = debt.isZero()
              ? zero
              : collateralUSDAtNextPrice.div(debt)

            const maxAvailableDebt = collateralUSD.div(liquidationRatio)
            const maxAvailableDebtAtNextPrice = collateralUSDAtNextPrice.div(liquidationRatio)

            const availableDebt = debt.lt(collateralUSD.div(liquidationRatio))
              ? maxAvailableDebt.minus(debt)
              : zero

            const availableDebtAtNextPrice = debt.lt(maxAvailableDebtAtNextPrice)
              ? maxAvailableDebtAtNextPrice.minus(debt)
              : zero

            const liquidationPrice = collateral.eq(zero)
              ? zero
              : debt.times(liquidationRatio).div(collateral)

            const daiYieldFromLockedCollateral = availableDebt.lt(ilkDebtAvailable)
              ? availableDebt
              : ilkDebtAvailable.gt(zero)
              ? ilkDebtAvailable
              : zero
            const atRiskLevelWarning =
              collateralizationRatio.gte(collateralizationDangerThreshold) &&
              collateralizationRatio.lt(collateralizationWarningThreshold)

            const atRiskLevelDanger =
              collateralizationRatio.gte(liquidationRatio) &&
              collateralizationRatio.lt(collateralizationDangerThreshold)

            const underCollateralized =
              !collateralizationRatio.isZero() && collateralizationRatio.lt(liquidationRatio)

            const atRiskLevelWarningAtNextPrice =
              collateralizationRatioAtNextPrice.gte(collateralizationDangerThreshold) &&
              collateralizationRatioAtNextPrice.lt(collateralizationWarningThreshold)

            const atRiskLevelDangerAtNextPrice =
              collateralizationRatioAtNextPrice.gte(liquidationRatio) &&
              collateralizationRatioAtNextPrice.lt(collateralizationDangerThreshold)

            const underCollateralizedAtNextPrice =
              !collateralizationRatioAtNextPrice.isZero() &&
              collateralizationRatioAtNextPrice.lt(liquidationRatio)

            return of({
              id,
              ilk,
              token,
              address: urnAddress,
              owner,
              controller,
              lockedCollateral: collateral,
              lockedCollateralUSD: collateralUSD,
              backingCollateral,
              backingCollateralUSD,
              freeCollateral,
              freeCollateralUSD,
              lockedCollateralUSDAtNextPrice: collateralUSDAtNextPrice,
              backingCollateralAtNextPrice,
              backingCollateralUSDAtNextPrice,
              freeCollateralAtNextPrice,
              freeCollateralUSDAtNextPrice,
              normalizedDebt,
              debt,
              debtOffset,
              availableDebt,
              availableDebtAtNextPrice,
              unlockedCollateral,
              collateralizationRatio,
              collateralizationRatioAtNextPrice,
              liquidationPrice,
              daiYieldFromLockedCollateral,

              atRiskLevelWarning,
              atRiskLevelDanger,
              underCollateralized,
              atRiskLevelWarningAtNextPrice,
              atRiskLevelDangerAtNextPrice,
              underCollateralizedAtNextPrice,
            })
          },
        ),
      )
    }),
    shareReplay(1),
  )
}

export interface VaultChange {
  kind: 'vault'
  vault: Vault
}

export function createVaultChange$(
  vault$: (id: BigNumber) => Observable<Vault>,
  id: BigNumber,
): Observable<VaultChange> {
  return vault$(id).pipe(map((vault) => ({ kind: 'vault', vault })))
}
