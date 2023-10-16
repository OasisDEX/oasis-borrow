export function isShortPosition({ collateralToken }: { collateralToken: string }): boolean {
  return ['DAI', 'USDC'].includes(collateralToken)
}
