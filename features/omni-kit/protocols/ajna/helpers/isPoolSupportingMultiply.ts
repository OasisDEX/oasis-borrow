interface IsPoolSupportingMultiplyParams {
  collateralToken: string
  quoteToken: string
  supportedTokens?: string[]
}

export function isPoolSupportingMultiply({
  collateralToken,
  quoteToken,
  supportedTokens = [],
}: IsPoolSupportingMultiplyParams): boolean {
  return !!(supportedTokens.includes(collateralToken) && supportedTokens.includes(quoteToken))
}
