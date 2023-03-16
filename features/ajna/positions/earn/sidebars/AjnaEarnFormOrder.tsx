import { GasEstimation } from 'components/GasEstimation'
import { InfoSection } from 'components/infoSection/InfoSection'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { resolveIfCachedPosition } from 'features/ajna/positions/common/helpers/resolveIfCachedPosition'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaEarnFormOrder({ cached = false }: { cached?: boolean }) {
  const { t } = useTranslation()

  const {
    environment: { collateralToken, quoteToken },
    tx: { txDetails, isTxSuccess },
  } = useAjnaGeneralContext()
  const {
    position: { cachedPosition, currentPosition, isSimulationLoading },
  } = useAjnaProductContext('earn')

  const { positionData, simulationData } = resolveIfCachedPosition({
    cached,
    cachedPosition,
    currentPosition,
  })

  const isLoading = !cached && isSimulationLoading
  const formatted = {
    amountToLend: formatCryptoBalance(positionData.quoteTokenAmount),
    // maxLtv: formatDecimalAsPercent(positionData.riskRatio.loanToValue),
    // netApy: formatDecimalAsPercent(positionData.riskRatio.loanToValue),
    lendingPrice: formatCryptoBalance(positionData.price),
    afterAmountToLend:
      simulationData?.quoteTokenAmount && formatCryptoBalance(simulationData.quoteTokenAmount),
    // afterNetApy:
    //   simulationData?.riskRatio && formatDecimalAsPercent(simulationData.riskRatio.loanToValue),
    // afterMaxLtv:
    //   simulationData?.riskRatio && formatDecimalAsPercent(simulationData.riskRatio.loanToValue),
    afterLendingPrice: simulationData?.price && formatCryptoBalance(simulationData.price),
    totalCost: txDetails?.txCost ? `$${formatAmount(txDetails.txCost, 'USD')}` : '-',
  }

  return (
    <InfoSection
      title={t('vault-changes.order-information')}
      items={[
        {
          label: t('amount-to-lend'),
          value: `${formatted.amountToLend} ${quoteToken}`,
          secondaryValue: `${formatted.afterAmountToLend} ${quoteToken}`,
          isLoading,
        },
        // {
        //   label: t('net-apy'),
        //   value: formatted.netApy,
        //   secondaryValue: formatted.afterNetApy,
        //   isLoading,
        // },
        {
          label: t('lending-price'),
          value: `${formatted.lendingPrice} ${collateralToken}/${quoteToken}`,
          secondaryValue: `${formatted.afterLendingPrice} ${collateralToken}/${quoteToken}`,
          isLoading,
        },
        // {
        //   label: t('max-ltv-to-lend-at'),
        //   value: formatted.maxLtv,
        //   secondaryValue: formatted.afterMaxLtv,
        //   isLoading,
        // },
        isTxSuccess && cached
          ? {
              label: t('system.total-cost'),
              value: formatted.totalCost,
              isLoading,
            }
          : {
              label: t('system.max-transaction-cost'),
              value: <GasEstimation />,
              isLoading,
            },
      ]}
    />
  )
}
