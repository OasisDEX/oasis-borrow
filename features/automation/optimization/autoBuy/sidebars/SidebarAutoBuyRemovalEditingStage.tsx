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

interface SidebarAutoBuyRemovalEditingStageProps {
  errors: VaultErrorMessage[]
  warnings: VaultWarningMessage[]
  autoBuyState: AutoBSFormChange
}

export function SidebarAutoBuyRemovalEditingStage({
  errors,
  warnings,
  autoBuyState,
}: SidebarAutoBuyRemovalEditingStageProps) {
  const {
    positionData: { debtFloor, token },
  } = useAutomationContext()

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        To cancel the Auto-Buy you’ll need to click the button below and confirm the transaction.
      </Text>
      <VaultErrors errorMessages={errors} ilkData={{ debtFloor, token }} />
      <VaultWarnings warningMessages={warnings} ilkData={{ debtFloor }} />
      <AutoBuyInfoSectionControl autoBuyState={autoBuyState} />
    </>
  )
}

interface AutoBuyInfoSectionControlProps {
  autoBuyState: AutoBSFormChange
}

function AutoBuyInfoSectionControl({ autoBuyState }: AutoBuyInfoSectionControlProps) {
  const { t } = useTranslation()
  const {
    positionData: { collateralizationRatio, liquidationPrice, debt },
  } = useAutomationContext()

  return (
    <CancelAutoBSInfoSection
      collateralizationRatio={collateralizationRatio}
      liquidationPrice={liquidationPrice}
      title={t('auto-buy.cancel-summary-title')}
      targetLabel={t('auto-buy.target-col-ratio-each-buy')}
      triggerLabel={t('auto-buy.trigger-col-ratio-to-perform-buy')}
      autoBSState={autoBuyState}
      debt={debt}
    />
  )
}
