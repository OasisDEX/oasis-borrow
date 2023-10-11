import { useAutomationContext } from 'components/context/AutomationContextProvider'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { sidebarAutomationFeatureCopyMap } from 'features/automation/common/consts'
import { CancelAutoBSInfoSection } from 'features/automation/common/sidebars/CancelAutoBSInfoSection'
import { AutomationFeatures } from 'features/automation/common/types'
import type { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import type { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'

interface SidebarAutoBuyRemovalEditingStageProps {
  errors: VaultErrorMessage[]
  warnings: VaultWarningMessage[]
}

export function SidebarAutoBuyRemovalEditingStage({
  errors,
  warnings,
}: SidebarAutoBuyRemovalEditingStageProps) {
  const {
    positionData: { debtFloor, token },
  } = useAutomationContext()
  const { t } = useTranslation()

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('automation.cancel-summary-description', {
          feature: t(sidebarAutomationFeatureCopyMap[AutomationFeatures.AUTO_BUY]),
        })}
      </Text>
      <VaultErrors errorMessages={errors} ilkData={{ debtFloor, token }} />
      <VaultWarnings warningMessages={warnings} ilkData={{ debtFloor }} />
      <AutoBuyInfoSectionControl />
    </>
  )
}

function AutoBuyInfoSectionControl() {
  const { t } = useTranslation()
  const {
    positionData: { positionRatio, liquidationPrice, debt },
    triggerData: { autoBuyTriggerData },
  } = useAutomationContext()

  return (
    <CancelAutoBSInfoSection
      positionRatio={positionRatio}
      liquidationPrice={liquidationPrice}
      title={t('auto-buy.cancel-summary-title')}
      targetLabel={t('auto-buy.target-col-ratio-each-buy')}
      triggerLabel={t('auto-buy.trigger-col-ratio-to-perform-buy')}
      autoBSTriggerData={autoBuyTriggerData}
      debt={debt}
    />
  )
}
