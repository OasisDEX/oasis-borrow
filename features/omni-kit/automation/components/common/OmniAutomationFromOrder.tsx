import { InfoSection } from 'components/infoSection/InfoSection'
import { MessageCard } from 'components/MessageCard'
import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { AutomationFeatures } from 'features/automation/common/types'
import { OmniAutomationNotGuaranteedInfo } from 'features/omni-kit/automation/components/common/OmniAutomationNotGuaranteedInfo'
import { OmniDoubleStopLossWarning } from 'features/omni-kit/automation/components/common/OmniDoubleStopLossWarning'
import { OmniGasEstimation } from 'features/omni-kit/components/sidebars'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { formatUsdValue } from 'helpers/formatters/format'
import { useHash } from 'helpers/useHash'
import { useTranslation } from 'next-i18next'
import React from 'react'

export const OmniAutomationFromOrder = () => {
  const { t } = useTranslation()
  const {
    environment: { productType },
    tx: { isTxSuccess, txDetails },
  } = useOmniGeneralContext()
  const {
    automation: { isSimulationLoading, commonForm, automationForms, simulationData },
    dynamicMetadata: {
      values: { automation },
    },
  } = useOmniProductContext(productType)
  const [hash] = useHash()

  const isProtection = hash === 'protection'

  const formatted = {
    totalCost: txDetails?.txCost ? formatUsdValue(txDetails.txCost) : '-',
  }

  const isLoading = !isTxSuccess && isSimulationLoading

  const activeUiDropdown = isProtection
    ? commonForm.state.uiDropdownProtection || AutomationFeatures.TRAILING_STOP_LOSS
    : commonForm.state.uiDropdownOptimization || AutomationFeatures.PARTIAL_TAKE_PROFIT

  const currentAutomationForm = automationForms[activeUiDropdown as `${AutomationFeatures}`]

  const errors = simulationData?.errors?.map((item) => t(`vault-warnings.${item.code}`)) || []
  const warnings = simulationData?.warnings?.map((item) => t(`vault-warnings.${item.code}`)) || []

  return (
    <>
      <SidebarResetButton
        clear={() => {
          currentAutomationForm.dispatch({ type: 'reset' })
        }}
      />
      <MessageCard messages={errors} type="error" withBullet={errors.length > 1} />
      <MessageCard messages={warnings} type="warning" withBullet={warnings.length > 1} />
      {activeUiDropdown === AutomationFeatures.TRAILING_STOP_LOSS && (
        <OmniDoubleStopLossWarning
          hasStopLoss={automation?.flags.isStopLossEnabled}
          onClick={() => {
            commonForm.updateState('uiDropdownProtection', AutomationFeatures.STOP_LOSS)
          }}
        />
      )}
      {activeUiDropdown === AutomationFeatures.STOP_LOSS && (
        <OmniDoubleStopLossWarning
          hasTrailingStopLoss={automation?.flags.isTrailingStopLossEnabled}
          onClick={() => {
            commonForm.updateState('uiDropdownProtection', AutomationFeatures.TRAILING_STOP_LOSS)
          }}
        />
      )}
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
      <OmniAutomationNotGuaranteedInfo />
    </>
  )
}
