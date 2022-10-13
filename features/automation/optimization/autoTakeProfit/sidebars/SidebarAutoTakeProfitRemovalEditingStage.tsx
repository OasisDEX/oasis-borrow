import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { CancelAutoTakeProfitInfoSection } from 'features/automation/optimization/autoTakeProfit/controls/CancelAutoTakeProfitInfoSection'
import { AutoTakeProfitTriggerData } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'

interface SidebarAutoTakeProfitRemovalEditingStageProps {
  autoTakeProfitTriggerData: AutoTakeProfitTriggerData
  errors: VaultErrorMessage[]
  ilkData: IlkData
  vault: Vault
  warnings: VaultWarningMessage[]
}

export function SidebarAutoTakeProfitRemovalEditingStage({
  autoTakeProfitTriggerData,
  errors,
  ilkData,
  vault,
  warnings,
}: SidebarAutoTakeProfitRemovalEditingStageProps) {
  const { t } = useTranslation()

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('auto-take-profit.cancel-instructions')}
      </Text>
      <VaultErrors errorMessages={errors} ilkData={ilkData} />
      <VaultWarnings warningMessages={warnings} ilkData={ilkData} />
      <AutoTakeProfitInfoSectionControl
        autoTakeProfitTriggerData={autoTakeProfitTriggerData}
        vault={vault}
      />
    </>
  )
}

interface AutoTakeProfitInfoSectionControlProps {
  autoTakeProfitTriggerData: AutoTakeProfitTriggerData
  vault: Vault
}

function AutoTakeProfitInfoSectionControl({
  autoTakeProfitTriggerData,
  vault,
}: AutoTakeProfitInfoSectionControlProps) {
  return (
    <CancelAutoTakeProfitInfoSection
      collateralizationRatio={vault.collateralizationRatio.times(100)}
      token={vault.token}
      debt={vault.debt}
      triggerColPrice={autoTakeProfitTriggerData.executionPrice}
    />
  )
}
