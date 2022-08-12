import BigNumber from 'bignumber.js'
import { GasEstimation } from 'components/GasEstimation'
import { InfoSection } from 'components/infoSection/InfoSection'
import { ConstantMultipleFormChange } from 'features/automation/protection/common/UITypes/constantMultipleFormChange'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface CancelConstantMultipleInfoSectionProps {
  collateralizationRatio: BigNumber
  constantMultipleState: ConstantMultipleFormChange
  debt: BigNumber
  liquidationPrice: BigNumber
}

export function CancelConstantMultipleInfoSection({
  collateralizationRatio,
  constantMultipleState,
  debt,
  liquidationPrice,
}: CancelConstantMultipleInfoSectionProps) {
  const { t } = useTranslation()

  return (
    <InfoSection
      title={t('constant-multiple.vault-changes.general-summary')}
      items={[
        ...(debt.isZero()
          ? [
              {
                label: t('constant-multiple.vault-changes.target-col-ratio-after-buy-sell'),
                value: `${constantMultipleState.targetCollRatio}$`,
                secondaryValue: '0%',
              },
              {
                label: t('auto-buy.trigger-col-ratio-to-perfrom-buy'),
                value: `${constantMultipleState.buyExecutionCollRatio}%`,
                secondaryValue: '0%',
              },
              {
                label: t('auto-sell.trigger-col-ratio-to-perfrom-sell'),
                value: `${constantMultipleState.sellExecutionCollRatio}$`,
                secondaryValue: '0%',
              },
            ]
          : [
              {
                label: t('system.collateral-ratio'),
                value: formatPercent(collateralizationRatio.times(100), {
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
