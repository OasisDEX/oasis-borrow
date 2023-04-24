import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Grid, Heading, Text } from 'theme-ui'

interface ContentCardMaxLendingLTVModalProps {
  maxLendingPercentage: string
  quoteToken: string
  collateralToken: string
}

function ContentCardMaxLendingLTVModal({
  maxLendingPercentage,
  quoteToken,
  collateralToken,
}: ContentCardMaxLendingLTVModalProps) {
  const { t } = useTranslation()

  return (
    <Grid gap={2}>
      <Heading variant="header3">
        {t('ajna.position-page.earn.manage.overview.max-lending-ltv')}
      </Heading>
      <Text variant="paragraph2" as="p" sx={{ pb: 2 }}>
        {t('ajna.position-page.earn.manage.overview.max-lending-ltv-modal-desc', {
          quoteToken,
          collateralToken,
        })}
      </Text>
      <Card variant="vaultDetailsCardModal" sx={{ my: 2 }}>
        {maxLendingPercentage}
      </Card>
    </Grid>
  )
}

interface ContentCardMaxLendingLTVProps {
  maxLendingPercentage: BigNumber
  price: BigNumber
  quoteToken: string
  collateralToken: string
  afterMaxLendingPercentage?: BigNumber
  isLoading?: boolean
  changeVariant?: ChangeVariantType
}

export function ContentCardMaxLendingLTV({
  maxLendingPercentage,
  price,
  quoteToken,
  collateralToken,
  isLoading,
  afterMaxLendingPercentage,
  changeVariant = 'positive',
}: ContentCardMaxLendingLTVProps) {
  const { t } = useTranslation()

  const formatted = {
    maxLendingPercentage: formatDecimalAsPercent(maxLendingPercentage),
    afterMaxLendingPercentage:
      afterMaxLendingPercentage && formatDecimalAsPercent(afterMaxLendingPercentage),
  }

  const contentCardSettings: ContentCardProps = {
    title: t('ajna.position-page.earn.manage.overview.max-lending-ltv'),
    value: formatted.maxLendingPercentage,
    change: {
      isLoading,
      value:
        afterMaxLendingPercentage &&
        `${formatted.afterMaxLendingPercentage} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    },
    footnote: `${formatCryptoBalance(price)} ${quoteToken}`,
    modal: (
      <ContentCardMaxLendingLTVModal
        collateralToken={collateralToken}
        quoteToken={quoteToken}
        maxLendingPercentage={formatted.maxLendingPercentage}
      />
    ),
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
