import { useAutomationContext } from 'components/AutomationContextProvider'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { CancelAutoTakeProfitInfoSection } from 'features/automation/optimization/autoTakeProfit/controls/CancelAutoTakeProfitInfoSection'
import { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'

interface SidebarAutoTakeProfitRemovalEditingStageProps {
  errors: VaultErrorMessage[]
  warnings: VaultWarningMessage[]
}

export function SidebarAutoTakeProfitRemovalEditingStage({
  errors,
  warnings,
}: SidebarAutoTakeProfitRemovalEditingStageProps) {
  const { t } = useTranslation()
  const {
    positionData: { debtFloor, token },
  } = useAutomationContext()

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('auto-take-profit.cancel-instructions')}
      </Text>
      <VaultErrors errorMessages={errors} ilkData={{ debtFloor, token }} />
      <VaultWarnings warningMessages={warnings} ilkData={{ debtFloor }} />
      <AutoTakeProfitInfoSectionControl />
    </>
  )
}

function AutoTakeProfitInfoSectionControl() {
  const {
    autoTakeProfitTriggerData,
    positionData: { token, debt, collateralizationRatio },
  } = useAutomationContext()

  return (
    <CancelAutoTakeProfitInfoSection
      collateralizationRatio={collateralizationRatio.times(100)}
      token={token}
      debt={debt}
      triggerColPrice={autoTakeProfitTriggerData.executionPrice}
    />
  )
}
