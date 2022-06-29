import BigNumber from 'bignumber.js'
import { protoTxHelpers, TxHelpers } from 'components/AppContext'
import { mockBalanceInfo$, MockBalanceInfoProps } from 'helpers/mocks/balanceInfo.mock'
import { mockContextConnected } from 'helpers/mocks/context.mock'
import { mockIlkData$, MockIlkDataProps } from 'helpers/mocks/ilks.mock'
import { mockPriceInfo$, MockPriceInfoProps } from 'helpers/mocks/priceInfo.mock'
import { Observable, of } from 'rxjs'

import { IlkData } from '../../blockchain/ilks'
import { createOpenGuniVault$ } from '../../features/earn/guni/open/pipes/openGuniVault'
import { BalanceInfo } from '../../features/shared/balanceInfo'
import { PriceInfo } from '../../features/shared/priceInfo'
import { MockExchangeQuote, mockExchangeQuote$ } from './exchangeQuote.mock'
import { addGasEstimationMock } from './openVault.mock'
import { slippageLimitMock } from './slippageLimit.mock'

const mockOnEveryBlock = new Observable<number>()

export interface MockGuniEarnVaultProps {
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

export function mockGuniOpenEarnVault({
  _ilkData$,
  _priceInfo$,
  _balanceInfo$,
  _proxyAddress$,
  _allowance$,
  _ilks$,
  _txHelpers$,
  _token1Balance$,
  _getGuniMintAmount$,

  ilkData,
  priceInfo = { collateralPrice: new BigNumber(1021) },
  balanceInfo,
  proxyAddress,
  allowance = new BigNumber(10000),
  account = '0xVaultController',
  ilks = ['GUNIV3DAIUSDC1-A'],
  ilk = 'GUNIV3DAIUSDC1-A',
  exchangeQuote,
  gasEstimationUsd,
}: MockGuniEarnVaultProps = {}) {
  const token = ilk.split('-')[0]

  const ilks$ = _ilks$ || (ilks && ilks.length ? of(ilks!) : of([ilk]))

  function ilkData$() {
    return (
      _ilkData$ ||
      mockIlkData$({
        ilk,
        liquidationRatio: new BigNumber(1.02),
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

  function token1Balance$() {
    return _token1Balance$ || of(new BigNumber(8.549))
  }

  function getGuniMintAmount$() {
    return (
      _getGuniMintAmount$ ||
      of({
        amount0: new BigNumber(58604),
        amount1: new BigNumber(12820),
        mintAmount: new BigNumber(69.96),
      })
    )
  }

  const txHelpers$ = _txHelpers$ || of(protoTxHelpers)

  function gasEstimationMock$<T>(state: T) {
    return addGasEstimationMock(state, gasEstimationUsd)
  }

  return createOpenGuniVault$(
    of(mockContextConnected),
    txHelpers$,
    proxyAddress$,
    allowance$,
    priceInfo$,
    balanceInfo$,
    ilks$,
    ilkData$,
    mockExchangeQuote$(exchangeQuote),
    mockOnEveryBlock,
    gasEstimationMock$,
    ilk,
    token1Balance$,
    getGuniMintAmount$,
    slippageLimitMock(),
  )
}
