import { BigNumber } from 'bignumber.js'
import { MakerVaultType } from 'blockchain/calls/vaultResolver'
import { IlkData } from 'blockchain/ilks'
import { OraclePriceData } from 'blockchain/prices'
import { createVault$, Vault } from 'blockchain/vaults'
import { PriceInfo } from 'features/shared/priceInfo'
import { getStateUnpacker } from 'helpers/testHelpers'
import { one, zero } from 'helpers/zero'
import { Observable, of } from 'rxjs'
import { first, switchMap } from 'rxjs/operators'

import { mockContextConnected$ } from './context.mock'
import { mockIlkData$, mockIlkToToken$ } from './ilks.mock'
import { mockPriceInfo$ } from './priceInfo.mock'

export interface MockVaultProps {
  _cdpManagerUrns$?: Observable<string>
  _oraclePriceData$?: Observable<OraclePriceData>
  _ilkData$?: Observable<IlkData>
  controller?: string
  ilk?: string
  collateral?: BigNumber
  debt?: BigNumber
  priceInfo?: PriceInfo
  id?: BigNumber
}

export const DEFAULT_PROXY_ADDRESS = '0xProxyAddress'
export const DEFAULT_CHAIN_ID = 7312

export const defaultController = '0xVaultController'
export const defaultDebt = new BigNumber('5000')
export const defaultCollateral = new BigNumber('500')

export function mockVault$({
  _cdpManagerUrns$,
  _oraclePriceData$,
  _ilkData$,
  priceInfo,
  id = one,
  debt,
  collateral,
  ilk,
}: MockVaultProps = {}): Observable<Vault> {
  const token = ilk ? ilk.split('-')[0] : 'WBTC'

  function oraclePriceData$() {
    return _oraclePriceData$ || priceInfo
      ? of({
          currentPrice: priceInfo!.currentCollateralPrice,
          nextPrice: priceInfo!.nextCollateralPrice,
          isStaticPrice: false,
        } as OraclePriceData)
      : mockPriceInfo$({ token }).pipe(
          switchMap(({ currentCollateralPrice, nextCollateralPrice }) => {
            return of({
              currentPrice: currentCollateralPrice,
              nextPrice: nextCollateralPrice,
              isStaticPrice: false,
            } as OraclePriceData)
          }),
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

  function vatGem$() {
    return of(zero)
  }

  function vatUrns$() {
    return ilkData$().pipe(
      first(),
      switchMap(({ debtScalingFactor }) =>
        of({
          normalizedDebt: (debt || defaultDebt).div(debtScalingFactor).dp(18, BigNumber.ROUND_DOWN),
          collateral: collateral || defaultCollateral,
        }),
      ),
    )
  }

  return createVault$(
    () =>
      of({
        urnAddress: '0xUrnAddress',
        controller: '0xVaultController',
        ilk: ilk || 'WBTC-A',
        owner: '0xProxyAddress',
        type: MakerVaultType.STANDARD,
      }),
    vatUrns$,
    vatGem$,
    ilkData$,
    oraclePriceData$,
    mockIlkToToken$,
    mockContextConnected$({
      account: defaultController,
      status: 'connected',
    }),
    id,
  )
}

export function mockVaults(props: MockVaultProps = {}) {
  return getStateUnpacker(mockVault$(props))
}
