import BigNumber from 'bignumber.js'
import { protoTxHelpers } from 'components/AppContext'
import { ExchangeAction, Quote } from 'features/exchange/exchange'
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
  priceInfo?: MockPriceInfoProps
  balanceInfo?: MockBalanceInfoProps
  ilks?: string[]
  allowance?: BigNumber
  ilkData?: MockIlkDataProps
  exchangeQuote?: MockExchangeQuote
}

export function mockOpenMultiplyVault({
  priceInfo = {},
  balanceInfo = {},
  ilks = ['ETH-A'],
  allowance = new BigNumber(0),
  ilkData = {},
  exchangeQuote = {},
}: MockOpenMultiplyVaultProps = {}) {
  return createOpenMultiplyVault$(
    of(mockContextConnected),
    of(protoTxHelpers),
    () => of('0xProxyAddress'),
    () => of(allowance),
    () => mockPriceInfo$(priceInfo),
    () => mockBalanceInfo$(balanceInfo),
    of(ilks),
    () => mockIlkData$(ilkData),
    mockExchangeQuote$(exchangeQuote),
    'ETH-A',
  )
}
