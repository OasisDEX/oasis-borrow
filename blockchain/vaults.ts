import type { UsersWhoFollowVaults } from '@prisma/client'
import BigNumber from 'bignumber.js'
import type { ExchangeAction, ExchangeType, Quote } from 'features/exchange/exchange'
import { checkMultipleVaultsFromApi$ } from 'features/shared/vaultApi'
import type { UserSettingsState } from 'features/userSettings/userSettings.types'
import { zero } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'
import { isEqual } from 'lodash'
import type { Observable } from 'rxjs'
import { combineLatest, of } from 'rxjs'
import { distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators'

import type { GetCdpsArgs, GetCdpsResult } from './calls/getCdps'
import type { CallObservable } from './calls/observe'
import type { vatGem, vatUrns } from './calls/vat'
import type { VaultResolve } from './calls/vaultResolver'
import type { IlkData } from './ilks.types'
import type { Context } from './network.types'
import type { OraclePriceData, OraclePriceDataArgs } from './prices.types'
import { buildPosition } from './vault.maths'
import type {
  CdpIdsResolver,
  Vault,
  VaultChange,
  VaultWithType,
  VaultWithValue,
} from './vaults.types'

BigNumber.config({
  POW_PRECISION: 100,
})

export function fetchVaultsType(vaults: Vault[]): Observable<VaultWithType[]> {
  return checkMultipleVaultsFromApi$(
    vaults.map((vault) => vault.id.toFixed(0)),
    LendingProtocol.Maker,
  ).pipe(
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

export function createVaults$(
  refreshInterval: Observable<number>,
  vault$: (id: BigNumber, chainId: number) => Observable<Vault>,
  context$: Observable<Context>,
  cdpIdResolvers: CdpIdsResolver[],
  address: string,
): Observable<VaultWithType[]> {
  console.log('createVaults')
  return combineLatest(refreshInterval, context$).pipe(
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

export function createVaultsFromIds$(
  refreshInterval: Observable<number>,
  followedVaults$: (address: string) => Observable<UsersWhoFollowVaults[]>,
  vault$: (id: BigNumber, chainId: number) => Observable<Vault>,
  context$: Observable<Context>,
  cdpIdResolvers: CdpIdsResolver[],
  address: string,
): Observable<VaultWithType[]> {
  return combineLatest(refreshInterval, context$, followedVaults$(address)).pipe(
    switchMap(([_, context, followedVaults]) =>
      combineLatest(cdpIdResolvers.map((resolver) => resolver(address))).pipe(
        switchMap(() => {
          const filteredVaults = followedVaults
            .filter((vault) => vault.vault_chain_id === context.chainId)
            .filter((vault) => vault.protocol === 'maker') // TODO: ŁW - add support for other protocols
            .map((followedVault) => {
              if (followedVault) {
                return vault$(new BigNumber(followedVault.vault_id), context.chainId)
              }

              return null
            })

          return filteredVaults.length === 0 ? of([]) : combineLatest(filteredVaults)
        }),
        distinctUntilChanged<Vault[]>(isEqual),
        switchMap((vaults) => (vaults.length === 0 ? of([]) : fetchVaultsType(vaults))),
      ),
    ),
    shareReplay(1),
  )
}

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

export function createVaultChange$(
  vault$: (id: BigNumber, chainId: number) => Observable<Vault>,
  id: BigNumber,
  chainId: number,
): Observable<VaultChange> {
  return vault$(id, chainId).pipe(map((vault) => ({ kind: 'vault', vault })))
}
