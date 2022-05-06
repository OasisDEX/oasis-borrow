import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { formatAmount } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Grid, Heading, Text } from 'theme-ui'

interface ContentCardCollateralLockedModalProps {
  lockedCollateralUSDFormatted: string
  lockedCollateralFormatted: string
}
interface ContentCardCollateralLockedProps {
  token: string
  lockedCollateralUSD?: BigNumber
  lockedCollateral?: BigNumber
  afterLockedCollateralUSD?: BigNumber
  changeVariant?: ChangeVariantType
}

function ContentCardCollateralLockedModal({
  lockedCollateralUSDFormatted,
  lockedCollateralFormatted,
}: ContentCardCollateralLockedModalProps) {
  const { t } = useTranslation()

  return (
    <Grid gap={2}>
      <Heading variant="header3">{t('system.collateral-locked')}</Heading>
      <Heading variant="header3">{t('manage-vault.card.collateral-locked-amount')}</Heading>
      <Card as="p" variant="vaultDetailsCardModal" sx={{ my: 2 }}>
        {lockedCollateralFormatted}
      </Card>
      <Heading variant="header3">{t('manage-vault.card.collateral-locked-USD')}</Heading>
      <Card as="p" variant="vaultDetailsCardModal" sx={{ my: 2 }}>
        {lockedCollateralUSDFormatted}
      </Card>
      <Text as="p" variant="subheader" sx={{ fontSize: 2 }}>
        {t('manage-vault.card.collateral-locked-oracles')}
      </Text>
    </Grid>
  )
}

export function ContentCardCollateralLocked({
  token,
  lockedCollateralUSD,
  lockedCollateral,
  afterLockedCollateralUSD,
  changeVariant,
}: ContentCardCollateralLockedProps) {
  const { t } = useTranslation()

  const formatted = {
    lockedCollateralUSD: `$${formatAmount(lockedCollateralUSD || zero, 'USD')}`,
    lockedCollateral: `${formatAmount(lockedCollateral || zero, token)} ${token}`,
    afterLockedCollateralUSD: `$${formatAmount(afterLockedCollateralUSD || zero, 'USD')}`,
  }

  const contentCardModalSettings: ContentCardCollateralLockedModalProps = {
    lockedCollateralUSDFormatted: formatted.lockedCollateralUSD,
    lockedCollateralFormatted: formatted.lockedCollateral,
  }

  const contentCardSettings: ContentCardProps = {
    title: t('system.collateral-locked'),
    value: formatted.lockedCollateralUSD,
    modal: <ContentCardCollateralLockedModal {...contentCardModalSettings} />,
  }

  if (afterLockedCollateralUSD && changeVariant)
    contentCardSettings.change = {
      value: `${formatted.afterLockedCollateralUSD} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    }
  if (lockedCollateral) contentCardSettings.footnote = formatted.lockedCollateral

  return <DetailsSectionContentCard {...contentCardSettings} />
}
