import type { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20.constants'
import { StandardDssProxyActionsContractAdapter } from 'blockchain/calls/proxyActions/adapters/standardDssProxyActionsContractAdapter'
import type { IlkData } from 'blockchain/ilks.types'
import type { ContextConnected } from 'blockchain/network.types'
import { createOpenVault$ } from 'features/borrow/open/pipes/openVault'
import type { BalanceInfo } from 'features/shared/balanceInfo.types'
import type { PriceInfo } from 'features/shared/priceInfo.types'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import { protoTxHelpers } from 'helpers/protoTxHelpers'
import type { Observable } from 'rxjs'
import { of } from 'rxjs'

import type { MockBalanceInfoProps } from './balanceInfo.mock'
import { mockBalanceInfo$ } from './balanceInfo.mock'
import { mockContextConnected$ } from './context.mock'
import type { MockIlkDataProps } from './ilks.mock'
import { mockIlkData$, mockIlkToToken$ } from './ilks.mock'
import type { MockPriceInfoProps } from './priceInfo.mock'
import { mockPriceInfo$ } from './priceInfo.mock'

export function addGasEstimationMock<T>(state: T, gasEstimationUsd?: BigNumber) {
  return of({ ...state, gasEstimationUsd })
}

export interface MockOpenVaultProps {
  _context$?: Observable<ContextConnected>
  _txHelpers$?: Observable<TxHelpers>
  _ilkData$?: Observable<IlkData>
  _priceInfo$?: Observable<PriceInfo>
  _balanceInfo$?: Observable<BalanceInfo>
  _proxyAddress$?: Observable<string | undefined>
  _allowance$?: Observable<BigNumber>
  _ilks$?: Observable<string[]>

  ilkData?: MockIlkDataProps
  priceInfo?: MockPriceInfoProps
  balanceInfo?: MockBalanceInfoProps
  proxyAddress?: string
  allowance?: BigNumber
  account?: string
  status?: 'connected'
  ilks?: string[]
  ilk?: string
  gasEstimationUsd?: BigNumber
}

export function mockOpenVault$({
  _context$,
  _txHelpers$,
  _ilkData$,
  _priceInfo$,
  _balanceInfo$,
  _proxyAddress$,
  _allowance$,
  _ilks$,
  ilkData,
  priceInfo,
  balanceInfo,
  proxyAddress,
  allowance = maxUint256,
  account = '0xVaultController',
  ilks,
  ilk = 'WBTC-A',
  gasEstimationUsd,
}: MockOpenVaultProps = {}) {
  const token = ilk.split('-')[0]

  const context$ =
    _context$ ||
    mockContextConnected$({
      account,
      status: 'connected',
    })

  const txHelpers$ = _txHelpers$ || of(protoTxHelpers)

  function priceInfo$() {
    return _priceInfo$ || mockPriceInfo$({ ...priceInfo, token })
  }

  function ilkData$() {
    return (
      _ilkData$ ||
      mockIlkData$({
        ilk,
        _priceInfo$: priceInfo$(),
        ...ilkData,
      })
    )
  }

  const ilks$ = _ilks$ || (ilks && ilks.length ? of(ilks!) : of([ilk]))

  function balanceInfo$() {
    return _balanceInfo$ || mockBalanceInfo$({ ...balanceInfo, address: account })
  }

  function proxyAddress$() {
    return _proxyAddress$ || of(proxyAddress)
  }

  function allowance$() {
    return _allowance$ || of(allowance)
  }

  function gasEstimationMock$<T>(state: T) {
    return addGasEstimationMock(state, gasEstimationUsd)
  }

  return createOpenVault$(
    context$,
    txHelpers$,
    proxyAddress$,
    allowance$,
    priceInfo$,
    balanceInfo$,
    ilks$,
    ilkData$,
    mockIlkToToken$,
    gasEstimationMock$,
    () => of(StandardDssProxyActionsContractAdapter),
    ilk,
  )
}
