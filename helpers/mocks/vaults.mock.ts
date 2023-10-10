import { BigNumber } from 'bignumber.js'
import { MakerVaultType } from 'blockchain/calls/vaultResolver'
import type { IlkData } from 'blockchain/ilks.types'
import type { OraclePriceData } from 'blockchain/prices.types'
import { createVault$ } from 'blockchain/vaults'
import type { Vault } from 'blockchain/vaults.types'
import { generateRandomBigNumber } from 'features/automation/optimization/autoTakeProfit/tests/utils'
import type { PriceInfo } from 'features/shared/priceInfo.types'
import { getRandomString } from 'helpers/getRandomString'
import { getStateUnpacker } from 'helpers/testHelpers'
import { one, zero } from 'helpers/zero'
import type { Observable } from 'rxjs'
import { of } from 'rxjs'
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
  priceInfo?: Partial<PriceInfo>
  id?: BigNumber
}

interface MockVaultOptions {
  atRiskLevelWarning?: boolean
  atRiskLevelDanger?: boolean
  underCollateralized?: boolean
  atRiskLevelWarningAtNextPrice?: boolean
  atRiskLevelDangerAtNextPrice?: boolean
  underCollateralizedAtNextPrice?: boolean
}

export const DEFAULT_PROXY_ADDRESS = '0xProxyAddress'
export const DEFAULT_CHAIN_ID = 7312

export const defaultController = '0xVaultController'
export const defaultDebt = new BigNumber('5000')
export const defaultCollateral = new BigNumber('500')

type MockVaults = {
  vault$: Observable<Vault>
}

export function mockVault$({
  _cdpManagerUrns$,
  _oraclePriceData$,
  _ilkData$,
  priceInfo,
  id = one,
  debt,
  collateral,
  ilk,
}: MockVaultProps = {}): MockVaults {
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

  return {
    vault$: createVault$(
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
    ),
  }
}

export function mockVaults(props: MockVaultProps = {}): () => Vault {
  return getStateUnpacker(mockVault$(props).vault$)
}

export function createMockVault(options: MockVaultOptions): Vault {
  return {
    makerType: 'STANDARD',
    id: generateRandomBigNumber(),
    owner: getRandomString(),
    controller: '',
    token: '',
    ilk: getRandomString(),
    address: getRandomString(),
    lockedCollateral: generateRandomBigNumber(),
    unlockedCollateral: generateRandomBigNumber(),
    lockedCollateralUSD: generateRandomBigNumber(),
    lockedCollateralUSDAtNextPrice: generateRandomBigNumber(),
    backingCollateral: generateRandomBigNumber(),
    backingCollateralAtNextPrice: generateRandomBigNumber(),
    backingCollateralUSD: generateRandomBigNumber(),
    backingCollateralUSDAtNextPrice: generateRandomBigNumber(),
    freeCollateral: generateRandomBigNumber(),
    freeCollateralAtNextPrice: generateRandomBigNumber(),
    freeCollateralUSD: generateRandomBigNumber(),
    freeCollateralUSDAtNextPrice: generateRandomBigNumber(),
    debt: generateRandomBigNumber(),
    debtOffset: generateRandomBigNumber(),
    normalizedDebt: generateRandomBigNumber(),
    availableDebt: generateRandomBigNumber(),
    availableDebtAtNextPrice: generateRandomBigNumber(),
    collateralizationRatio: generateRandomBigNumber(),
    collateralizationRatioAtNextPrice: generateRandomBigNumber(),
    liquidationPrice: generateRandomBigNumber(),
    daiYieldFromLockedCollateral: generateRandomBigNumber(),

    atRiskLevelWarning: options.atRiskLevelWarning || false,
    atRiskLevelDanger: options.atRiskLevelDanger || false,
    underCollateralized: options.underCollateralized || false,

    atRiskLevelWarningAtNextPrice: options.atRiskLevelWarningAtNextPrice || false,
    atRiskLevelDangerAtNextPrice: options.atRiskLevelDangerAtNextPrice || false,
    underCollateralizedAtNextPrice: options.underCollateralizedAtNextPrice || false,
    chainId: 5,
  } as Vault
}
