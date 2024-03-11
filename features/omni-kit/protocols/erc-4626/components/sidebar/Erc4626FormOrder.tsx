import { InfoSection } from 'components/infoSection/InfoSection'
import { OmniGasEstimation } from 'features/omni-kit/components/sidebars'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { OmniProductType } from 'features/omni-kit/types'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'

export const Erc4626FormOrder: FC = () => {
  const { t } = useTranslation()

  const {
    environment: { quoteToken },
    steps: { isFlowStateReady },
    tx: { isTxSuccess },
  } = useOmniGeneralContext()
  const {
    position: { isSimulationLoading },
  } = useOmniProductContext(OmniProductType.Earn)

  const isLoading = !isTxSuccess && isSimulationLoading
  const formatted = {
    totalDeposit: `${formatCryptoBalance(zero)} ${quoteToken}`,
    afterTotalDeposit: `${formatCryptoBalance(zero)} ${quoteToken}`,
    totalCost: formatCryptoBalance(zero),
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
