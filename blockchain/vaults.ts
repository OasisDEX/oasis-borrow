import BigNumber from 'bignumber.js'
import { zero } from 'helpers/zero'
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
import type { Vault, VaultChange } from './vaults.types'

BigNumber.config({
  POW_PRECISION: 100,
})

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
