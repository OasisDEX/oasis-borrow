import { useAutomationContext } from 'components/context/AutomationContextProvider'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { sidebarAutomationFeatureCopyMap } from 'features/automation/common/consts'
import { AutomationFeatures } from 'features/automation/common/types'
import { CancelConstantMultipleInfoSection } from 'features/automation/optimization/constantMultiple/controls/CancelConstantMultipleInfoSection'
import type { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import type { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'

interface SidebarConstantMultipleRemovalEditingStageProps {
  errors: VaultErrorMessage[]
  warnings: VaultWarningMessage[]
}

export function SidebarConstantMultipleRemovalEditingStage({
  errors,
  warnings,
}: SidebarConstantMultipleRemovalEditingStageProps) {
  const { t } = useTranslation()
  const {
    positionData: { debtFloor, token },
  } = useAutomationContext()

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('automation.cancel-summary-description', {
          feature: t(sidebarAutomationFeatureCopyMap[AutomationFeatures.CONSTANT_MULTIPLE]),
        })}
      </Text>
      <VaultErrors errorMessages={errors} ilkData={{ debtFloor, token }} />
      <VaultWarnings warningMessages={warnings} ilkData={{ debtFloor }} />
      <CancelConstantMultipleInfoSection />
    </>
  )
}
