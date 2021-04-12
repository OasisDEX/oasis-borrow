import BigNumber from 'bignumber.js'
import { call } from 'blockchain/calls/callsHelpers'
import { Context } from 'blockchain/network'
import { ilkToToken$ } from 'components/AppContext'
import { lastHour, nextHour } from 'helpers/time'
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
  backingCollateral: BigNumber
  backingCollateralUSD: BigNumber
  freeCollateral: BigNumber
  freeCollateralUSD: BigNumber
  debt: BigNumber
  approximateDebt: BigNumber
  normalizedDebt: BigNumber
  availableDebt: BigNumber
  availableIlkDebt: BigNumber
  liquidationRatio: BigNumber
  collateralizationRatio: BigNumber
  nextCollateralizationRatio: BigNumber
  liquidationPrice: BigNumber
  liquidationPenalty: BigNumber
  stabilityFee: BigNumber
  debtFloor: BigNumber
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
              normalizedIlkDebt,
              debtFloor,
              debtScalingFactor,
              debtCeiling,
              liquidationRatio,
              stabilityFee,
              liquidationPenalty,
            },
          ]) => {
            const collateralUSD = collateral.times(currentPrice)
            const nextCollateralUSD = nextPrice ? collateral.times(nextPrice) : currentPrice
            const debt = debtScalingFactor.times(normalizedDebt)
            const approximateDebt = debt.decimalPlaces(6, BigNumber.ROUND_HALF_UP)

            const ilkDebt = debtScalingFactor.times(normalizedIlkDebt)

            const backingCollateral = debt.times(liquidationRatio).div(currentPrice)
            const freeCollateral = backingCollateral.gte(collateral)
              ? zero
              : collateral.minus(backingCollateral)
            const backingCollateralUSD = backingCollateral.times(currentPrice)
            const freeCollateralUSD = freeCollateral.times(currentPrice)
            const collateralizationRatio = debt.isZero() ? zero : collateralUSD.div(debt)
            const nextCollateralizationRatio = debt.isZero() ? zero : nextCollateralUSD.div(debt)

            const maxAvailableDebt = collateralUSD.div(liquidationRatio)

            const availableDebt = debt.lt(maxAvailableDebt) ? maxAvailableDebt.minus(debt) : zero
            const availableIlkDebt = debtCeiling.minus(ilkDebt)

            const liquidationPrice = collateral.eq(zero)
              ? zero
              : debt.times(liquidationRatio).div(collateral)

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
              unlockedCollateral,
              normalizedDebt,
              collateralizationRatio,
              nextCollateralizationRatio,
              debt,
              approximateDebt,
              availableDebt,
              availableIlkDebt,
              debtFloor,
              stabilityFee,
              liquidationPrice,
              liquidationRatio,
              liquidationPenalty,
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

export function buildVault$({
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

  const cdpManagerUrns$ = () => of('urnAddress')
  const cdpManagerIlks$ = () => of(ilk)
  const cdpManagerOwner$ = () => of('0xProxyAddress')
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
