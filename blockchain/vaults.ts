import { VaultType } from '@prisma/client'
import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import { checkMultipleVaultsFromApi$ } from 'features/shared/vaultApi'
import { isEqual } from 'lodash'
import { combineLatest, Observable, of } from 'rxjs'
import { distinctUntilChanged, map, mergeMap, shareReplay, switchMap } from 'rxjs/operators'

import { ExchangeAction, ExchangeType, Quote } from '../features/exchange/exchange'
import { UserSettingsState } from '../features/userSettings/userSettings'
import { zero } from '../helpers/zero'
import { cdpManagerOwner } from './calls/cdpManager'
import { GetCdpsArgs, GetCdpsResult } from './calls/getCdps'
import { CallObservable } from './calls/observe'
import { vatGem, vatUrns } from './calls/vat'
import { MakerVaultType, VaultResolve } from './calls/vaultResolver'
import { IlkData } from './ilks'
import { OraclePriceData, OraclePriceDataArgs } from './prices'
import { buildPosition } from './vault.maths'

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
        switchMap((vaults) => (vaults.length === 0 ? of([]) : fetchVaultsType(vaults))),
      ),
    ),
    shareReplay(1),
  )
}

export type VaultWithValue<V extends VaultWithType> = V & { value: BigNumber }
// the value of the position in USD.  collateral prices can come from different places
// depending on the vault type.
export function decorateVaultsWithValue$<V extends VaultWithType>(
  vaults$: (address: string) => Observable<V>,
  exchangeQuote$: (
    token: string,
    slippage: BigNumber,
    amount: BigNumber,
    action: ExchangeAction,
    exchangeType: ExchangeType,
  ) => Observable<Quote>,
  userSettings$: Observable<UserSettingsState>,
  address: string,
): Observable<VaultWithValue<V>[]> {
  return combineLatest(vaults$(address), userSettings$).pipe(
    switchMap(([vaults, userSettings]: [Array<VaultWithType>, UserSettingsState]) => {
      if (vaults.length === 0) return of([])
      return combineLatest(
        vaults.map((vault) => {
          if (vault.type === 'borrow') {
            // use price from maker oracle
            return of({ ...vault, value: vault.lockedCollateralUSD.minus(vault.debt) })
          } else {
            // use price from 1inch
            return exchangeQuote$(
              vault.token,
              userSettings.slippage,
              vault.lockedCollateral,
              'BUY_COLLATERAL', // should be SELL_COLLATERAL but the manage multiply pipe uses BUY, and we want the values the same.
              'defaultExchange',
            ).pipe(
              map((quote) => {
                const collateralValue =
                  quote.status === 'SUCCESS'
                    ? vault.lockedCollateral.times(quote.tokenPrice)
                    : vault.lockedCollateralUSD
                return { ...vault, value: collateralValue.minus(vault.debt) }
              }),
            )
          }
        }),
      )
    }),
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
  oraclePriceData$: (args: OraclePriceDataArgs) => Observable<OraclePriceData>,
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
            oraclePriceData$({ token, requestedData: ['currentPrice', 'nextPrice'] }),
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
                return of({
                  id,
                  makerType,
                  ilk,
                  token,
                  address: urnAddress,
                  owner,
                  controller,
                  lockedCollateral: collateral,
                  normalizedDebt,
                  unlockedCollateral,
                  chainId: context.chainId,
                  ...buildPosition({
                    collateral,
                    currentPrice,
                    nextPrice,
                    debtScalingFactor,
                    normalizedDebt,
                    stabilityFee,
                    liquidationRatio,
                    ilkDebtAvailable,
                    collateralizationDangerThreshold,
                    collateralizationWarningThreshold,
                    minActiveColRatio: liquidationRatio, // user can reduce vault col ratio right down to liquidation ratio
                    originationFee: zero,
                  }),
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
