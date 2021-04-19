import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { IlkData } from 'blockchain/ilks'
import { Context, protoContext } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { protoTxHelpers } from 'components/AppContext'
import { createManageVault$, ManageVaultState } from 'features/manageVault/manageVault'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { PriceInfo } from 'features/shared/priceInfo'
import { one } from 'helpers/zero'
import { Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { mockBalanceInfo$, MockBalanceInfoProps } from './balanceInfo'
import { mockIlkData$, MockIlkDataProps } from './ilks'
import { mockPriceInfo$, MockPriceInfoProps } from './priceInfo'
import { mockVault$, MockVaultProps } from './vaults'

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

  const context$ = of({
    ...protoContext,
    account,
    status,
  })
  const txHelpers$ = of(protoTxHelpers)

  const priceInfo$ = () => _priceInfo$ || mockPriceInfo$({ ...priceInfo, token })
  const ilkData$ = () =>
    _ilkData$ ||
    mockIlkData$({
      _priceInfo$: priceInfo$(),
      ...ilkData,
    })

  const balanceInfo$ = () => _balanceInfo$ || mockBalanceInfo$({ ...balanceInfo, address: account })

  const proxyAddress$ = () => _proxyAddress$ || of(proxyAddress)
  const allowance$ = (_token: string) =>
    _token === 'DAI'
      ? _daiAllowance$ || of(daiAllowance)
      : _collateralAllowance$ || of(collateralAllowance)

  const _oraclePriceData$ = priceInfo$().pipe(
    switchMap(({ currentCollateralPrice, nextCollateralPrice, isStaticCollateralPrice }) =>
      of({
        currentPrice: currentCollateralPrice,
        nextPrice: nextCollateralPrice || currentCollateralPrice,
        isStaticPrice: isStaticCollateralPrice,
      }),
    ),
  )

  const vault$ = () =>
    _vault$ ||
    mockVault$({
      _oraclePriceData$,
      _ilkData$: ilkData$(),
      ilk: vault.ilk,
      collateral: vault.collateral,
      debt: vault.debt,
    })
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
