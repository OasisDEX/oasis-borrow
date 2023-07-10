import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { AjnaDetailsSectionContentSimpleModal } from 'features/ajna/common/components/AjnaDetailsSectionContentSimpleModal'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentCardTotalEarningsProps {
  isLoading?: boolean
  quoteToken: string
  totalEarnings: BigNumber
  afterTotalEarnings?: BigNumber
  netPnL: BigNumber
  changeVariant?: ChangeVariantType
}

export function ContentCardTotalEarnings({
  isLoading,
  quoteToken,
  totalEarnings,
  afterTotalEarnings,
  netPnL,
  changeVariant = 'positive',
}: ContentCardTotalEarningsProps) {
  const { t } = useTranslation()

  const formatted = {
    totalEarnings: formatCryptoBalance(totalEarnings),
    afterTotalEarnings:
      afterTotalEarnings && `${formatCryptoBalance(afterTotalEarnings)} ${quoteToken}`,
    netPnL: formatDecimalAsPercent(netPnL),
  }

  const contentCardSettings: ContentCardProps = {
    title: t('ajna.position-page.earn.manage.overview.total-earnings'),
    value: formatted.totalEarnings,
    unit: quoteToken,
    change: {
      isLoading,
      value:
        afterTotalEarnings && `${formatted.afterTotalEarnings} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    },
    modal: (
      <AjnaDetailsSectionContentSimpleModal
        title={t('ajna.position-page.earn.manage.overview.total-earnings')}
        description={t('ajna.position-page.earn.manage.overview.total-earnings-modal-desc', {
          quoteToken,
        })}
        value={`${formatted.totalEarnings} ${quoteToken}`}
      />
    ),
  }

  // if (!netPnL.isZero()) {
  contentCardSettings.footnote = t('ajna.position-page.earn.manage.overview.net-pnl', {
    netPnL: formatted.netPnL,
  })
  // }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
