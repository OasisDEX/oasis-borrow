import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { AjnaDetailsSectionContentSimpleModal } from 'features/ajna/common/components/AjnaDetailsSectionContentSimpleModal'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentCardCurrentEarningsProps {
  isLoading?: boolean
  quoteToken: string
  currentEarnings: BigNumber
  afterCurrentEarnings?: BigNumber
  netPnL: BigNumber
  changeVariant?: ChangeVariantType
}

export function ContentCardCurrentEarnings({
  isLoading,
  quoteToken,
  currentEarnings,
  afterCurrentEarnings,
  netPnL,
  changeVariant = 'positive',
}: ContentCardCurrentEarningsProps) {
  const { t } = useTranslation()

  const formatted = {
    currentEarnings: formatCryptoBalance(currentEarnings),
    afterCurrentEarnings:
      afterCurrentEarnings && `${formatCryptoBalance(afterCurrentEarnings)} ${quoteToken}`,
    netPnL: formatPercent(netPnL, { precision: 2 }),
  }

  const contentCardSettings: ContentCardProps = {
    title: t('ajna.position-page.earn.manage.overview.current-earnings'),
    value: formatted.currentEarnings,
    unit: quoteToken,
    change: {
      isLoading,
      value:
        afterCurrentEarnings &&
        `${formatted.afterCurrentEarnings} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    },
    modal: (
      <AjnaDetailsSectionContentSimpleModal
        title={t('ajna.position-page.earn.manage.overview.current-earnings')}
        description={t('ajna.position-page.earn.manage.overview.current-earnings-modal-desc', {
          quoteToken,
        })}
        value={`${formatted.currentEarnings} ${quoteToken}`}
      />
    ),
  }

  if (!netPnL.isZero()) {
    contentCardSettings.footnote = t('ajna.position-page.earn.manage.overview.net-pnl', {
      netPnL: formatted.netPnL,
    })
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
