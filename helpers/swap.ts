import BigNumber from 'bignumber.js'
import { NetworkIds } from 'blockchain/networks'
import { defaultExchangeProtocols } from 'features/exchange/exchange'

import { one } from './zero'

async function swapOneInchTokens(
  fromTokenAddress: string,
  toTokenAddress: string,
  amount: string,
  recipient: string,
  slippage: string,
  chainId: number,
  oneInchVersion: 'v4.0' | 'v5.0',
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
  oneInchVersion: 'v4.0' | 'v5.0',
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

  return response.json() as Promise<any>
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

export const optimismLiquidityProviders = [
  'OPTIMISM_UNISWAP_V3',
  'OPTIMISM_SYNTHETIX',
  'OPTIMISM_SYNTHETIX_WRAPPER',
  'OPTIMISM_ONE_INCH_LIMIT_ORDER',
  'OPTIMISM_ONE_INCH_LIMIT_ORDER_V2',
  'OPTIMISM_ONE_INCH_LIMIT_ORDER_V3',
  'OPTIMISM_CURVE',
  // 'OPTIMISM_BALANCER_V2', - We can't use balancer due to reentrancy issues
  'OPTIMISM_VELODROME',
  'OPTIMISM_KYBERSWAP_ELASTIC',
  'OPTIMISM_CLIPPER_COVES',
  'OPTIMISM_KYBER_DMM_STATIC',
  'OPTIMISM_AAVE_V3',
  'OPTIMISM_ELK',
  'OPTIMISM_WOOFI_V2',
  'OPTIMISM_TRIDENT',
  'OPTIMISM_MUMMY_FINANCE',
]

// TODO: export from oasis-earn-sc into @oasisdex/oasis-actions lib and import from there
export function getOneInchCall(
  swapAddress: string,
  networkId: NetworkIds = NetworkIds.MAINNET,
  oneInchVersion: 'v4.0' | 'v5.0' = 'v4.0',
  debug?: true,
) {
  return async (
    from: string,
    to: string,
    amount: BigNumber,
    slippage: BigNumber,
    protocols: string[] = defaultExchangeProtocols,
  ) => {
    const shouldUseOptimismLiquidityProviders =
      networkId === NetworkIds.OPTIMISMMAINNET && protocols.length === 0
    const response = await swapOneInchTokens(
      from,
      to,
      amount.toString(),
      swapAddress,
      slippage.times('100').toString(), // 1inch expects slippage in percentage format
      networkId,
      oneInchVersion,
      shouldUseOptimismLiquidityProviders ? optimismLiquidityProviders : protocols,
    )

    if (debug) {
      console.log('1inch')
      console.log('fromTokenAmount', response.fromTokenAmount.toString())
      console.log('toTokenAmount', response.toTokenAmount.toString())
      console.log('slippage', slippage.times('100').toString())
      console.log('minToTokenAmount', response.toTokenAmount.toString())
      console.log('exchangeCalldata', response.tx.data)
      console.log('protocols', protocols)
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
