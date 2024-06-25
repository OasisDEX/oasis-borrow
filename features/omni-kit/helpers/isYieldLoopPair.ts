interface IsYieldLoopPairParams {
  collateralToken: string
  debtToken: string
}

export const yieldLoopDefinition = {
  // its a eth yield loop if both the collateral and debt token are on this list
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
  ],
  // its a stable coin yield loop if both the collateral and debt token are on this list
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
  ],
}

export const isYieldLoopToken = (token?: string) => {
  const { ethYieldTokens, stableCoinYieldTokens } = yieldLoopDefinition

  if (!token) {
    return false
  }

  return (
    ethYieldTokens.includes(token.toLocaleUpperCase()) ||
    stableCoinYieldTokens.includes(token.toLocaleUpperCase())
  )
}

export const isYieldLoopPair = (pair: IsYieldLoopPairParams) => {
  const { collateralToken, debtToken } = pair
  const { ethYieldTokens, stableCoinYieldTokens } = yieldLoopDefinition

  return (
    // its an eth yield loop
    (ethYieldTokens.includes(collateralToken.toLocaleUpperCase()) &&
      ethYieldTokens.includes(debtToken.toLocaleUpperCase())) ||
    // its a stable coin yield loop
    (stableCoinYieldTokens.includes(collateralToken.toLocaleUpperCase()) &&
      stableCoinYieldTokens.includes(debtToken.toLocaleUpperCase()))
  )
}
