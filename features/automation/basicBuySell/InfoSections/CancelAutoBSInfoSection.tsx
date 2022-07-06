import BigNumber from 'bignumber.js'
import { InfoSection } from 'components/infoSection/InfoSection'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'

interface CancelAutoBSInfoSectionProps {
  collateralizationRatio: BigNumber
  liquidationPrice: BigNumber
  estimatedTransactionCost: ReactNode
  title: string
}

export function CancelAutoBSInfoSection({
  collateralizationRatio,
  liquidationPrice,
  estimatedTransactionCost,
  title,
}: CancelAutoBSInfoSectionProps) {
  const { t } = useTranslation()

  const liquidationPriceFormatted = formatAmount(liquidationPrice, 'USD')
  const collateralizationRatioFormatted = formatPercent(collateralizationRatio.times(100), {
    precision: 2,
  })

  return (
    <InfoSection
      title={title}
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
