import { GasEstimation } from 'components/GasEstimation'
import { InfoSection } from 'components/infoSection/InfoSection'
import { useAjnaGeneralContext } from 'features/ajna/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/common/contexts/AjnaProductContext'
import { resolveIfCachedPosition } from 'features/ajna/common/helpers/resolveIfCachedPosition'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaEarnFormOrder({ cached = false }: { cached?: boolean }) {
  const { t } = useTranslation()

  const {
    environment: { collateralToken, quoteToken },
  } = useAjnaGeneralContext()
  const {
    position: { cachedPosition, currentPosition },
  } = useAjnaProductContext('earn')

  const { positionData, simulationData } = resolveIfCachedPosition({
    cached,
    cachedPosition,
    currentPosition,
  })

  const isLoading = !cached && currentPosition.simulation === undefined
  const formatted = {
    amountToLend: formatCryptoBalance(positionData.collateralAmount),
    maxLtv: formatDecimalAsPercent(positionData.riskRatio.loanToValue),
    netApy: formatDecimalAsPercent(positionData.riskRatio.loanToValue),
    lendingPrice: formatCryptoBalance(positionData.liquidationPrice),
    afterAmountToLend:
      simulationData?.collateralAmount && formatCryptoBalance(simulationData.collateralAmount),
    afterNetApy:
      simulationData?.riskRatio && formatDecimalAsPercent(simulationData.riskRatio.loanToValue),
    afterMaxLtv:
      simulationData?.riskRatio && formatDecimalAsPercent(simulationData.riskRatio.loanToValue),
    afterLendingPrice:
      simulationData?.liquidationPrice && formatCryptoBalance(simulationData.liquidationPrice),
  }

  return (
    <InfoSection
      title={t('vault-changes.order-information')}
      items={[
        {
          label: t('amount-to-lend'),
          value: `${formatted.amountToLend} ${collateralToken}`,
          secondaryValue: `${formatted.afterAmountToLend} ${collateralToken}`,
          isLoading,
        },
        {
          label: t('net-apy'),
          value: formatted.netApy,
          secondaryValue: formatted.afterNetApy,
          isLoading,
        },
        {
          label: t('lending-price'),
          value: `${formatted.lendingPrice} ${collateralToken}/${quoteToken}`,
          secondaryValue: `${formatted.afterLendingPrice} ${collateralToken}/${quoteToken}`,
          isLoading,
        },
        {
          label: t('max-ltv-to-lend-at'),
          value: formatted.maxLtv,
          secondaryValue: formatted.afterMaxLtv,
          isLoading,
        },
        {
          label: t('system.max-transaction-cost'),
          value: <GasEstimation />,
        },
      ]}
    />
  )
}
