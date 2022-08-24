import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { CancelConstantMultipleInfoSection } from 'features/automation/optimization/constantMultiple/controls/CancelConstantMultipleInfoSection'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'

interface SidebarConstantMultipleRemovalEditingStageProps {
  errors: VaultErrorMessage[]
  ilkData: IlkData
  vault: Vault
  warnings: VaultWarningMessage[]
  constantMultipleTriggerData: ConstantMultipleTriggerData
}

export function SidebarConstantMultipleRemovalEditingStage({
  constantMultipleTriggerData,
  errors,
  ilkData,
  vault,
  warnings,
}: SidebarConstantMultipleRemovalEditingStageProps) {
  const { t } = useTranslation()

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('constant-multiple.cancel-instructions')}
      </Text>
      <VaultErrors errorMessages={errors} ilkData={ilkData} />
      <VaultWarnings warningMessages={warnings} ilkData={ilkData} />
      <ConstantMultipleInfoSectionControl
        vault={vault}
        constantMultipleTriggerData={constantMultipleTriggerData}
      />
    </>
  )
}

interface ConstantMultipleInfoSectionControlProps {
  constantMultipleTriggerData: ConstantMultipleTriggerData
  vault: Vault
}

function ConstantMultipleInfoSectionControl({
  constantMultipleTriggerData,
  vault,
}: ConstantMultipleInfoSectionControlProps) {
  return (
    <CancelConstantMultipleInfoSection
      collateralizationRatio={vault.collateralizationRatio}
      liquidationPrice={vault.liquidationPrice}
      constantMultipleTriggerData={constantMultipleTriggerData}
      debt={vault.debt}
    />
  )
}
