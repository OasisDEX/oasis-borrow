import React from 'react'
import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { AjnaDetailsSectionContentSimpleModal } from 'features/ajna/common/components/AjnaDetailsSectionContentSimpleModal'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'

interface ContentCardEarnNetValueProps {
  isLoading?: boolean
  quoteToken: string
  netValue: BigNumber
  afterNetValue?: BigNumber
  netValueUSD?: BigNumber
  changeVariant?: ChangeVariantType
}

export function ContentCardEarnNetValue({
  isLoading,
  quoteToken,
  netValue,
  afterNetValue,
  netValueUSD,
  changeVariant = 'positive',
}: ContentCardEarnNetValueProps) {
  const { t } = useTranslation()

  const formatted = {
    netValue: formatCryptoBalance(netValue),
    afterNetValue: afterNetValue && `${formatCryptoBalance(afterNetValue)} ${quoteToken}`,
    netValueUSD: netValueUSD && `$${formatAmount(netValueUSD, 'USD')}`,
  }

  const contentCardSettings: ContentCardProps = {
    title: t('ajna.position-page.earn.manage.overview.net-value'),
    value: formatted.netValue,
    unit: quoteToken,
    change: {
      isLoading,
      value: afterNetValue && `${formatted.afterNetValue} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    },
    modal: (
      <AjnaDetailsSectionContentSimpleModal
        title={t('ajna.position-page.earn.manage.overview.net-value')}
        description={t('ajna.position-page.earn.manage.overview.net-value-modal-desc')}
        value={`${formatted.netValue} ${quoteToken}`}
      />
    ),
  }

  if (!netValueUSD?.isZero()) {
    contentCardSettings.footnote = formatted.netValueUSD
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
