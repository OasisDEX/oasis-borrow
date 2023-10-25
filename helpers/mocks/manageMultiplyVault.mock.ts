import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20.constants'
import type { IlkData } from 'blockchain/ilks.types'
import type { Context } from 'blockchain/network.types'
import type { Vault } from 'blockchain/vaults.types'
import type { TriggersData } from 'features/automation/api/automationTriggersData.types'
import { VaultType } from 'features/generalManageVault/vaultType.types'
import { createManageMultiplyVault$ } from 'features/multiply/manage/pipes/manageMultiplyVault'
import type { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/ManageMultiplyVaultState.types'
import type { BalanceInfo } from 'features/shared/balanceInfo.types'
import type { PriceInfo } from 'features/shared/priceInfo.types'
import type { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory.types'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import { mockedMultiplyEvents } from 'helpers/multiply/calculations.mock'
import { protoTxHelpers } from 'helpers/protoTxHelpers'
import { one, zero } from 'helpers/zero'
import type { Observable } from 'rxjs'
import { of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import type { MockBalanceInfoProps } from './balanceInfo.mock'
import { mockBalanceInfo$ } from './balanceInfo.mock'
import { mockContext$ } from './context.mock'
import type { MockExchangeQuote } from './exchangeQuote.mock'
import { mockExchangeQuote$ } from './exchangeQuote.mock'
import type { MockIlkDataProps } from './ilks.mock'
import { mockIlkData$ } from './ilks.mock'
import { addGasEstimationMock } from './openVault.mock'
import type { MockPriceInfoProps } from './priceInfo.mock'
import { mockPriceInfo$ } from './priceInfo.mock'
import { slippageLimitMock } from './slippageLimit.mock'
import { mockedEmptyStopLossTrigger } from './stopLoss.mock'
import type { MockVaultProps } from './vaults.mock'
import { mockVault$ } from './vaults.mock'

export const MOCK_VAULT_ID = one
export const MOCK_CHAIN_ID = new BigNumber(2137)

export interface MockManageMultiplyVaultProps {
  _context$?: Observable<Context>
  _txHelpers$?: Observable<TxHelpers>
  _ilkData$?: Observable<IlkData>
  _priceInfo$?: Observable<PriceInfo>
  _balanceInfo$?: Observable<BalanceInfo>
  _proxyAddress$?: Observable<string | undefined>
  _vaultHistory$?: Observable<VaultHistoryEvent[]>
  _automationTriggersData$?: Observable<TriggersData>
  _collateralAllowance$?: Observable<BigNumber>
  _daiAllowance$?: Observable<BigNumber>
  _vault$?: Observable<Vault>
  _saveVaultType$?: Observable<void>

  ilkData?: MockIlkDataProps
  priceInfo?: MockPriceInfoProps
  balanceInfo?: MockBalanceInfoProps
  vault?: MockVaultProps

  proxyAddress?: string
  collateralAllowance?: BigNumber
  daiAllowance?: BigNumber
  account?: string
  status?: 'connected'
  exchangeQuote?: MockExchangeQuote
  gasEstimationUsd?: BigNumber
}

export function mockManageMultiplyVault$({
  _context$,
  _txHelpers$,
  _ilkData$,
  _priceInfo$,
  _balanceInfo$,
  _proxyAddress$,
  _vaultHistory$,
  _automationTriggersData$,
  _collateralAllowance$,
  _daiAllowance$,
  _vault$,
  _saveVaultType$,

  ilkData,
  priceInfo,
  balanceInfo,
  vault,
  proxyAddress,
  collateralAllowance,
  daiAllowance,
  account = '0xVaultController',
  status = 'connected',
  exchangeQuote,
  gasEstimationUsd,
}: MockManageMultiplyVaultProps = {}): Observable<ManageMultiplyVaultState> {
  const token = vault && vault.ilk ? vault.ilk.split('-')[0] : 'WBTC'

  const context$ =
    _context$ ||
    mockContext$({
      account,
      status,
    })
  const txHelpers$ = _txHelpers$ || of(protoTxHelpers)

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

  function vaultHistory$() {
    return _vaultHistory$ || of(mockedMultiplyEvents)
  }

  function automationTriggersData$() {
    return _automationTriggersData$ || of(mockedEmptyStopLossTrigger)
  }

  function allowance$(_token: string) {
    return _token === 'DAI'
      ? _daiAllowance$ || daiAllowance
        ? of(daiAllowance || zero)
        : of(maxUint256)
      : _collateralAllowance$ || collateralAllowance
      ? of(collateralAllowance || zero)
      : of(maxUint256)
  }

  function vault$() {
    return (
      _vault$ ||
      priceInfo$().pipe(
        switchMap((priceInfo) => {
          return mockVault$({
            _ilkData$: ilkData$(),
            priceInfo,
            ...vault,
          }).vault$
        }),
      )
    )
  }

  function saveVaultType$() {
    return _saveVaultType$ || of(undefined)
  }

  function gasEstimationMock$<T>(state: T) {
    return addGasEstimationMock(state, gasEstimationUsd)
  }

  return createManageMultiplyVault$(
    context$ as Observable<Context>,
    txHelpers$,
    proxyAddress$,
    allowance$,
    priceInfo$,
    balanceInfo$,
    ilkData$,
    vault$,
    mockExchangeQuote$(exchangeQuote),
    gasEstimationMock$,
    slippageLimitMock(),
    vaultHistory$,
    saveVaultType$,
    automationTriggersData$,
    VaultType.Multiply,
    MOCK_VAULT_ID,
  )
}
