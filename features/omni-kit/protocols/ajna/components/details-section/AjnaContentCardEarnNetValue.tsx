import type BigNumber from 'bignumber.js'
import type { ContentCardProps } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import type { OmniContentCardCommonProps } from 'features/omni-kit/components/details-section/types'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface AjnaContentCardEarnNetValueProps extends OmniContentCardCommonProps {
  afterNetValue?: BigNumber
  netValue: BigNumber
  netValueUSD?: BigNumber
  quoteToken: string
}

export function AjnaContentCardEarnNetValue({
  afterNetValue,
  changeVariant,
  isLoading,
  modalTheme,
  netValue,
  netValueUSD,
  quoteToken,
}: AjnaContentCardEarnNetValueProps) {
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
      <DetailsSectionContentSimpleModal
        title={t('ajna.position-page.earn.manage.overview.net-value')}
        description={t('ajna.position-page.earn.manage.overview.net-value-modal-desc')}
        value={`${formatted.netValue} ${quoteToken}`}
        theme={modalTheme}
      />
    ),
  }

  if (!netValueUSD?.isZero()) {
    contentCardSettings.footnote = formatted.netValueUSD
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
