interface IsYieldLoopPairParams {
  collateralToken: string
  debtToken: string
}

export const yieldLoopDefinition = {
  // it's a eth yield loop if both the collateral and debt token are on this list
  ethYieldTokens: [
    'CBETH',
    'RETH',
    'STETH',
    'STYETH',
    'WSTETH',
    'OSETH',
    'XETH',
    'DETH',
    'APXETH',
    'WEETH',
    'EZETH',
    'YIELDETH',
    'CSETH',
    'MEVETH',
    'ETH',
    'WETH',
    'WOETH',
    'BSDETH',
    'RSETH',
    'RSWETH',
    'WSUPEROETHB',
  ],
  btcYieldTokens: ['WBTC', 'SWBTC', 'TBTC', 'LBTC'],
  // it's a stable coin yield loop if both the collateral and debt token are on this list
  stableCoinYieldTokens: [
    'SUSDE',
    'SDAI',
    'USDE',
    'DAI',
    'USDE',
    'USDC',
    'USDT',
    'LUSD',
    'GHO',
    'FRAX',
    'MBASIS',
  ],
}

export const isYieldLoopToken = (token?: string) => {
  const { ethYieldTokens, stableCoinYieldTokens, btcYieldTokens } = yieldLoopDefinition

  if (!token) {
    return false
  }

  return (
    ethYieldTokens.includes(token.toLocaleUpperCase()) ||
    stableCoinYieldTokens.includes(token.toLocaleUpperCase()) ||
    btcYieldTokens.includes(token.toLocaleUpperCase())
  )
}

export const isYieldLoopPair = (pair: IsYieldLoopPairParams) => {
  const { collateralToken, debtToken } = pair
  const { ethYieldTokens, stableCoinYieldTokens, btcYieldTokens } = yieldLoopDefinition

  return (
    // it's an eth yield loop
    (ethYieldTokens.includes(collateralToken.toLocaleUpperCase()) &&
      ethYieldTokens.includes(debtToken.toLocaleUpperCase())) ||
    // it's an btc yield loop
    (btcYieldTokens.includes(collateralToken.toLocaleUpperCase()) &&
      btcYieldTokens.includes(debtToken.toLocaleUpperCase())) ||
    // it's a stable coin yield loop
    (stableCoinYieldTokens.includes(collateralToken.toLocaleUpperCase()) &&
      stableCoinYieldTokens.includes(debtToken.toLocaleUpperCase()))
  )
}
