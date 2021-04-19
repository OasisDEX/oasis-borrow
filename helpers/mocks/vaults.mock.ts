import { BigNumber } from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { OraclePriceData } from 'blockchain/prices'
import { createVault$, Vault } from 'blockchain/vaults'
import { ilkToToken$ } from 'components/AppContext'
import { one, zero } from 'helpers/zero'
import { Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import { mockIlkData$ } from './ilks.mock'

export interface MockVaultProps {
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

export function mockVault$({
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
}: MockVaultProps): Observable<Vault> {
  function oraclePriceData$() {
    return (
      _oraclePriceData$ ||
      of({
        currentPrice,
        isStaticPrice: false,
        nextPrice,
      })
    )
  }

  function ilkData$() {
    return (
      _ilkData$ ||
      oraclePriceData$().pipe(
        switchMap(({ currentPrice }) =>
          mockIlkData$({ ilk, currentCollateralPrice: currentPrice }),
        ),
      )
    )
  }

  function cdpManagerUrns$() {
    return _cdpManagerUrns$ || of('0xUrnAddress')
  }

  function cdpManagerIlks$() {
    return of(ilk)
  }

  function cdpManagerOwner$() {
    return of(DEFAULT_PROXY_ADDRESS)
  }

  function controller$() {
    return of(controller)
  }

  function vatGem$() {
    return of(unlockedCollateral)
  }

  function vatUrns$() {
    return ilkData$().pipe(
      switchMap(({ debtScalingFactor }) =>
        of({
          normalizedDebt: debt.div(debtScalingFactor).dp(18, BigNumber.ROUND_DOWN),
          collateral,
        }),
      ),
    )
  }

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
