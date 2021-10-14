import BigNumber from 'bignumber.js'
import { ExchangeAction, Quote } from 'features/exchange/exchange'
import { EMPTY, Observable, of } from 'rxjs'

export interface MockExchangeQuote {
  marketPrice?: BigNumber
  status?: 'SUCCESS' | 'ERROR'
  isLoading?: boolean
}

export function mockExchangeQuote$({
  marketPrice = new BigNumber(2000),
  status = 'SUCCESS' as const,
  isLoading = false,
}: MockExchangeQuote = {}): (
  token: string,
  slippage: BigNumber,
  amount: BigNumber,
  action: ExchangeAction,
) => Observable<Quote> {
  return (token: string, _slippage: BigNumber, amount: BigNumber, _action: ExchangeAction) =>
    isLoading
      ? EMPTY
      : of({
          status,
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
          fromTokenAddress: '',
          toTokenAddress: '',
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
