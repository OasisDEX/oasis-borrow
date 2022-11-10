import { useAutomationContext } from 'components/AutomationContextProvider'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { CancelAutoBSInfoSection } from 'features/automation/common/sidebars/CancelAutoBSInfoSection'
import { AutoBSFormChange } from 'features/automation/common/state/autoBSFormChange'
import { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'

interface AutoSellInfoSectionControlProps {
  autoSellState: AutoBSFormChange
}

function AutoSellInfoSectionControl({ autoSellState }: AutoSellInfoSectionControlProps) {
  const { t } = useTranslation()
  const {
    positionData: { debt, collateralizationRatio, liquidationPrice },
  } = useAutomationContext()

  return (
    <CancelAutoBSInfoSection
      collateralizationRatio={collateralizationRatio}
      liquidationPrice={liquidationPrice}
      debt={debt}
      title={t('auto-sell.cancel-summary-title')}
      targetLabel={t('auto-sell.target-col-ratio-each-sell')}
      triggerLabel={t('auto-sell.trigger-col-ratio-to-perfrom-sell')}
      autoBSState={autoSellState}
    />
  )
}

interface SidebarAutoSellCancelEditingStageProps {
  errors: VaultErrorMessage[]
  warnings: VaultWarningMessage[]
  autoSellState: AutoBSFormChange
}

export function SidebarAutoSellCancelEditingStage({
  errors,
  warnings,
  autoSellState,
}: SidebarAutoSellCancelEditingStageProps) {
  const { t } = useTranslation()
  const {
    positionData: { debtFloor, token },
  } = useAutomationContext()

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('auto-sell.cancel-summary-description')}
      </Text>
      <VaultErrors errorMessages={errors} ilkData={{ debtFloor, token }} />
      <VaultWarnings warningMessages={warnings} ilkData={{ debtFloor }} />
      <AutoSellInfoSectionControl autoSellState={autoSellState} />
    </>
  )
}
