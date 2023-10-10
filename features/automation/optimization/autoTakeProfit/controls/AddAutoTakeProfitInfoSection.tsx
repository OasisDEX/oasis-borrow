import type BigNumber from 'bignumber.js'
import { GasEstimation } from 'components/GasEstimation'
import { InfoSection } from 'components/infoSection/InfoSection'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface AddAutoTakeProfitInfoSectionProps {
  debtRepaid: BigNumber
  estimatedGasFeeOnTrigger?: BigNumber
  estimatedOasisFeeOnTrigger: BigNumber
  token: string
  totalTriggerCost?: BigNumber
  triggerColPrice: BigNumber
  triggerColRatio: BigNumber
}

export function AddAutoTakeProfitInfoSection({
  debtRepaid,
  estimatedGasFeeOnTrigger,
  estimatedOasisFeeOnTrigger,
  token,
  totalTriggerCost,
  triggerColPrice,
  triggerColRatio,
}: AddAutoTakeProfitInfoSectionProps) {
  const { t } = useTranslation()

  return (
    <InfoSection
      title={t('auto-take-profit.vault-changes.general-summary')}
      items={[
        {
          label: t('auto-take-profit.vault-changes.trigger-col-price', { token }),
          value: `$${formatAmount(triggerColPrice, 'USD')}`,
        },
        {
          label: t('auto-take-profit.vault-changes.trigger-collateral-ratio'),
          value: `${formatPercent(triggerColRatio, { precision: 2 })}`,
        },
        {
          label: t('auto-take-profit.vault-changes.debt-repaid'),
          value: `${formatAmount(debtRepaid, 'DAI')} DAI`,
        },
        {
          label: t('auto-take-profit.vault-changes.total-transaction-cost'),
          value: totalTriggerCost && `$${formatAmount(totalTriggerCost, 'USD')}`,
          isLoading: totalTriggerCost === undefined,
          dropdownValues: [
            {
              label: t('auto-take-profit.vault-changes.estimated-oasis-fee'),
              value: `$${formatAmount(estimatedOasisFeeOnTrigger, 'USD')}`,
            },
            {
              label: t('auto-take-profit.vault-changes.estimated-gas-fee'),
              value:
                estimatedGasFeeOnTrigger && `$${formatAmount(estimatedGasFeeOnTrigger, 'USD')}`,
            },
          ],
        },
        {
          label: t('auto-take-profit.vault-changes.setup-transaction-cost'),
          value: <GasEstimation />,
        },
      ]}
    />
  )
}
