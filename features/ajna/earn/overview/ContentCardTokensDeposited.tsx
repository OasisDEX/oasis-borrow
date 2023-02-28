import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { formatAmount } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentCardCurrentEarningsProps {
  isLoading?: boolean
  quoteToken: string
  tokensDeposited: BigNumber
  afterTokensDeposited?: BigNumber
  tokensDepositedUSD: BigNumber
  changeVariant?: ChangeVariantType
}

export function ContentCardTokensDeposited({
  isLoading,
  quoteToken,
  tokensDeposited,
  afterTokensDeposited,
  tokensDepositedUSD,
  changeVariant = 'positive',
}: ContentCardCurrentEarningsProps) {
  const { t } = useTranslation()

  const formatted = {
    tokensDeposited: formatAmount(tokensDeposited, quoteToken),
    afterTokensDeposited:
      afterTokensDeposited && `${formatAmount(afterTokensDeposited, quoteToken)} ${quoteToken}`,
    tokensDepositedUSD: `$${formatAmount(tokensDepositedUSD, 'USD')}`,
  }

  const contentCardSettings: ContentCardProps = {
    title: t('ajna.earn.manage.overview.tokens-deposited'),
    value: formatted.tokensDeposited,
    unit: quoteToken,
    change: {
      isLoading,
      value:
        afterTokensDeposited &&
        `${formatted.afterTokensDeposited} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    },
  }

  if (!tokensDepositedUSD.isZero()) {
    contentCardSettings.footnote = formatted.tokensDepositedUSD
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
