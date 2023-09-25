import BigNumber from 'bignumber.js'
import { GasEstimation } from 'components/GasEstimation'
import { InfoSection } from 'components/infoSection/InfoSection'
import { useAppConfig } from 'helpers/config'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface CancelAutoTakeProfitInfoSectionProps {
  positionRatio: BigNumber
  token: string
  triggerColPrice: BigNumber
  debt: BigNumber
}

export function CancelAutoTakeProfitInfoSection({
  positionRatio,
  token,
  triggerColPrice,
  debt,
}: CancelAutoTakeProfitInfoSectionProps) {
  const { t } = useTranslation()
  const { ReadOnlyAutoTakeProfit: readOnlyAutoTakeProfitEnabled } = useAppConfig('features')

  const isDebtZero = debt.isZero()

  return (
    <InfoSection
      title={t('constant-multiple.vault-changes.general-summary')}
      items={[
        ...(isDebtZero || readOnlyAutoTakeProfitEnabled
          ? [
              {
                label: t('auto-take-profit.vault-changes.trigger-col-price', { token }),
                value: `$${formatAmount(triggerColPrice, 'USD')}`,
                change: 'n/a',
              },
            ]
          : [
              {
                label: t('auto-take-profit.vault-changes.trigger-col-price', { token }),
                value: `$${formatAmount(triggerColPrice, 'USD')}`,
                change: 'n/a',
              },
              {
                label: t('system.collateral-ratio'),
                value: formatPercent(positionRatio, {
                  precision: 2,
                  roundMode: BigNumber.ROUND_DOWN,
                }),
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
