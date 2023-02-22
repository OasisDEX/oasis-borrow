import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { formatAmount } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentCardPositionDebtProps {
  quoteToken: string
  positionDebt: BigNumber
  afterPositionDebt?: BigNumber
  positionDebtUSD: BigNumber
  changeVariant?: ChangeVariantType
}

export function ContentCardPositionDebt({
  quoteToken,
  positionDebt,
  afterPositionDebt,
  positionDebtUSD,
  changeVariant = 'positive',
}: ContentCardPositionDebtProps) {
  const { t } = useTranslation()

  const formatted = {
    positionDebt: formatAmount(positionDebt, quoteToken),
    afterPositionDebt:
      afterPositionDebt && `${formatAmount(afterPositionDebt, quoteToken)} ${quoteToken}`,
    positionDebtUSD: `$${formatAmount(positionDebtUSD, 'USD')}`,
  }

  const contentCardSettings: ContentCardProps = {
    title: t('ajna.borrow.common.overview.position-debt'),
    value: formatted.positionDebt,
    unit: quoteToken,
  }

  if (!positionDebt.isZero()) {
    contentCardSettings.footnote = formatted.positionDebtUSD
  }

  if (afterPositionDebt !== undefined)
    contentCardSettings.change = {
      value: `${formatted.afterPositionDebt} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
