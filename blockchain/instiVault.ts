import BigNumber from 'bignumber.js'
import moment from 'moment'
import { combineLatest, Observable, of } from 'rxjs'
import { shareReplay, switchMap } from 'rxjs/operators'

import { CallObservable } from './calls/observe'
import { vatGem, vatUrns } from './calls/vat'
import { VaultResolve } from './calls/vaultResolver'
import { IlkData } from './ilks'
import { Context } from './network'
import { OraclePriceData, OraclePriceDataArgs } from './prices'
import { buildPosition, collateralPriceAtRatio } from './vault.maths'
import { Vault } from './vaults'

export interface InstiVault extends Vault {
  originationFeePercent: BigNumber
  activeCollRatio: BigNumber
  activeCollRatioPriceUSD: BigNumber
  termEnd: Date
  currentFixedFee: BigNumber
  nextFeeChange: string
}

type CharterStreamFactory = (args: { ilk: string; usr: string }) => Observable<BigNumber>

export function createInstiVault$(
  vaultResolver$: (cdpId: BigNumber) => Observable<VaultResolve>,
  vatUrns$: CallObservable<typeof vatUrns>,
  vatGem$: CallObservable<typeof vatGem>,
  ilkData$: (ilk: string) => Observable<IlkData>,
  oraclePriceData$: (args: OraclePriceDataArgs) => Observable<OraclePriceData>,
  ilkToToken$: (ilk: string) => Observable<string>,
  context$: Observable<Context>,

  charter: {
    nib$: CharterStreamFactory
    peace$: CharterStreamFactory
    uline$: CharterStreamFactory
  },

  id: BigNumber,
): Observable<InstiVault> {
  return vaultResolver$(id).pipe(
    switchMap(({ urnAddress, ilk, owner, type: makerType, controller }) =>
      combineLatest(
        ilkToToken$(ilk),
        context$,
        charter.nib$({ ilk, usr: owner }),
        charter.peace$({ ilk, usr: owner }),
        charter.uline$({ ilk, usr: owner }),
      ).pipe(
        switchMap(([token, context, charteredFee, minActiveColRatio, charteredDebtCeiling]) => {
          return combineLatest(
            vatUrns$({ ilk, urnAddress }),
            vatGem$({ ilk, urnAddress }),
            oraclePriceData$({ token, requestedData: ['currentPrice', 'nextPrice'] }),
            ilkData$(ilk),
          ).pipe(
            switchMap(
              ([
                { collateral: lockedCollateral, normalizedDebt },
                unlockedCollateral,
                { currentPrice, nextPrice },
                {
                  debtScalingFactor,
                  liquidationRatio,
                  collateralizationDangerThreshold,
                  collateralizationWarningThreshold,
                  stabilityFee,
                },
              ]) => {
                const debt = normalizedDebt.times(debtScalingFactor)
                const ilkDebtAvailable = charteredDebtCeiling.minus(debt)
                return of({
                  id,
                  makerType,
                  ilk,
                  token,
                  address: urnAddress,
                  owner,
                  controller,
                  lockedCollateral,
                  normalizedDebt,
                  unlockedCollateral,
                  chainId: context.chainId,
                  ...buildPosition({
                    collateral: lockedCollateral,
                    currentPrice,
                    nextPrice,
                    debtScalingFactor,
                    normalizedDebt,
                    stabilityFee,
                    liquidationRatio,
                    ilkDebtAvailable,
                    collateralizationDangerThreshold,
                    collateralizationWarningThreshold,
                    minActiveColRatio,
                    originationFee: charteredFee,
                  }),
                  originationFeePercent: charteredFee,
                  activeCollRatio: minActiveColRatio,
                  activeCollRatioPriceUSD: collateralPriceAtRatio({
                    colRatio: minActiveColRatio,
                    collateral: lockedCollateral,
                    vaultDebt: debt,
                  }),
                  termEnd: moment().add(3, 'months').toDate(),
                  currentFixedFee: charteredFee,
                  nextFeeChange: '0.9% at $20.4m',
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
