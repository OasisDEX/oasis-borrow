import BigNumber from 'bignumber.js'
import type { IlkData } from 'blockchain/ilks.types'
import { createOpenMultiplyVault$ } from 'features/multiply/open/pipes/openMultiplyVault'
import type { BalanceInfo } from 'features/shared/balanceInfo.types'
import type { PriceInfo } from 'features/shared/priceInfo.types'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import type { MockBalanceInfoProps } from 'helpers/mocks/balanceInfo.mock'
import { mockBalanceInfo$ } from 'helpers/mocks/balanceInfo.mock'
import { mockContextConnected } from 'helpers/mocks/context.mock'
import type { MockIlkDataProps } from 'helpers/mocks/ilks.mock'
import { mockIlkData$ } from 'helpers/mocks/ilks.mock'
import type { MockPriceInfoProps } from 'helpers/mocks/priceInfo.mock'
import { mockPriceInfo$ } from 'helpers/mocks/priceInfo.mock'
import { protoTxHelpers } from 'helpers/protoTxHelpers'
import type { Observable } from 'rxjs'
import { of } from 'rxjs'

import type { MockExchangeQuote } from './exchangeQuote.mock'
import { mockExchangeQuote$ } from './exchangeQuote.mock'
import { addGasEstimationMock } from './openVault.mock'
import { slippageLimitMock } from './slippageLimit.mock'

export interface MockOpenMultiplyVaultProps {
  _ilkData$?: Observable<IlkData>
  _priceInfo$?: Observable<PriceInfo>
  _balanceInfo$?: Observable<BalanceInfo>
  _proxyAddress$?: Observable<string | undefined>
  _allowance$?: Observable<BigNumber>
  _ilks$?: Observable<string[]>
  _txHelpers$?: Observable<TxHelpers>
  _token1Balance$?: Observable<BigNumber>
  _getGuniMintAmount$?: Observable<{
    amount0: BigNumber
    amount1: BigNumber
    mintAmount: BigNumber
  }>

  ilkData?: MockIlkDataProps
  priceInfo?: MockPriceInfoProps
  balanceInfo?: MockBalanceInfoProps
  proxyAddress?: string
  allowance?: BigNumber
  account?: string
  status?: 'connected'
  ilks?: string[]
  ilk?: string
  exchangeQuote?: MockExchangeQuote
  gasEstimationUsd?: BigNumber
}

export function mockOpenMultiplyVault({
  _ilkData$,
  _priceInfo$,
  _balanceInfo$,
  _proxyAddress$,
  _allowance$,
  _ilks$,
  _txHelpers$,

  ilkData,
  priceInfo,
  balanceInfo,
  proxyAddress,
  allowance = new BigNumber(0),
  account = '0xVaultController',
  ilks = ['ETH-A', 'WBTC-A'],
  ilk = 'WBTC-A',
  exchangeQuote,
  gasEstimationUsd,
}: MockOpenMultiplyVaultProps = {}) {
  const token = ilk.split('-')[0]

  const ilks$ = _ilks$ || (ilks && ilks.length ? of(ilks!) : of([ilk]))

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

  function priceInfo$() {
    return _priceInfo$ || mockPriceInfo$({ ...priceInfo, token })
  }

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

  const txHelpers$ = _txHelpers$ || of(protoTxHelpers)

  return createOpenMultiplyVault$(
    of(mockContextConnected),
    txHelpers$,
    proxyAddress$,
    allowance$,
    priceInfo$,
    balanceInfo$,
    ilks$,
    ilkData$,
    mockExchangeQuote$(exchangeQuote),
    gasEstimationMock$,
    slippageLimitMock(),
    ilk,
  )
}
