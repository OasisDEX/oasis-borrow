import BigNumber from 'bignumber.js'
import { InfoSection } from 'components/infoSection/InfoSection'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'

interface CancelAutoSellInfoSectionProps {
  collateralizationRatio: BigNumber
  liquidationPrice: BigNumber
  estimatedTransactionCost: ReactNode
}

export function CancelAutoSellInfoSection({
  collateralizationRatio,
  liquidationPrice,
  estimatedTransactionCost,
}: CancelAutoSellInfoSectionProps) {
  const { t } = useTranslation()

  const liquidationPriceFormatted = formatAmount(liquidationPrice, 'USD')
  const collateralizationRatioFormatted = formatPercent(collateralizationRatio.times(100), {
    precision: 2,
  })

  return (
    <InfoSection
      title={t('auto-sell.cancel-summary-title')}
      items={[
        {
          label: t('system.collateral-ratio'),
          value: collateralizationRatioFormatted,
        },
        {
          label: t('system.liquidation-price'),
          value: `$${liquidationPriceFormatted}`,
        },
        {
          label: t('auto-sell.estimated-transaction-cost'),
          value: estimatedTransactionCost,
        },
      ]}
    />
  )
}
