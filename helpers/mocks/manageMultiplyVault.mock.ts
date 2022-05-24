import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { protoTxHelpers, TxHelpers } from 'components/AppContext'
import {
  createManageMultiplyVault$,
  ManageMultiplyVaultState,
} from 'features/multiply/manage/pipes/manageMultiplyVault'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { PriceInfo } from 'features/shared/priceInfo'
import { getStateUnpacker } from 'helpers/testHelpers'
import { one, zero } from 'helpers/zero'
import { Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import { TriggersData } from '../../features/automation/protection/triggers/AutomationTriggersData'
import { VaultHistoryEvent } from '../../features/vaultHistory/vaultHistory'
import { mockedMultiplyEvents } from '../multiply/calculations.test'
import { mockBalanceInfo$, MockBalanceInfoProps } from './balanceInfo.mock'
import { mockContext$ } from './context.mock'
import { MockExchangeQuote, mockExchangeQuote$ } from './exchangeQuote.mock'
import { mockIlkData$, MockIlkDataProps } from './ilks.mock'
import { addGasEstimationMock } from './openVault.mock'
import { mockPriceInfo$, MockPriceInfoProps } from './priceInfo.mock'
import { slippageLimitMock } from './slippageLimit.mock'
import { mockedEmptyStopLossTrigger } from './stopLoss.mock'
import { mockVault$, MockVaultProps } from './vaults.mock'

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
    MOCK_VAULT_ID,
  )
}

export function mockManageMultiplyVault(props: MockManageMultiplyVaultProps = {}) {
  return getStateUnpacker(mockManageMultiplyVault$(props))
}
