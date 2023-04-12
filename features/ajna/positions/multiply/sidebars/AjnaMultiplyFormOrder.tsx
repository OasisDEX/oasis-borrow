import BigNumber from 'bignumber.js'
import { InfoSection } from 'components/infoSection/InfoSection'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaMultiplyFormOrder({ cached = false }: { cached?: boolean }) {
  const { t } = useTranslation()
  const {
    environment: { collateralToken },
  } = useAjnaGeneralContext()
  const {
    position: { isSimulationLoading },
  } = useAjnaProductContext('multiply')

  const isLoading = !cached && isSimulationLoading
  const formatted = {
    totalExposure: `${new BigNumber(22461.32)} ${collateralToken}`,
    afterTotalExposure: `${new BigNumber(28436.37)} ${collateralToken}`,
  }

  return (
    <InfoSection
      title={t('vault-changes.order-information')}
      items={[
        {
          label: t('system.total-exposure', { token: collateralToken }),
          value: formatted.totalExposure,
          secondaryValue: formatted.afterTotalExposure,
          isLoading,
        },
      ]}
    />
  )
}
