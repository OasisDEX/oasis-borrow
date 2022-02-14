import { ContractDesc } from '@oasisdex/web3-context'
import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import { getToken } from 'blockchain/tokensMetadata'
import { Observable, of } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { catchError, distinctUntilChanged, map, retry, switchMap, tap } from 'rxjs/operators'
import { Dictionary } from 'ts-essentials'

import { amountFromWei, amountToWei } from '@oasisdex/utils/lib/src/utils'

const API_ENDPOINT = `https://oasis.api.enterprise.1inch.exchange/v4.0/1/swap`

interface Response {
  fromToken: TokenDescriptor
  toToken: TokenDescriptor
  toTokenAmount: string
  fromTokenAmount: string
  tx: Tx
}

interface TokenDescriptor {
  symbol: string
  name: string
  decimals: number
  eip2612?: boolean
  address: string
  logoURI: string
}

interface Tx {
  from: string
  to: string
  data: string
  value: string
  gasPrice: string
  gas: number
}

export type ExchangeAction = 'BUY_COLLATERAL' | 'SELL_COLLATERAL'

export type ExchangeType = 'defaultExchange' | 'noFeesExchange' | 'lowerFeesExchange'

type TokenMetadata = {
  address: string
  decimals: number
  name: string
  symbol: string
}

export type QuoteResult = {
  status: 'SUCCESS'
  fromTokenAddress: string
  toTokenAddress: string
  collateralAmount: BigNumber
  daiAmount: BigNumber
  tokenPrice: BigNumber
  tx: Tx
}

export function getTokenMetaData(
  symbol: string,
  tokens: Dictionary<ContractDesc, string>,
): TokenMetadata {
  const details = getToken(symbol)
  return {
    address: tokens[symbol].address,
    decimals: details.precision,
    symbol,
    name: details.name,
  }
}

export function getQuote$(
  dai: TokenMetadata,
  collateral: TokenMetadata,
  account: string,
  amount: BigNumber, // This is always the receiveAtLeast amount of tokens we want to exchange from
  slippage: BigNumber,
  action: ExchangeAction,
  protocols?: string,
) {
  const fromTokenAddress = action === 'BUY_COLLATERAL' ? dai.address : collateral.address
  const toTokenAddress = action === 'BUY_COLLATERAL' ? collateral.address : dai.address

  const _1inchAmount = amountToWei(
    amount,
    action === 'BUY_COLLATERAL' ? dai.decimals : collateral.decimals,
  ).toFixed(0)

  //TODO: set proper precision depending on token
  const searchParams = new URLSearchParams({
    fromTokenAddress,
    toTokenAddress,
    amount: _1inchAmount,
    fromAddress: account,
    slippage: slippage.times(100).toString(),
    disableEstimate: 'true',
    allowPartialFill: 'false',
    protocols: protocols || 'UNISWAP_V3,PMM4,UNISWAP_V2,SUSHI,CURVE,PSM',
  })

  const responseBase = {
    status: 'SUCCESS',
    fromTokenAddress,
    toTokenAddress,
  }

  if (amount.isZero() || amount.isNaN() || !amount.isFinite() || _1inchAmount === '0') {
    //this is not valid 1inch call

    return of({
      ...responseBase,

      collateralAmount: amountFromWei(new BigNumber(0)),
      daiAmount: amountFromWei(new BigNumber(0)),
      tokenPrice: new BigNumber(0),
      tx: {
        //empty payload
        data: '',
        from: '',
        gas: 0,
        gasPrice: '0',
        to: '',
        value: '0',
      },
    } as QuoteResult)
  }

  return ajax(`${API_ENDPOINT}?${searchParams.toString()}`).pipe(
    tap((response) => {
      if (response.status !== 200) throw new Error(response.responseText)
    }),
    map((response): Response => response.response),
    map(({ fromToken, toToken, toTokenAmount, fromTokenAmount, tx }) => {
      const normalizedFromTokenAmount = amountFromWei(
        new BigNumber(fromTokenAmount),
        fromToken.decimals,
      )
      const normalizedToTokenAmount = amountFromWei(new BigNumber(toTokenAmount), toToken.decimals)
      return {
        ...responseBase,
        collateralAmount: amountFromWei(
          action === 'BUY_COLLATERAL'
            ? new BigNumber(toTokenAmount)
            : new BigNumber(fromTokenAmount),
          action === 'BUY_COLLATERAL' ? toToken.decimals : fromToken.decimals,
        ),
        daiAmount: amountFromWei(
          action === 'BUY_COLLATERAL'
            ? new BigNumber(fromTokenAmount)
            : new BigNumber(toTokenAmount),
          action === 'BUY_COLLATERAL' ? fromToken.decimals : toToken.decimals,
        ),
        tokenPrice:
          action === 'BUY_COLLATERAL'
            ? normalizedFromTokenAmount.div(normalizedToTokenAmount)
            : normalizedToTokenAmount.div(normalizedFromTokenAmount),
        tx,
      }
    }),
    retry(3),
    catchError(() => of({ status: 'ERROR' } as const)),
  )
}

export type Quote = ReturnType<typeof getQuote$> extends Observable<infer R> ? R : never

export function createExchangeQuote$(
  context$: Observable<Context>,
  protocols: string | undefined,
  token: string,
  slippage: BigNumber,
  amount: BigNumber,
  action: ExchangeAction,
  exchangeType: ExchangeType,
) {
  return context$.pipe(
    switchMap((context) => {
      const { tokensMainnet } = context
      const exchange = (context as any)[exchangeType]

      const dai = getTokenMetaData('DAI', tokensMainnet)
      const collateral = getTokenMetaData(token, tokensMainnet)

      return getQuote$(dai, collateral, exchange.address, amount, slippage, action, protocols)
    }),
    distinctUntilChanged((s1, s2) => {
      return JSON.stringify(s1) === JSON.stringify(s2)
    }),
  )
}
