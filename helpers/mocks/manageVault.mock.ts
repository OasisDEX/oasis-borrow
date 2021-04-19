import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { protoTxHelpers } from 'components/AppContext'
import { createManageVault$, ManageVaultState } from 'features/manageVault/manageVault'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { PriceInfo } from 'features/shared/priceInfo'
import { one } from 'helpers/zero'
import { Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import { mockBalanceInfo$, MockBalanceInfoProps } from './balanceInfo.mock'
import { mockContext$ } from './context.mock'
import { mockIlkData$, MockIlkDataProps } from './ilks.mock'
import { mockPriceInfo$, MockPriceInfoProps } from './priceInfo.mock'
import { mockVault$, MockVaultProps } from './vaults.mock'

export const MOCK_VAULT_ID = one

export interface MockManageVaultProps {
  _context$?: Observable<Context>
  _ilkData$?: Observable<IlkData>
  _priceInfo$?: Observable<PriceInfo>
  _balanceInfo$?: Observable<BalanceInfo>
  _proxyAddress$?: Observable<string | undefined>
  _collateralAllowance$?: Observable<BigNumber>
  _daiAllowance$?: Observable<BigNumber>
  _vault$?: Observable<Vault>

  ilkData?: MockIlkDataProps
  priceInfo?: MockPriceInfoProps
  balanceInfo?: MockBalanceInfoProps
  vault: MockVaultProps

  proxyAddress?: string
  collateralAllowance?: BigNumber
  daiAllowance?: BigNumber
  account?: string
  status?: 'connected'
}

export function mockManageVault$({
  _context$,
  _ilkData$,
  _priceInfo$,
  _balanceInfo$,
  _proxyAddress$,
  _collateralAllowance$,
  _daiAllowance$,
  _vault$,
  ilkData,
  priceInfo,
  balanceInfo = {},
  vault,
  proxyAddress,
  collateralAllowance = maxUint256,
  daiAllowance = maxUint256,
  account = '0xVaultController',
  status = 'connected',
}: MockManageVaultProps): Observable<ManageVaultState> {
  const token = vault.ilk.split('-')[0]

  const context$ =
    _context$ ||
    mockContext$({
      account,
      status,
    })

  const txHelpers$ = of(protoTxHelpers)

  const _oraclePriceData$ = priceInfo$().pipe(
    switchMap(({ currentCollateralPrice, nextCollateralPrice, isStaticCollateralPrice }) =>
      of({
        currentPrice: currentCollateralPrice,
        nextPrice: nextCollateralPrice || currentCollateralPrice,
        isStaticPrice: isStaticCollateralPrice,
      }),
    ),
  )

  function priceInfo$() {
    return _priceInfo$ || mockPriceInfo$({ ...priceInfo, token })
  }

  function ilkData$() {
    return (
      _ilkData$ ||
      mockIlkData$({
        _priceInfo$: priceInfo$(),
        ...ilkData,
      })
    )
  }

  function balanceInfo$() {
    return _balanceInfo$ || mockBalanceInfo$({ ...balanceInfo, address: account })
  }

  function proxyAddress$() {
    return _proxyAddress$ || of(proxyAddress)
  }

  function allowance$(_token: string) {
    return _token === 'DAI'
      ? _daiAllowance$ || of(daiAllowance)
      : _collateralAllowance$ || of(collateralAllowance)
  }

  function vault$() {
    return (
      _vault$ ||
      mockVault$({
        _oraclePriceData$,
        _ilkData$: ilkData$(),
        ilk: vault.ilk,
        collateral: vault.collateral,
        debt: vault.debt,
      })
    )
  }

  return createManageVault$(
    context$ as Observable<Context>,
    txHelpers$,
    proxyAddress$,
    allowance$,
    priceInfo$,
    balanceInfo$,
    ilkData$,
    vault$,
    MOCK_VAULT_ID,
  )
}
