import type BigNumber from 'bignumber.js'
import type {
  OmniContentCardBase,
  OmniContentCardDataWithModal,
  OmniContentCardValue,
} from 'features/omni-kit/components/details-section'
import { formatCryptoBalance, formatUsdValue } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'

interface OmniCardDataTokensValueParams extends OmniContentCardDataWithModal {
  afterTokensAmount?: BigNumber
  footnote?: OmniContentCardValue
  tokensAmount: BigNumber
  tokensPrice?: BigNumber
  tokensSymbol: string
  translationCardName: string
  usdAsDefault?: boolean
}

export function useOmniCardDataTokensValue({
  afterTokensAmount,
  footnote,
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
    ...((tokensPrice || footnote) && {
      footnote: [
        ...(!usdAsDefault && tokensAmount.gt(zero) && tokensPrice
          ? [formatUsdValue(tokensAmount.times(tokensPrice))]
          : []),
        ...(footnote ? [footnote] : []),
      ],
    }),
    modal,
  }
}
