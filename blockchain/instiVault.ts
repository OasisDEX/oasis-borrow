import BigNumber from 'bignumber.js'
import moment from 'moment'
import { combineLatest, Observable, of } from 'rxjs'
import { shareReplay, switchMap } from 'rxjs/operators'

import { CallObservable } from './calls/observe'
import { vatGem, vatUrns } from './calls/vat'
import { VaultResolve } from './calls/vaultResolver'
import { IlkData } from './ilks'
import { Context } from './network'
import { OraclePriceData } from './prices'
import { buildPosition } from './vault.maths'
import { Vault } from './vaults'

export interface InstiVault extends Vault {
  originationFeePercent: BigNumber
  activeCollRatio: BigNumber
  activeCollRatioPriceUSD: BigNumber
  termEnd: Date
  currentFixedFee: BigNumber
  nextFeeChange: string
}

export function createInstiVault$(
  vaultResolver$: (cdpId: BigNumber) => Observable<VaultResolve>,
  vatUrns$: CallObservable<typeof vatUrns>,
  vatGem$: CallObservable<typeof vatGem>,
  ilkData$: (ilk: string) => Observable<IlkData>,
  oraclePriceData$: (token: string) => Observable<OraclePriceData>,
  ilkToToken$: (ilk: string) => Observable<string>,
  context$: Observable<Context>,

  charter: {
    nib$: (args: { ilk: string; usr: string }) => Observable<BigNumber>
    peace$: (args: { ilk: string; usr: string }) => Observable<BigNumber>
    uline$: (args: { ilk: string; usr: string }) => Observable<BigNumber>
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
        switchMap(([token, context, nib, peace, uline]) => {
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
                },
              ]) => {
                const ilkDebtAvailable = uline.minus(normalizedDebt.times(debtScalingFactor))
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
                  ...buildPosition(
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
                  ),
                  originationFeePercent: nib,
                  activeCollRatio: peace,
                  activeCollRatioPriceUSD: peace,
                  termEnd: moment().add(3, 'months').toDate(),
                  currentFixedFee: new BigNumber(0.015),
                  nextFeeChange: '1.4% in 20.4m',
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
