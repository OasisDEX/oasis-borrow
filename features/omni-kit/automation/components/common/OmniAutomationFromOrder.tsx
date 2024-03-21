import { InfoSection } from 'components/infoSection/InfoSection'
import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { mapErrorsToErrorVaults, mapWarningsToWarningVaults } from 'features/aave/helpers'
import { AutomationFeatures } from 'features/automation/common/types'
import { OmniAutomationNotGuaranteedInfo } from 'features/omni-kit/automation/components/common/OmniAutomationNotGuaranteedInfo'
import { OmniDoubleStopLossWarning } from 'features/omni-kit/automation/components/common/OmniDoubleStopLossWarning'
import { useOmniAutomationOrderInformationItems } from 'features/omni-kit/automation/hooks'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'

interface OmniAutomationFromOrderProps {
  showReset?: boolean
  showDisclaimer?: boolean
  showValidation?: boolean
}

export const OmniAutomationFromOrder: FC<OmniAutomationFromOrderProps> = ({
  showReset = true,
  showDisclaimer = true,
  showValidation = true,
}) => {
  const { t } = useTranslation()
  const {
    environment: { productType },
  } = useOmniGeneralContext()
  const {
    automation: { commonForm, simulationData },
    dynamicMetadata: {
      values: { automation },
    },
  } = useOmniProductContext(productType)

  const items = useOmniAutomationOrderInformationItems()

  if (!automation) {
    throw new Error('Automation dynamic metadata not available')
  }

  const { activeForm, activeUiDropdown } = automation.resolved

  return (
    <>
      {showReset && (
        <SidebarResetButton
          clear={() => {
            activeForm.dispatch({ type: 'reset' })
          }}
        />
      )}
      {showValidation && (
        <>
          <VaultErrors errorMessages={mapErrorsToErrorVaults(simulationData?.errors)} />
          <VaultWarnings warningMessages={mapWarningsToWarningVaults(simulationData?.warnings)} />
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
                commonForm.updateState(
                  'uiDropdownProtection',
                  AutomationFeatures.TRAILING_STOP_LOSS,
                )
              }}
            />
          )}
        </>
      )}
      <InfoSection title={t('vault-changes.order-information')} items={items} />
      {showDisclaimer && <OmniAutomationNotGuaranteedInfo />}
    </>
  )
}
