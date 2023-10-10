import { useAutomationContext } from 'components/context'
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

function AutoSellInfoSectionControl() {
  const { t } = useTranslation()
  const {
    positionData: { debt, positionRatio, liquidationPrice },
    triggerData: { autoSellTriggerData },
  } = useAutomationContext()

  return (
    <CancelAutoBSInfoSection
      positionRatio={positionRatio}
      liquidationPrice={liquidationPrice}
      debt={debt}
      title={t('auto-sell.cancel-summary-title')}
      targetLabel={t('auto-sell.target-col-ratio-each-sell')}
      triggerLabel={t('auto-sell.trigger-col-ratio-to-perfrom-sell')}
      autoBSTriggerData={autoSellTriggerData}
    />
  )
}

interface SidebarAutoSellCancelEditingStageProps {
  errors: VaultErrorMessage[]
  warnings: VaultWarningMessage[]
}

export function SidebarAutoSellCancelEditingStage({
  errors,
  warnings,
}: SidebarAutoSellCancelEditingStageProps) {
  const { t } = useTranslation()
  const {
    positionData: { debtFloor, token },
  } = useAutomationContext()

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('automation.cancel-summary-description', {
          feature: t(sidebarAutomationFeatureCopyMap[AutomationFeatures.AUTO_SELL]),
        })}
      </Text>
      <VaultErrors errorMessages={errors} ilkData={{ debtFloor, token }} />
      <VaultWarnings warningMessages={warnings} ilkData={{ debtFloor }} />
      <AutoSellInfoSectionControl />
    </>
  )
}
