export function isShortPosition({ collateralToken }: { collateralToken: string }): boolean {
  return ['SDAI', 'DAI', 'USDC'].includes(collateralToken)
}
