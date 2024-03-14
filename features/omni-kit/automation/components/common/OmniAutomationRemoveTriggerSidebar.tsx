import { InfoSection } from 'components/infoSection/InfoSection'
import { sidebarAutomationFeatureCopyMap } from 'features/automation/common/consts'
import { OmniGasEstimation } from 'features/omni-kit/components/sidebars'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { formatUsdValue } from 'helpers/formatters/format'
import { useHash } from 'helpers/useHash'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { Grid, Text } from 'theme-ui'

export const OmniAutomationRemoveTriggerSidebar: FC = ({ children }) => {
  const { t } = useTranslation()
  const {
    environment: { productType },
    tx: { isTxSuccess, txDetails },
  } = useOmniGeneralContext()
  const {
    automation: { isSimulationLoading, automationForm },
  } = useOmniProductContext(productType)

  const [hash] = useHash()

  const activeUiDropdown =
    hash === 'protection'
      ? automationForm.state.uiDropdownProtection
      : automationForm.state.uiDropdownOptimization

  if (!activeUiDropdown) {
    return null
  }

  const formatted = {
    totalCost: txDetails?.txCost ? formatUsdValue(txDetails.txCost) : '-',
  }

  const isLoading = !isTxSuccess && isSimulationLoading

  return (
    <Grid gap={3}>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('automation.cancel-summary-description', {
          feature: t(sidebarAutomationFeatureCopyMap[activeUiDropdown]),
        })}
      </Text>
      {children}
      <InfoSection
        title={t('vault-changes.order-information')}
        items={[
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
                  label: t('max-gas-fee'),
                  value: <OmniGasEstimation />,
                  isLoading,
                },
              ]),
        ]}
      />
    </Grid>
  )
}
