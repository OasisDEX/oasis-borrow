import type BigNumber from 'bignumber.js'
import type { ContentCardProps } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import type { OmniContentCardCommonProps } from 'features/omni-kit/components/details-section/types'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface OmniContentCardPositionDebtProps extends OmniContentCardCommonProps {
  afterPositionDebt?: BigNumber
  positionDebt: BigNumber
  positionDebtUSD?: BigNumber
  quoteToken: string
}

export function OmniContentCardPositionDebt({
  afterPositionDebt,
  changeVariant,
  isLoading,
  modalTheme,
  positionDebt,
  positionDebtUSD,
  quoteToken,
}: OmniContentCardPositionDebtProps) {
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
      <DetailsSectionContentSimpleModal
        title={t('ajna.position-page.borrow.common.overview.position-debt')}
        description={t('ajna.position-page.borrow.common.overview.position-debt-modal-desc')}
        value={`${formatted.positionDebt} ${quoteToken}`}
        theme={modalTheme}
      />
    ),
  }

  if (positionDebtUSD && !positionDebt.isZero()) {
    contentCardSettings.footnote = formatted.positionDebtUSD
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
