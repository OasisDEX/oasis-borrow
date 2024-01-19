import type BigNumber from 'bignumber.js'
import type {
  OmniContentCardBase,
  OmniContentCardDataWithModal,
} from 'features/omni-kit/components/details-section'
import { formatCryptoBalance, formatUsdValue } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'

interface OmniCardDataTokensValueParams extends OmniContentCardDataWithModal {
  afterTokensAmount?: BigNumber
  tokensAmount: BigNumber
  tokensPrice?: BigNumber
  tokensSymbol: string
  translationCardName: string
  usdAsDefault?: boolean
}

export function useOmniCardDataTokensValue({
  afterTokensAmount,
  modal,
  tokensAmount,
  tokensPrice,
  tokensSymbol,
  translationCardName,
  usdAsDefault,
}: OmniCardDataTokensValueParams): OmniContentCardBase {
  const value =
    usdAsDefault && tokensPrice
      ? formatUsdValue(tokensAmount.times(tokensPrice))
      : formatCryptoBalance(tokensAmount)

  return {
    title: { key: `omni-kit.content-card.${translationCardName}.title`, values: { tokensSymbol } },
    value,
    ...((!usdAsDefault || !tokensPrice) && {
      unit: tokensSymbol,
    }),
    ...(afterTokensAmount && {
      change: ['', formatCryptoBalance(afterTokensAmount), tokensSymbol],
    }),
    ...(!usdAsDefault &&
      tokensAmount.gt(zero) &&
      tokensPrice && {
        footnote: [formatUsdValue(tokensAmount.times(tokensPrice))],
      }),
    modal,
  }
}
