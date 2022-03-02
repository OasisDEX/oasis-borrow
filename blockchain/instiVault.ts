import BigNumber from 'bignumber.js'
import { combineLatest, Observable, of } from 'rxjs'
import { filter, map, switchMap } from 'rxjs/operators'

import { Vault } from './vaults'

export interface InstiVault extends Vault {
  originationFeePercent: BigNumber
  activeCollRatio: BigNumber
  activeCollRatioPriceUSD: BigNumber
  debtCeiling: BigNumber
  termEnd: Date
  fixedFee: BigNumber
  nextFixedFee: BigNumber
  instiIlkName: string
}

export function createInstiVault$(
  vault$: (id: BigNumber) => Observable<Vault>,
  charterNib$: (args: { ilk: string; usr: string }) => Observable<BigNumber>,
  charterPeace$: (args: { ilk: string; usr: string }) => Observable<BigNumber>,
  charterUline$: (args: { ilk: string; usr: string }) => Observable<BigNumber>,
  id: BigNumber,
): Observable<InstiVault> {
  return vault$(id).pipe(
    switchMap((vault) =>
      of(vault).pipe(
        map((vault) => [vault.ilk, vault.controller] as const),
        filter((params): params is [string, string] => params[1] !== undefined),
        switchMap(([ilk, usr]) =>
          combineLatest(
            charterNib$({ ilk, usr }),
            charterPeace$({ ilk, usr }),
            charterUline$({ ilk, usr }),
          ).pipe(
            map(([nib, peace, uline]) => ({
              // todo: insti-vault put real values here
              ...vault,
              originationFeePercent: nib,
              activeCollRatio: peace,
              activeCollRatioPriceUSD: peace,
              debtCeiling: uline,
              termEnd: new Date('2022-03-02'),
              fixedFee: new BigNumber(0.2),
              nextFixedFee: new BigNumber(0.3),
              instiIlkName: 'INST-NEXO-ETH',
            })),
          ),
        ),
      ),
    ),
  )
}
