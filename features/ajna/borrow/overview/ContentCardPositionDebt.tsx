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
    loanToValue: formatAmount(positionDebt, quoteToken),
    afterCollateralLocked: afterPositionDebt && formatAmount(positionDebt, quoteToken),
    collateralLockedUSD: `$${formatAmount(positionDebtUSD, 'USD')}`,
  }

  const contentCardSettings: ContentCardProps = {
    title: t('ajna.borrow.common.overview.position-debt'),
    value: formatted.loanToValue,
    unit: quoteToken,
    footnote: formatted.collateralLockedUSD,
  }

  if (afterPositionDebt !== undefined)
    contentCardSettings.change = {
      value: `${formatted.afterCollateralLocked} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
