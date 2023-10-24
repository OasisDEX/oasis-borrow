import type { AjnaEarnPosition } from '@oasisdex/dma-library'
import { GasEstimation } from 'components/GasEstimation'
import { InfoSection } from 'components/infoSection/InfoSection'
import type { AjnaIsCachedPosition } from 'features/ajna/common/types'
import { resolveIfCachedPosition } from 'features/ajna/positions/common/helpers/resolveIfCachedPosition'
import { useOmniGeneralContext } from 'features/omni-kit/contexts/OmniGeneralContext'
import { useOmniProductContext } from 'features/omni-kit/contexts/OmniProductContext'
import { OmniProductType } from 'features/omni-kit/types'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'

export const AjnaOmniClaimCollateralFormOrderInformation: FC<AjnaIsCachedPosition> = ({
  cached = false,
}) => {
  const { t } = useTranslation()
  const {
    environment: { quoteToken, collateralToken },
    tx: { txDetails, isTxSuccess },
  } = useOmniGeneralContext()
  const {
    position: { currentPosition, cachedPosition, isSimulationLoading },
  } = useOmniProductContext(OmniProductType.Earn)

  const { positionData, simulationData } = resolveIfCachedPosition({
    cached,
    cachedPosition,
    currentPosition,
  })

  const isLoading = !cached && isSimulationLoading
  const formatted = {
    totalDeposited: `${formatCryptoBalance(
      (positionData as AjnaEarnPosition).collateralTokenAmount.times(
        (positionData as AjnaEarnPosition).price,
      ),
    )} ${quoteToken}`,
    availableToWithdraw: `${formatCryptoBalance(
      (positionData as AjnaEarnPosition).collateralTokenAmount,
    )} ${collateralToken}`,
    afterAvailableToWithdraw:
      simulationData &&
      `${formatCryptoBalance(
        (simulationData as AjnaEarnPosition).collateralTokenAmount,
      )} ${collateralToken}`,
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
