import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { protoTxHelpers, TxHelpers } from 'components/AppContext'
import {
  createManageVault$,
  InstitutionalBorrowManageVaultViewStateProvider,
  ManageInstiVaultState,
  ManageVaultState,
  StandardBorrowManageVaultViewStateProvider,
} from 'features/borrow/manage/pipes/manageVault'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { PriceInfo } from 'features/shared/priceInfo'
import { getStateUnpacker } from 'helpers/testHelpers'
import { one, zero } from 'helpers/zero'
import { Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import { withdrawPaybackDepositGenerateLogicFactory } from '../../blockchain/calls/proxyActions/proxyActions'
import { StandardDssProxyActionsContractWrapper } from '../../blockchain/calls/proxyActions/standardDssProxyActionsContractWrapper'
import { InstiVault } from '../../blockchain/instiVault'
import { mockBalanceInfo$, MockBalanceInfoProps } from './balanceInfo.mock'
import { mockContext$ } from './context.mock'
import { mockIlkData$, MockIlkDataProps } from './ilks.mock'
import { addGasEstimationMock } from './openVault.mock'
import { mockPriceInfo$, MockPriceInfoProps } from './priceInfo.mock'
import { mockVault$, MockVaultProps } from './vaults.mock'

export const MOCK_VAULT_ID = one
export const MOCK_CHAIN_ID = new BigNumber(2137)

function buildMockDependencies({
  _context$,
  _txHelpers$,
  _ilkData$,
  _priceInfo$,
  _balanceInfo$,
  _proxyAddress$,
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
}: MockManageVaultProps = {}) {
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
          })
        }),
      )
    )
  }

  function saveVaultType$() {
    return _saveVaultType$ || of(undefined)
  }

  return {
    token,
    context$,
    txHelpers$,
    priceInfo$,
    ilkData$,
    balanceInfo$,
    proxyAddress$,
    allowance$,
    vault$,
    saveVaultType$,
  }
}

export interface MockManageVaultProps {
  _context$?: Observable<Context>
  _txHelpers$?: Observable<TxHelpers>
  _ilkData$?: Observable<IlkData>
  _priceInfo$?: Observable<PriceInfo>
  _balanceInfo$?: Observable<BalanceInfo>
  _proxyAddress$?: Observable<string | undefined>
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
}

export function mockManageVault$(args: MockManageVaultProps = {}): Observable<ManageVaultState> {
  const {
    context$,
    txHelpers$,
    proxyAddress$,
    allowance$,
    priceInfo$,
    balanceInfo$,
    ilkData$,
    vault$,
    saveVaultType$,
  } = buildMockDependencies(args)

  return createManageVault$<Vault, ManageVaultState>(
    context$ as Observable<Context>,
    txHelpers$,
    proxyAddress$,
    allowance$,
    priceInfo$,
    balanceInfo$,
    ilkData$,
    vault$,
    saveVaultType$,
    addGasEstimationMock,
    withdrawPaybackDepositGenerateLogicFactory(StandardDssProxyActionsContractWrapper),
    StandardBorrowManageVaultViewStateProvider,
    MOCK_VAULT_ID,
  )
}

export interface MockManageInstiVaultProps extends MockManageVaultProps {
  _instiVault$: Observable<InstiVault>
}

export function mockManageInstiVault$(
  args: MockManageInstiVaultProps,
): Observable<ManageInstiVaultState> {
  const {
    context$,
    txHelpers$,
    proxyAddress$,
    allowance$,
    priceInfo$,
    balanceInfo$,
    ilkData$,
    saveVaultType$,
  } = buildMockDependencies(args)

  function instiVault$() {
    return args._instiVault$
  }

  return createManageVault$<InstiVault, ManageInstiVaultState>(
    context$ as Observable<Context>,
    txHelpers$,
    proxyAddress$,
    allowance$,
    priceInfo$,
    balanceInfo$,
    ilkData$,
    instiVault$,
    saveVaultType$,
    addGasEstimationMock,
    withdrawPaybackDepositGenerateLogicFactory(StandardDssProxyActionsContractWrapper),
    InstitutionalBorrowManageVaultViewStateProvider,
    MOCK_VAULT_ID,
  )
}

export function mockManageVault(props: MockManageVaultProps = {}) {
  return getStateUnpacker(mockManageVault$(props))
}
