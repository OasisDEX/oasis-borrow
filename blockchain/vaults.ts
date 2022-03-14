import { VaultType } from '@prisma/client'
import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import { HOUR, SECONDS_PER_YEAR } from 'components/constants'
import { checkMultipleVaultsFromApi$ } from 'features/shared/vaultApi'
import { one, zero } from 'helpers/zero'
import { isEqual } from 'lodash'
import { combineLatest, Observable, of } from 'rxjs'
import { distinctUntilChanged, map, mergeMap, shareReplay, switchMap } from 'rxjs/operators'

import { cdpManagerOwner } from './calls/cdpManager'
import { GetCdpsArgs, GetCdpsResult } from './calls/getCdps'
import { CallObservable } from './calls/observe'
import { vatGem, vatUrns } from './calls/vat'
import { MakerVaultType, VaultResolve } from './calls/vaultResolver'
import { IlkData } from './ilks'
import { OraclePriceData } from './prices'

BigNumber.config({
  POW_PRECISION: 100,
})

export interface VaultWithType extends Vault {
  type: VaultType
}

export function fetchVaultsType(vaults: Vault[]): Observable<VaultWithType[]> {
  return checkMultipleVaultsFromApi$(vaults.map((vault) => vault.id.toFixed(0))).pipe(
    map((res) =>
      vaults.map((vault) => ({
        ...vault,
        type: res[vault.id.toFixed(0)] || 'borrow',
      })),
    ),
  )
}

export function createStandardCdps$(
  proxyAddress$: (address: string) => Observable<string | undefined>,
  getCdps$: (arg: GetCdpsArgs) => Observable<GetCdpsResult>,
  address: string,
): Observable<BigNumber[]> {
  return proxyAddress$(address).pipe(
    switchMap((proxyAddress) => {
      if (proxyAddress === undefined) {
        return of([])
      }
      return getCdps$({ proxyAddress, descending: true }).pipe(
        map(({ ids }) => ids.map((id) => new BigNumber(id))),
      )
    }),
    distinctUntilChanged(isEqual),
    shareReplay(1),
  )
}

interface CdpIdsResolver {
  (address: string): Observable<BigNumber[]>
}
export function createVaults$(
  onEveryBlock$: Observable<number>,
  vault$: (id: BigNumber, chainId: number) => Observable<Vault>,
  context$: Observable<Context>,
  cdpIdResolvers: CdpIdsResolver[],
  address: string,
): Observable<VaultWithType[]> {
  return combineLatest(onEveryBlock$, context$).pipe(
    switchMap(([_, context]) =>
      combineLatest(cdpIdResolvers.map((resolver) => resolver(address))).pipe(
        map((nestedIds) => nestedIds.flat()),
        switchMap((ids) =>
          ids.length === 0 ? of([]) : combineLatest(ids.map((id) => vault$(id, context.chainId))),
        ),
        distinctUntilChanged<Vault[]>(isEqual),
        switchMap((vaults) => fetchVaultsType(vaults)),
        shareReplay(1),
      ),
    ),
  )
}

export interface Vault {
  makerType: MakerVaultType
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
  chainId: number
}

export function createController$(
  proxyOwner$: (proxyAddress: string) => Observable<string | undefined>,
  cdpManagerOwner$: CallObservable<typeof cdpManagerOwner>,
  id: BigNumber,
) {
  return cdpManagerOwner$(id).pipe(mergeMap((owner) => proxyOwner$(owner)))
}

export function createVault$(
  vaultResolver$: (cdpId: BigNumber) => Observable<VaultResolve>,
  vatUrns$: CallObservable<typeof vatUrns>,
  vatGem$: CallObservable<typeof vatGem>,
  ilkData$: (ilk: string) => Observable<IlkData>,
  oraclePriceData$: (token: string) => Observable<OraclePriceData>,
  ilkToToken$: (ilk: string) => Observable<string>,
  context$: Observable<Context>,
  id: BigNumber,
): Observable<Vault> {
  return vaultResolver$(id).pipe(
    switchMap(({ urnAddress, ilk, owner, type: makerType, controller }) =>
      combineLatest(ilkToToken$(ilk), context$).pipe(
        switchMap(([token, context]) => {
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
                const collateralUSDAtNextPrice = nextPrice
                  ? collateral.times(nextPrice)
                  : currentPrice

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
                const backingCollateralUSDAtNextPrice = backingCollateralAtNextPrice.times(
                  nextPrice,
                )

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
                  makerType,
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
                  chainId: context.chainId,
                })
              },
            ),
          )
        }),
        shareReplay(1),
      ),
    ),
  )
}

export interface VaultChange {
  kind: 'vault'
  vault: Vault
}

export function createVaultChange$(
  vault$: (id: BigNumber, chainId: number) => Observable<Vault>,
  id: BigNumber,
  chainId: number,
): Observable<VaultChange> {
  return vault$(id, chainId).pipe(map((vault) => ({ kind: 'vault', vault })))
}
