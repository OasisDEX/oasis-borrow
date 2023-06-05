const SHORT_POSITION_COLLATERALS = ['DAI', 'USDC']

interface isShortPositionParams {
  collateralToken: string
}

export function isShortPosition({ collateralToken }: isShortPositionParams): boolean {
  return SHORT_POSITION_COLLATERALS.includes(collateralToken)
}
