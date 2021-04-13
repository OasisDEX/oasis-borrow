import BigNumber from 'bignumber.js'
import { call } from 'blockchain/calls/callsHelpers'
import { Context } from 'blockchain/network'
import { ilkToToken$ } from 'components/AppContext'
import { one, zero } from 'helpers/zero'
import { combineLatest, Observable, of } from 'rxjs'
import { map, mergeMap, shareReplay, switchMap } from 'rxjs/operators'

import { cdpManagerIlks, cdpManagerOwner, cdpManagerUrns } from './calls/cdpManager'
import { getCdps } from './calls/getCdps'
import { CallObservable } from './calls/observe'
import { vatGem, vatUrns } from './calls/vat'
import { buildIlkData$, IlkData } from './ilks'
import { OraclePriceData } from './prices'

export function createVaults$(
  context$: Observable<Context>,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  vault$: (id: BigNumber) => Observable<Vault>,
  address: string,
): Observable<Vault[]> {
  return combineLatest(context$, proxyAddress$(address)).pipe(
    switchMap(([context, proxyAddress]) => {
      if (!proxyAddress) return of([])
      return call(
        context,
        getCdps,
      )({ proxyAddress, descending: true }).pipe(
        switchMap(({ ids }) =>
          ids.length === 0 ? of([]) : combineLatest(ids.map((id) => vault$(new BigNumber(id)))),
        ),
      )
    }),
    shareReplay(1),
  )
}

export interface Vault {
  id: BigNumber
  owner: string // cdpManager.owns -> proxy
  controller: string // proxy -> EOA
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
  approximateDebt: BigNumber
  normalizedDebt: BigNumber
  availableDebt: BigNumber
  availableDebtAtNextPrice: BigNumber
  collateralizationRatio: BigNumber
  collateralizationRatioAtNextPrice: BigNumber
  liquidationPrice: BigNumber
  collateralizationDangerThreshold: BigNumber
  collateralizationWarningThreshold: BigNumber
}

export function createController$(
  proxyOwner$: (proxyAddress: string) => Observable<string | undefined>,
  cdpManagerOwner$: CallObservable<typeof cdpManagerOwner>,
  id: BigNumber,
) {
  return cdpManagerOwner$(id).pipe(mergeMap((owner) => proxyOwner$(owner)))
}

export const COLLATERALIZATION_DANGER_OFFSET = new BigNumber('0.2') // 150% * 1.2 = 180%
export const COLLATERALIZATION_WARNING_OFFSET = new BigNumber('0.5') // 150% * 1.5 = 225%

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
            { debtScalingFactor, liquidationRatio },
          ]) => {
            const collateralUSD = collateral.times(currentPrice)
            const collateralUSDAtNextPrice = nextPrice ? collateral.times(nextPrice) : currentPrice

            const debt = debtScalingFactor.times(normalizedDebt)
            const approximateDebt = debt.decimalPlaces(6, BigNumber.ROUND_HALF_UP)

            const backingCollateral = debt.times(liquidationRatio).div(currentPrice)
            const backingCollateralAtNextPrice = debt
              .times(liquidationRatio)
              .div(nextPrice || currentPrice)
            const backingCollateralUSD = backingCollateral.times(currentPrice)
            const backingCollateralUSDAtNextPrice = backingCollateralAtNextPrice.times(
              nextPrice || currentPrice,
            )

            const freeCollateral = backingCollateral.gte(collateral)
              ? zero
              : collateral.minus(backingCollateral)
            const freeCollateralAtNextPrice = backingCollateralAtNextPrice.gte(collateral)
              ? zero
              : collateral.minus(backingCollateralAtNextPrice)

            const freeCollateralUSD = freeCollateral.times(currentPrice)
            const freeCollateralUSDAtNextPrice = freeCollateralAtNextPrice.times(
              nextPrice || currentPrice,
            )

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

            // Maybe should be in ilkData as they are ilk dependent not vault dependent
            const collateralizationDangerThreshold = liquidationRatio.times(
              COLLATERALIZATION_DANGER_OFFSET.plus(one),
            )
            const collateralizationWarningThreshold = liquidationRatio.times(
              COLLATERALIZATION_WARNING_OFFSET.plus(one),
            )

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
              approximateDebt,
              availableDebt,
              availableDebtAtNextPrice,

              unlockedCollateral,
              collateralizationRatio,
              collateralizationRatioAtNextPrice,
              liquidationPrice,

              collateralizationDangerThreshold,
              collateralizationWarningThreshold,
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

export interface BuildVaultProps {
  _cdpManagerUrns$?: Observable<string>
  _oraclePriceData$?: Observable<OraclePriceData>
  _ilkData$?: Observable<IlkData>
  controller?: string
  ilk: string
  collateral: BigNumber
  debt: BigNumber
  unlockedCollateral?: BigNumber
  currentPrice?: BigNumber
  nextPrice?: BigNumber
  id?: BigNumber
}

export const DEFAULT_PROXY_ADDRESS = '0xProxyAddress'
export function buildVault$({
  _cdpManagerUrns$,
  _oraclePriceData$,
  _ilkData$,
  currentPrice = zero,
  nextPrice = zero,
  unlockedCollateral = zero,
  id = one,
  controller = '0xVaultController',
  debt,
  collateral,
  ilk,
}: BuildVaultProps): Observable<Vault> {
  const oraclePriceData$ = () =>
    _oraclePriceData$ ||
    of({
      currentPrice,
      isStaticPrice: false,
      nextPrice,
    })

  const ilkData$ = () =>
    _ilkData$ ||
    oraclePriceData$().pipe(
      switchMap(({ currentPrice }) => buildIlkData$({ ilk, currentCollateralPrice: currentPrice })),
    )

  const cdpManagerUrns$ = () => _cdpManagerUrns$ || of('0xUrnAddress')
  const cdpManagerIlks$ = () => of(ilk)
  const cdpManagerOwner$ = () => of(DEFAULT_PROXY_ADDRESS)
  const controller$ = () => of(controller)
  const vatGem$ = () => of(unlockedCollateral)
  const vatUrns$ = () =>
    ilkData$().pipe(
      switchMap(({ debtScalingFactor }) =>
        of({
          normalizedDebt: debt.div(debtScalingFactor).dp(18, BigNumber.ROUND_DOWN),
          collateral,
        }),
      ),
    )

  return createVault$(
    cdpManagerUrns$,
    cdpManagerIlks$,
    cdpManagerOwner$,
    vatUrns$,
    vatGem$,
    ilkData$,
    oraclePriceData$,
    controller$,
    ilkToToken$,
    id,
  )
}
