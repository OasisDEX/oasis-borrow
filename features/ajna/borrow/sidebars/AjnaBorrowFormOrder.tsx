import { GasEstimation } from 'components/GasEstimation'
import { InfoSection } from 'components/infoSection/InfoSection'
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaBorrowFormOrder() {
  const { t } = useTranslation()

  const {
    environment: { collateralToken, quoteToken },
    position: { currentPosition, simulation },
  } = useAjnaBorrowContext()

  const collateralLocked = currentPosition?.collateralAmount || zero
  const debtAmount = currentPosition?.debtAmount || zero
  const ltv = currentPosition?.riskRatio.loanToValue || zero

  const formatted = {
    collateralLocked: formatCryptoBalance(collateralLocked),
    debt: formatCryptoBalance(debtAmount),
    ltv: formatDecimalAsPercent(ltv),
    afterLtv: formatDecimalAsPercent(simulation?.riskRatio.loanToValue || zero),
    afterDebt: formatCryptoBalance(simulation?.debtAmount || zero),
    afterCollateralLocked: formatCryptoBalance(simulation?.collateralAmount || zero),
  }

  return (
    <InfoSection
      title={t('vault-changes.order-information')}
      items={[
        {
          label: t('system.collateral-locked'),
          value: `${formatted.collateralLocked} ${collateralToken}`,
          secondaryValue: `${formatted.afterCollateralLocked} ${collateralToken}`,
        },
        {
          label: t('vault-changes.ltv'),
          value: formatted.ltv,
          secondaryValue: formatted.afterLtv,
        },
        {
          label: t('system.liquidation-price'),
          value: '0.00 USDC/ETH',
          secondaryValue: '1,300.00 USDC/ETH',
        },
        {
          label: t('system.debt'),
          value: `${formatted.debt} ${quoteToken}`,
          secondaryValue: `${formatted.afterDebt} ${quoteToken}`,
        },
        {
          label: t('system.available-to-withdraw'),
          value: '0.00 ETH',
          secondaryValue: '5.00 ETH',
        },
        {
          label: t('system.available-to-generate'),
          value: '0 USDC',
          secondaryValue: '10,000.00 USDC',
        },
        {
          label: t('transaction-fee'),
          value: <GasEstimation />,
        },
      ]}
    />
  )
}
