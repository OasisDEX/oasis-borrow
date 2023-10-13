import { useAutomationContext } from 'components/context/AutomationContextProvider'
import { GasEstimation } from 'components/GasEstimation'
import { InfoSection } from 'components/infoSection/InfoSection'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function CancelConstantMultipleInfoSection() {
  const { t } = useTranslation()
  const {
    positionData: { positionRatio, debt, liquidationPrice },
    triggerData: { constantMultipleTriggerData },
  } = useAutomationContext()

  return (
    <InfoSection
      title={t('constant-multiple.vault-changes.general-summary')}
      items={[
        ...(debt.isZero()
          ? [
              {
                label: t('constant-multiple.vault-changes.target-col-ratio-after-buy-sell'),
                value: `${constantMultipleTriggerData.targetCollRatio}%`,
                change: '0%',
              },
              {
                label: t('auto-buy.trigger-col-ratio-to-perform-buy'),
                value: `${constantMultipleTriggerData.buyExecutionCollRatio}%`,
                change: '0%',
              },
              {
                label: t('auto-sell.trigger-col-ratio-to-perfrom-sell'),
                value: `${constantMultipleTriggerData.sellExecutionCollRatio}%`,
                change: '0%',
              },
            ]
          : [
              {
                label: t('system.collateral-ratio'),
                value: formatPercent(positionRatio.times(100), {
                  precision: 2,
                }),
              },
              {
                label: t('system.liquidation-price'),
                value: `$${formatAmount(liquidationPrice, 'USD')}`,
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
