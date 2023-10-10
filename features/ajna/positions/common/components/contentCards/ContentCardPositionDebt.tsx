import type BigNumber from 'bignumber.js'
import type { ChangeVariantType, ContentCardProps } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { AjnaDetailsSectionContentSimpleModal } from 'features/ajna/common/components/AjnaDetailsSectionContentSimpleModal'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentCardPositionDebtProps {
  isLoading?: boolean
  quoteToken: string
  positionDebt: BigNumber
  afterPositionDebt?: BigNumber
  positionDebtUSD?: BigNumber
  changeVariant?: ChangeVariantType
}

export function ContentCardPositionDebt({
  isLoading,
  quoteToken,
  positionDebt,
  afterPositionDebt,
  positionDebtUSD,
  changeVariant = 'positive',
}: ContentCardPositionDebtProps) {
  const { t } = useTranslation()

  const formatted = {
    positionDebt: formatCryptoBalance(positionDebt),
    afterPositionDebt:
      afterPositionDebt && `${formatCryptoBalance(afterPositionDebt)} ${quoteToken}`,
    positionDebtUSD: positionDebtUSD && `$${formatAmount(positionDebtUSD, 'USD')}`,
  }

  const contentCardSettings: ContentCardProps = {
    title: t('ajna.position-page.borrow.common.overview.position-debt'),
    value: formatted.positionDebt,
    unit: quoteToken,
    change: {
      isLoading,
      value:
        afterPositionDebt && `${formatted.afterPositionDebt} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    },
    modal: (
      <AjnaDetailsSectionContentSimpleModal
        title={t('ajna.position-page.borrow.common.overview.position-debt')}
        description={t('ajna.position-page.borrow.common.overview.position-debt-modal-desc')}
        value={`${formatted.positionDebt} ${quoteToken}`}
      />
    ),
  }

  if (positionDebtUSD && !positionDebt.isZero()) {
    contentCardSettings.footnote = formatted.positionDebtUSD
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
