import { GasEstimation } from 'components/GasEstimation'
import { InfoSection } from 'components/infoSection/InfoSection'
import { useAppConfig } from 'helpers/config'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

import type { CancelAutoBSInfoSectionProps } from './CancelAutoBSInfoSection.types'

export function CancelAutoBSInfoSection({
  positionRatio,
  liquidationPrice,
  debt,
  title,
  targetLabel,
  triggerLabel,
  autoBSTriggerData,
}: CancelAutoBSInfoSectionProps) {
  const { t } = useTranslation()
  const isDebtZero = debt.isZero()
  const { ReadOnlyBasicBS: readOnlyAutoBSEnabled } = useAppConfig('features')

  const liquidationPriceFormatted = formatAmount(liquidationPrice, 'USD')
  const positionRatioFormatted = formatPercent(positionRatio.times(100), {
    precision: 2,
  })
  const execCollRatioFormatted = formatPercent(autoBSTriggerData.execCollRatio, { precision: 2 })
  const targetCollRatioFormatted = formatPercent(autoBSTriggerData.targetCollRatio, {
    precision: 2,
  })

  return (
    <InfoSection
      title={title}
      items={[
        ...(isDebtZero || readOnlyAutoBSEnabled
          ? [
              {
                label: targetLabel,
                value: targetCollRatioFormatted,
                change: '0%',
              },
              {
                label: triggerLabel,
                value: execCollRatioFormatted,
                change: '0%',
              },
            ]
          : [
              {
                label: t('system.collateral-ratio'),
                value: positionRatioFormatted,
              },
              {
                label: t('system.liquidation-price'),
                value: `$${liquidationPriceFormatted}`,
              },
            ]),
        {
          label: t('auto-sell.estimated-transaction-cost'),
          value: <GasEstimation />,
        },
      ]}
    />
  )
}
