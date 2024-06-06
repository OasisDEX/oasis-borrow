import BigNumber from 'bignumber.js'
import { NetworkIds } from 'blockchain/networks'
import {
  ARBITRUM_DEFAULT_LIQUIDITY_PROVIDERS,
  BASE_DEFAULT_LIQUIDITY_PROVIDERS,
  ETHEREUM_MAINNET_DEFAULT_PROTOCOLS,
  OPTIMISM_DEFAULT_PROCOTOLS,
} from 'features/exchange/exchange'
import { match } from 'ts-pattern'

import { one } from './zero'

async function swapOneInchTokens(
  fromTokenAddress: string,
  toTokenAddress: string,
  amount: string,
  recipient: string,
  slippage: string,
  chainId: number,
  oneInchVersion: 'v4.1' | 'v5.0',
  protocols: string[] = [],
): Promise<any> {
  const url = formatOneInchSwapUrl(
    fromTokenAddress,
    toTokenAddress,
    amount,
    slippage,
    recipient,
    chainId,
    oneInchVersion,
    protocols,
  )

  return exchangeTokens(url)
}

const PROXY_API_ENDPOINT = `/api/exchange`

function formatOneInchSwapUrl(
  fromToken: string,
  toToken: string,
  amount: string,
  slippage: string,
  recepient: string,
  chainId: number,
  oneInchVersion: 'v4.1' | 'v5.0',
  protocols: string[] = [],
) {
  const protocolsParam = !protocols?.length ? '' : `&protocols=${protocols.join(',')}`
  return `${PROXY_API_ENDPOINT}/${oneInchVersion}/${chainId}/swap?fromTokenAddress=${fromToken.toLowerCase()}&toTokenAddress=${toToken}&amount=${amount}&fromAddress=${recepient}&slippage=${slippage}${protocolsParam}&disableEstimate=true&allowPartialFill=false`
}

async function exchangeTokens(url: string): Promise<any> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Error performing 1inch swap request ${url}: ${await response.text()}`)
  }

  return (await response.json()) as Promise<any>
}

export async function oneInchCallMock(
  from: string,
  to: string,
  amount: BigNumber,
  slippage: BigNumber,
) {
  const marketPrice = 1.01
  return {
    fromTokenAddress: from,
    toTokenAddress: to,
    fromTokenAmount: amount,
    toTokenAmount: amount.div(marketPrice),
    minToTokenAmount: amount
      .div(marketPrice)
      .times(new BigNumber(1).minus(slippage))
      .integerValue(BigNumber.ROUND_DOWN),
    exchangeCalldata: 0,
  }
}

// TODO: export from oasis-earn-sc into @oasisdex/oasis-actions lib and import from there
export function getOneInchCall(
  swapAddress: string,
  networkId: NetworkIds = NetworkIds.MAINNET,
  oneInchVersion: 'v4.1' | 'v5.0' = 'v4.1',
  debug?: true,
) {
  return async (
    from: string,
    to: string,
    amount: BigNumber,
    slippage: BigNumber,
    protocols: string[] = [],
  ) => {
    const resolvedProcotols = match({ protocols, networkId })
      .with(
        { protocols: [], networkId: NetworkIds.OPTIMISMMAINNET },
        () => OPTIMISM_DEFAULT_PROCOTOLS,
      )
      .with(
        { protocols: [], networkId: NetworkIds.MAINNET },
        () => ETHEREUM_MAINNET_DEFAULT_PROTOCOLS,
      )
      .with(
        { protocols: [], networkId: NetworkIds.ARBITRUMMAINNET },
        () => ARBITRUM_DEFAULT_LIQUIDITY_PROVIDERS,
      )
      .with(
        { protocols: [], networkId: NetworkIds.BASEMAINNET },
        () => BASE_DEFAULT_LIQUIDITY_PROVIDERS,
      )
      .otherwise(() => protocols)

    const response = await swapOneInchTokens(
      from,
      to,
      amount.toString(),
      swapAddress,
      slippage.times('100').toString(), // 1inch expects slippage in percentage format
      networkId,
      oneInchVersion,
      resolvedProcotols,
    )

    if (debug) {
      console.info('1inch')
      console.info('fromTokenAmount', response.fromTokenAmount.toString())
      console.info('toTokenAmount', response.toTokenAmount.toString())
      console.info('slippage', slippage.times('100').toString())
      console.info('minToTokenAmount', response.toTokenAmount.toString())
      console.info('exchangeCalldata', response.tx.data)
      console.info('protocols', protocols)
    }

    return {
      toTokenAddress: to,
      fromTokenAddress: from,
      minToTokenAmount: new BigNumber(response.toTokenAmount)
        .times(one.minus(slippage))
        .integerValue(BigNumber.ROUND_DOWN),
      toTokenAmount: new BigNumber(response.toTokenAmount),
      fromTokenAmount: new BigNumber(response.fromTokenAmount),
      exchangeCalldata: response.tx.data,
    }
  }
}
