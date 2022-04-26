import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { formatAmount } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Heading, Text } from 'theme-ui'

import { zero } from '../../../helpers/zero'

interface ContentCardBuyingPowerProps {
  token: string
  buyingPower?: BigNumber
  buyingPowerUSD: BigNumber
  afterBuyingPowerUSD: BigNumber
  changeVariant?: ChangeVariantType
}

function ContentCardBuyingPowerModal() {
  const { t } = useTranslation()

  return (
    <Grid gap={2}>
      <Heading variant="header3">{t('manage-multiply-vault.card.buying-power')}</Heading>
      <Text variant="subheader" as="p" sx={{ fontSize: 2, pb: 2 }}>
        {t('manage-multiply-vault.card.buying-power-description')}
      </Text>
    </Grid>
  )
}

export function ContentCardBuyingPower({
  token,
  buyingPower,
  buyingPowerUSD,
  afterBuyingPowerUSD,
  changeVariant,
}: ContentCardBuyingPowerProps) {
  const { t } = useTranslation()

  const formatted = {
    buyingPower: buyingPower && `${formatAmount(buyingPower, token)} ${token}`,
    buyingPowerUSD: `$${formatAmount(buyingPowerUSD, 'USD')}`,
    afterBuyingPowerUSD:
      afterBuyingPowerUSD && `$${formatAmount(afterBuyingPowerUSD || zero, 'USD')}`,
  }

  const contentCardSettings: ContentCardProps = {
    title: t('system.buying-power'),
    value: formatted.buyingPowerUSD,
    modal: <ContentCardBuyingPowerModal />,
  }

  if (afterBuyingPowerUSD && changeVariant)
    contentCardSettings.change = {
      value: `${formatted.afterBuyingPowerUSD} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    }
  if (buyingPower) contentCardSettings.footnote = formatted.buyingPower

  return <DetailsSectionContentCard {...contentCardSettings} />
}
