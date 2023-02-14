import { GasEstimation } from 'components/GasEstimation'
import { InfoSection } from 'components/infoSection/InfoSection'
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import {
  formatAmount,
  formatCryptoBalance,
  formatDecimalAsPercent,
} from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaBorrowFormOrder() {
  const { t } = useTranslation()

  const {
    environment: { collateralToken, quoteToken },
    position: { currentPosition, simulation },
  } = useAjnaBorrowContext()

  const isLoading = simulation === undefined
  const formatted = {
    collateralLocked: formatCryptoBalance(currentPosition.collateralAmount),
    debt: formatCryptoBalance(currentPosition.debtAmount),
    ltv: formatDecimalAsPercent(currentPosition.riskRatio.loanToValue),
    liquidationPrice: formatCryptoBalance(currentPosition.liquidationPrice),
    availableToBorrow: formatAmount(currentPosition.debtAvailable, quoteToken),
    availableToWithdraw: formatAmount(currentPosition.collateralAvailable, collateralToken),
    afterLiquidationPrice:
      simulation?.position.liquidationPrice &&
      formatCryptoBalance(simulation?.position.liquidationPrice),
    afterLtv:
      simulation?.position.riskRatio &&
      formatDecimalAsPercent(simulation?.position.riskRatio.loanToValue),
    afterDebt:
      simulation?.position.debtAmount && formatCryptoBalance(simulation?.position.debtAmount),
    afterCollateralLocked:
      simulation?.position.collateralAmount &&
      formatCryptoBalance(simulation?.position.collateralAmount),
    afterAvailableToBorrow:
      simulation?.position.debtAvailable &&
      formatAmount(simulation?.position.debtAvailable, quoteToken),
    afterAvailableToWithdraw:
      simulation?.position.collateralAvailable &&
      formatAmount(simulation?.position.collateralAvailable, collateralToken),
  }

  return (
    <InfoSection
      title={t('vault-changes.order-information')}
      items={[
        {
          label: t('system.collateral-locked'),
          value: `${formatted.collateralLocked} ${collateralToken}`,
          secondaryValue: `${formatted.afterCollateralLocked} ${collateralToken}`,
          isLoading,
        },
        {
          label: t('vault-changes.ltv'),
          value: formatted.ltv,
          secondaryValue: formatted.afterLtv,
          isLoading,
        },
        {
          label: t('system.liquidation-price'),
          value: `${formatted.liquidationPrice} ${quoteToken}/${collateralToken}`,
          secondaryValue: `${formatted.afterLiquidationPrice} ${quoteToken}/${collateralToken}`,
          isLoading,
        },
        {
          label: t('system.debt'),
          value: `${formatted.debt} ${quoteToken}`,
          secondaryValue: `${formatted.afterDebt} ${quoteToken}`,
          isLoading,
        },
        {
          label: t('system.available-to-withdraw'),
          value: `${formatted.availableToWithdraw} ${collateralToken}`,
          secondaryValue: `${formatted.afterAvailableToWithdraw} ${collateralToken}`,
          isLoading,
        },
        {
          label: t('system.available-to-generate'),
          value: `${formatted.availableToBorrow} ${quoteToken}`,
          secondaryValue: `${formatted.afterAvailableToBorrow} ${quoteToken}`,
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
