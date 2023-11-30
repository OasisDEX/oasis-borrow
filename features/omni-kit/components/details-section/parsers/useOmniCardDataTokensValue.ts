import type BigNumber from 'bignumber.js'
import type { OmniContentCardBase } from 'features/omni-kit/components/details-section'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'

interface OmniCardDataTokensValueParams {
  afterTokensAmount?: BigNumber
  tokensAmount: BigNumber
  tokensPrice?: BigNumber
  tokensSymbol: string
  translationCardName: string
}

export function useOmniCardDataTokensValue({
  afterTokensAmount,
  tokensAmount,
  tokensPrice,
  tokensSymbol,
  translationCardName,
}: OmniCardDataTokensValueParams): OmniContentCardBase {
  return {
    title: { key: `omni-kit.content-card.${translationCardName}.title` },
    value: formatCryptoBalance(tokensAmount),
    unit: tokensSymbol,
    ...(afterTokensAmount && {
      change: [formatCryptoBalance(afterTokensAmount), tokensSymbol],
    }),
    ...(tokensAmount.gt(zero) &&
      tokensPrice && {
        footnote: [`$${formatCryptoBalance(tokensAmount.times(tokensPrice))}`],
      }),
  }
}
