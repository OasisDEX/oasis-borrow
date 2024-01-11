import type { AjnaEarnPosition } from '@oasisdex/dma-library'
import { InfoSection } from 'components/infoSection/InfoSection'
import { OmniGasEstimation } from 'features/omni-kit/components/sidebars'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { resolveIfCachedPosition } from 'features/omni-kit/protocols/ajna/helpers'
import { OmniProductType } from 'features/omni-kit/types'
import { formatCryptoBalance, formatUsdValue } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'

export const AjnaClaimCollateralFormOrderInformation: FC = () => {
  const { t } = useTranslation()
  const {
    environment: { quoteToken, collateralToken },
    tx: { txDetails, isTxSuccess },
  } = useOmniGeneralContext()
  const {
    position: { currentPosition, cachedPosition, isSimulationLoading },
  } = useOmniProductContext(OmniProductType.Earn)

  const { positionData, simulationData } = resolveIfCachedPosition({
    cached: isTxSuccess,
    cachedPosition,
    currentPosition,
  })

  const isLoading = !isTxSuccess && isSimulationLoading
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
    totalCost: txDetails?.txCost ? formatUsdValue(txDetails.txCost) : '-',
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
        ...(isTxSuccess
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
                value: <OmniGasEstimation />,
                isLoading,
              },
            ]),
      ]}
    />
  )
}
