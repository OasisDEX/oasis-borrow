import { useAutomationContext } from 'components/context/AutomationContextProvider'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { sidebarAutomationFeatureCopyMap } from 'features/automation/common/consts'
import { AutomationFeatures } from 'features/automation/common/types'
import { CancelAutoTakeProfitInfoSection } from 'features/automation/optimization/autoTakeProfit/controls/CancelAutoTakeProfitInfoSection'
import type { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import type { VaultWarningMessage } from 'features/form/warningMessagesHandler'
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
        {t('automation.cancel-summary-description', {
          feature: t(sidebarAutomationFeatureCopyMap[AutomationFeatures.AUTO_TAKE_PROFIT]),
        })}
      </Text>
      <VaultErrors errorMessages={errors} ilkData={{ debtFloor, token }} />
      <VaultWarnings warningMessages={warnings} ilkData={{ debtFloor }} />
      <AutoTakeProfitInfoSectionControl />
    </>
  )
}

function AutoTakeProfitInfoSectionControl() {
  const {
    positionData: { token, debt, positionRatio },
    triggerData: { autoTakeProfitTriggerData },
  } = useAutomationContext()

  return (
    <CancelAutoTakeProfitInfoSection
      positionRatio={positionRatio.times(100)}
      token={token}
      debt={debt}
      triggerColPrice={autoTakeProfitTriggerData.executionPrice}
    />
  )
}
