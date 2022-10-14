import BigNumber from 'bignumber.js'

import { one } from './zero'

async function swapOneInchTokens(
  fromTokenAddress: string,
  toTokenAddress: string,
  amount: string,
  recipient: string,
  slippage: string,
  protocols: string[] = [],
): Promise<any> {
  const url = formatOneInchSwapUrl(
    fromTokenAddress,
    toTokenAddress,
    amount,
    slippage,
    recipient,
    protocols,
  )

  return exchangeTokens(url)
}

function formatOneInchSwapUrl(
  fromToken: string,
  toToken: string,
  amount: string,
  slippage: string,
  recepient: string,
  protocols: string[] = [],
) {
  const protocolsParam = !protocols?.length ? '' : `&protocols=${protocols.join(',')}`
  return `https://oasis.api.enterprise.1inch.exchange/v4.0/1/swap?fromTokenAddress=${fromToken.toLowerCase()}&toTokenAddress=${toToken}&amount=${amount}&fromAddress=${recepient}&slippage=${slippage}${protocolsParam}&disableEstimate=true&allowPartialFill=false`
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

export function getOneInchCall(swapAddress: string) {
  return async (from: string, to: string, amount: BigNumber, slippage: BigNumber) => {
    const response = await swapOneInchTokens(
      from,
      to,
      amount.toString(),
      swapAddress,
      slippage.toString(),
    )

    return {
      toTokenAddress: to,
      fromTokenAddress: from,
      minToTokenAmount: new BigNumber(response.toTokenAmount).times(one.minus(slippage)),
      toTokenAmount: new BigNumber(response.toTokenAmount),
      fromTokenAmount: new BigNumber(response.fromTokenAmount),
      exchangeCalldata: response.tx.data,
    }
  }
}
