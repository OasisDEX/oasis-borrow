import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { protoTxHelpers } from 'components/AppContext'
import { ExchangeAction, Quote } from 'features/exchange/exchange'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { PriceInfo } from 'features/shared/priceInfo'
import { mockBalanceInfo$, MockBalanceInfoProps } from 'helpers/mocks/balanceInfo.mock'
import { mockContextConnected } from 'helpers/mocks/context.mock'
import { mockIlkData$, MockIlkDataProps } from 'helpers/mocks/ilks.mock'
import { mockPriceInfo$, MockPriceInfoProps } from 'helpers/mocks/priceInfo.mock'
import { Observable, of } from 'rxjs'

import { createOpenMultiplyVault$ } from '../../features/openMultiplyVault/openMultiplyVault'

interface MockExchangeQuote {
  marketPrice?: BigNumber
}

function mockExchangeQuote$({ marketPrice = new BigNumber(2000) }: MockExchangeQuote = {}): (
  token: string,
  slippage: BigNumber,
  amount: BigNumber,
  action: ExchangeAction,
) => Observable<Quote> {
  return (token: string, _slippage: BigNumber, amount: BigNumber, _action: ExchangeAction) =>
    of({
      status: 'SUCCESS' as const,
      fromToken: {
        symbol: 'DAI',
        name: 'DAI',
        decimals: 18,
        eip2612: true,
        address: '0xDAI',
        logoURI: 'ETH',
      },
      collateralAmount: amount,
      daiAmount: marketPrice.times(amount),
      tokenPrice: marketPrice,
      toToken: {
        symbol: token,
        name: token,
        decimals: 18,
        address: `0x${token}`,
        logoURI: 'url',
      },
      toTokenAmount: 'string',
      fromTokenAmount: 'string',
      tx: {
        from: 'string',
        to: 'string',
        data: 'string',
        value: 'string',
        gasPrice: 'string',
        gas: 0,
      },
    })
}

export interface MockOpenMultiplyVaultProps {
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
  exchangeQuote?: MockExchangeQuote
}

export function mockOpenMultiplyVault({
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
  allowance = new BigNumber(0),
  account = '0xVaultController',
  ilks = ['ETH-A'],
  ilk = 'ETH-A',
  exchangeQuote,
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

  return createOpenMultiplyVault$(
    of(mockContextConnected),
    of(protoTxHelpers),
    proxyAddress$,
    allowance$,
    priceInfo$,
    balanceInfo$,
    ilks$,
    ilkData$,
    mockExchangeQuote$(exchangeQuote),
    ilk,
  )
}
