import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { AjnaDetailsSectionContentSimpleModal } from 'features/ajna/common/components/AjnaDetailsSectionContentSimpleModal'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
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
  // TODO token deposited should be sum of deposits and earnings
  tokensDeposited,
  afterTokensDeposited,
  tokensDepositedUSD,
  changeVariant = 'positive',
}: ContentCardCurrentEarningsProps) {
  const { t } = useTranslation()

  const formatted = {
    tokensDeposited: formatCryptoBalance(tokensDeposited),
    afterTokensDeposited:
      afterTokensDeposited && `${formatCryptoBalance(afterTokensDeposited)} ${quoteToken}`,
    tokensDepositedUSD: `$${formatAmount(tokensDepositedUSD, 'USD')}`,
  }

  const contentCardSettings: ContentCardProps = {
    title: t('ajna.position-page.earn.manage.overview.tokens-deposited'),
    value: formatted.tokensDeposited,
    unit: quoteToken,
    change: {
      isLoading,
      value:
        afterTokensDeposited &&
        `${formatted.afterTokensDeposited} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    },
    modal: (
      <AjnaDetailsSectionContentSimpleModal
        title={t('ajna.position-page.earn.manage.overview.tokens-deposited')}
        description={t('ajna.position-page.earn.manage.overview.tokens-deposited-modal-desc')}
        value={`${formatted.tokensDeposited} ${quoteToken}`}
      />
    ),
  }

  if (!tokensDepositedUSD.isZero()) {
    contentCardSettings.footnote = formatted.tokensDepositedUSD
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
