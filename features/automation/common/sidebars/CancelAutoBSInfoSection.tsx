import BigNumber from 'bignumber.js'
import { GasEstimation } from 'components/GasEstimation'
import { InfoSection } from 'components/infoSection/InfoSection'
import { AutoBSFormChange } from 'features/automation/common/state/autoBSFormChange'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface CancelAutoBSInfoSectionProps {
  collateralizationRatio: BigNumber
  liquidationPrice: BigNumber
  debt: BigNumber
  title: string
  autoBSState: AutoBSFormChange
}

export function CancelAutoBSInfoSection({
  collateralizationRatio,
  liquidationPrice,
  debt,
  title,
  autoBSState,
}: CancelAutoBSInfoSectionProps) {
  const { t } = useTranslation()
  const isDebtZero = debt.isZero()
  const readOnlyAutoBSEnabled = useFeatureToggle('ReadOnlyBasicBS')

  const liquidationPriceFormatted = formatAmount(liquidationPrice, 'USD')
  const collateralizationRatioFormatted = formatPercent(collateralizationRatio.times(100), {
    precision: 2,
  })
  const ratioToPerformSellFormatted = formatPercent(autoBSState.execCollRatio, { precision: 2 })
  const colRatioAfterSellFormatted = formatPercent(autoBSState.targetCollRatio, { precision: 2 })

  return (
    <InfoSection
      title={title}
      items={[
        ...(isDebtZero || readOnlyAutoBSEnabled
          ? [
              {
                label: t('auto-sell.target-col-ratio-each-sell'),
                value: colRatioAfterSellFormatted,
                secondaryValue: '0%',
              },
              {
                label: t('auto-sell.trigger-col-ratio-to-perfrom-sell'),
                value: ratioToPerformSellFormatted,
                secondaryValue: '0%',
              },
            ]
          : [
              {
                label: t('system.collateral-ratio'),
                value: collateralizationRatioFormatted,
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
