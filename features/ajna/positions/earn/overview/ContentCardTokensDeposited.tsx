import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Grid, Heading, Text } from 'theme-ui'

interface ContentCardTokensDepositedModalProps {
  tokensDeposited: string
  quoteToken: string
}

function ContentCardTokensDepositedModal({
  tokensDeposited,
  quoteToken,
}: ContentCardTokensDepositedModalProps) {
  const { t } = useTranslation()

  return (
    <Grid gap={2}>
      <Heading variant="header3">
        {t('ajna.position-page.earn.manage.overview.tokens-deposited')}
      </Heading>
      <Text variant="paragraph2" as="p" sx={{ pb: 2 }}>
        {t('ajna.position-page.earn.manage.overview.tokens-deposited-modal-desc')}
      </Text>
      <Card variant="vaultDetailsCardModal" sx={{ my: 2 }}>
        {tokensDeposited} {quoteToken}
      </Card>
    </Grid>
  )
}

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
      <ContentCardTokensDepositedModal
        tokensDeposited={formatted.tokensDeposited}
        quoteToken={quoteToken}
      />
    ),
  }

  if (!tokensDepositedUSD.isZero()) {
    contentCardSettings.footnote = formatted.tokensDepositedUSD
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
