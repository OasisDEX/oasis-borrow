import { InfoSection } from 'components/infoSection/InfoSection'
import { OmniGasEstimation } from 'features/omni-kit/components/sidebars'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { resolveIfCachedPosition } from 'features/omni-kit/protocols/ajna/helpers'
import { OmniProductType } from 'features/omni-kit/types'
import { formatCryptoBalance, formatUsdValue } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'

export const Erc4626FormOrder: FC = () => {
  const { t } = useTranslation()

  const {
    environment: { quoteToken },
    steps: { isFlowStateReady },
    tx: { isTxSuccess, txDetails },
  } = useOmniGeneralContext()
  const {
    position: { cachedPosition, currentPosition, isSimulationLoading },
  } = useOmniProductContext(OmniProductType.Earn)

  const { positionData, simulationData } = resolveIfCachedPosition({
    cached: isTxSuccess,
    cachedPosition,
    currentPosition,
  })

  const isLoading = !isTxSuccess && isSimulationLoading
  const formatted = {
    totalDeposit: `${formatCryptoBalance(positionData.quoteTokenAmount)} ${quoteToken}`,
    afterTotalDeposit:
      simulationData?.quoteTokenAmount &&
      `${formatCryptoBalance(simulationData.quoteTokenAmount)} ${quoteToken}`,
    totalCost: txDetails?.txCost ? formatUsdValue(txDetails.txCost) : '-',
  }

  return (
    <InfoSection
      title={t('vault-changes.order-information')}
      items={[
        {
          label: t('erc-4626.position-page.earn.form-order.total-deposit', { quoteToken }),
          value: formatted.totalDeposit,
          change: formatted.afterTotalDeposit,
          isLoading,
        },
        ...(isTxSuccess
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
                value: <OmniGasEstimation />,
                isLoading,
              },
            ]
          : []),
      ]}
    />
  )
}
