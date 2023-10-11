import { negativeToZero, normalizeValue } from '@oasisdex/dma-library'
import { GasEstimation } from 'components/GasEstimation'
import { InfoSection } from 'components/infoSection/InfoSection'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { useProtocolGeneralContext } from 'features/ajna/positions/common/contexts/ProtocolGeneralContext'
import { getOriginationFee } from 'features/ajna/positions/common/helpers/getOriginationFee'
import { resolveIfCachedPosition } from 'features/ajna/positions/common/helpers/resolveIfCachedPosition'
import {
  formatAmount,
  formatCryptoBalance,
  formatDecimalAsPercent,
} from 'helpers/formatters/format'
import { one, zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaBorrowFormOrder({ cached = false }: { cached?: boolean }) {
  const { t } = useTranslation()
  const {
    environment: { collateralToken, isOracless, isShort, priceFormat, quoteToken },
    steps: { isFlowStateReady },
    tx: { isTxSuccess, txDetails },
  } = useProtocolGeneralContext()
  const {
    position: { cachedPosition, currentPosition, isSimulationLoading },
  } = useAjnaProductContext('borrow')

  const { positionData, simulationData } = resolveIfCachedPosition({
    cached,
    cachedPosition,
    currentPosition,
  })

  const originationFee = getOriginationFee(positionData, simulationData)

  const liquidationPrice = isShort
    ? normalizeValue(one.div(positionData.liquidationPrice))
    : positionData.liquidationPrice
  const afterLiquidationPrice =
    simulationData?.liquidationPrice &&
    (isShort
      ? normalizeValue(one.div(simulationData.liquidationPrice))
      : simulationData.liquidationPrice)

  const isLoading = !cached && isSimulationLoading
  const formatted = {
    collateralLocked: `${formatCryptoBalance(positionData.collateralAmount)} ${collateralToken}`,
    afterCollateralLocked:
      simulationData?.collateralAmount &&
      `${formatCryptoBalance(simulationData.collateralAmount)} ${collateralToken}`,
    ltv: formatDecimalAsPercent(positionData.riskRatio.loanToValue),
    afterLtv:
      simulationData?.riskRatio && formatDecimalAsPercent(simulationData.riskRatio.loanToValue),
    liquidationPrice: `${formatCryptoBalance(liquidationPrice)} ${priceFormat}`,
    afterLiquidationPrice:
      afterLiquidationPrice && `${formatCryptoBalance(afterLiquidationPrice)} ${priceFormat}`,
    dynamicMaxLtv: formatDecimalAsPercent(positionData.maxRiskRatio.loanToValue),
    afterDynamicMaxLtv:
      simulationData?.maxRiskRatio.loanToValue &&
      formatDecimalAsPercent(simulationData.maxRiskRatio.loanToValue),
    debt: `${formatCryptoBalance(positionData.debtAmount)} ${quoteToken}`,
    afterDebt:
      simulationData?.debtAmount &&
      `${formatCryptoBalance(simulationData.debtAmount.plus(originationFee))} ${quoteToken}`,
    availableToWithdraw: `${formatCryptoBalance(
      positionData.collateralAvailable,
    )} ${collateralToken}`,
    afterAvailableToWithdraw:
      simulationData?.collateralAvailable &&
      `${formatCryptoBalance(simulationData.collateralAvailable)} ${collateralToken}`,
    availableToBorrow: `${formatCryptoBalance(positionData.debtAvailable())} ${quoteToken}`,
    afterAvailableToBorrow:
      simulationData &&
      `${formatCryptoBalance(
        negativeToZero(simulationData.debtAvailable().minus(originationFee)),
      )} ${quoteToken}`,
    totalCost: txDetails?.txCost ? `$${formatAmount(txDetails.txCost, 'USD')}` : '-',
  }

  return (
    <InfoSection
      title={t('vault-changes.order-information')}
      items={[
        {
          label: t('system.collateral-locked'),
          value: formatted.collateralLocked,
          change: formatted.afterCollateralLocked,
          isLoading,
        },
        ...(!isOracless
          ? [
              {
                label: t('vault-changes.ltv'),
                value: formatted.ltv,
                change: formatted.afterLtv,
                isLoading,
              },
            ]
          : []),
        {
          label: t('system.liquidation-price'),
          value: formatted.liquidationPrice,
          change: formatted.afterLiquidationPrice,
          isLoading,
        },
        ...(!isOracless && positionData.pool.lowestUtilizedPriceIndex.gt(zero)
          ? [
              {
                label: t('system.dynamic-max-ltv'),
                value: formatted.dynamicMaxLtv,
                change: formatted.afterDynamicMaxLtv,
                isLoading,
              },
            ]
          : []),
        {
          label: t('system.debt'),
          value: formatted.debt,
          change: formatted.afterDebt,
          isLoading,
        },
        {
          label: t('system.available-to-withdraw'),
          value: formatted.availableToWithdraw,
          change: formatted.afterAvailableToWithdraw,
          isLoading,
        },
        {
          label: t('system.available-to-borrow'),
          value: formatted.availableToBorrow,
          change: formatted.afterAvailableToBorrow,
          isLoading,
        },
        ...(isTxSuccess && cached
          ? [
              {
                label: t('system.total-cost'),
                value: formatted.totalCost,
                isLoading,
              },
            ]
          : isFlowStateReady
          ? [
              {
                label: t('system.max-transaction-cost'),
                value: <GasEstimation />,
                isLoading,
              },
            ]
          : []),
      ]}
    />
  )
}
