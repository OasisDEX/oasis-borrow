import { GasEstimation } from 'components/GasEstimation'
import { InfoSection } from 'components/infoSection/InfoSection'
import type { AjnaIsCachedPosition } from 'features/ajna/common/types'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { resolveIfCachedPosition } from 'features/ajna/positions/common/helpers/resolveIfCachedPosition'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'

export const AjnaClaimCollateralFormOrderInformation: FC<AjnaIsCachedPosition> = ({
  cached = false,
}) => {
  const { t } = useTranslation()
  const {
    environment: { quoteToken, collateralToken },
    tx: { txDetails, isTxSuccess },
  } = useAjnaGeneralContext()
  const {
    position: { currentPosition, cachedPosition, isSimulationLoading },
  } = useAjnaProductContext('earn')

  const { positionData, simulationData } = resolveIfCachedPosition({
    cached,
    cachedPosition,
    currentPosition,
  })

  const isLoading = !cached && isSimulationLoading
  const formatted = {
    totalDeposited: `${formatCryptoBalance(
      positionData.collateralTokenAmount.times(positionData.price),
    )} ${quoteToken}`,
    availableToWithdraw: `${formatCryptoBalance(
      positionData.collateralTokenAmount,
    )} ${collateralToken}`,
    afterAvailableToWithdraw:
      simulationData &&
      `${formatCryptoBalance(simulationData.collateralTokenAmount)} ${collateralToken}`,
    totalCost: txDetails?.txCost ? `$${formatAmount(txDetails.txCost, 'USD')}` : '-',
  }

  return (
    <InfoSection
      title={t('vault-changes.order-information')}
      items={[
        {
          label: t('ajna.position-page.earn.common.form.total-deposited-into-position'),
          value: formatted.totalDeposited,
        },
        {
          label: t('ajna.position-page.earn.common.form.collateral-available-to-withdraw'),
          value: formatted.availableToWithdraw,
        },
        ...(isTxSuccess && cached
          ? [
              {
                label: t('system.total-cost'),
                value: formatted.totalCost,
                isLoading,
              },
            ]
          : [
              {
                label: t('system.max-transaction-cost'),
                value: <GasEstimation />,
                isLoading,
              },
            ]),
      ]}
    />
  )
}
