import { AJNA_TOKENS_WITH_MULTIPLY } from 'features/omni-kit/protocols/ajna/constants'

interface IsPoolSupportingMultiplyParams {
  collateralToken: string
  quoteToken: string
}

export function isPoolSupportingMultiply({
  collateralToken,
  quoteToken,
}: IsPoolSupportingMultiplyParams): boolean {
  return (
    AJNA_TOKENS_WITH_MULTIPLY.includes(collateralToken) &&
    AJNA_TOKENS_WITH_MULTIPLY.includes(quoteToken)
  )
}
