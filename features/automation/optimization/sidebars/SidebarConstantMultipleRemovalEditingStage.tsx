import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { CancelConstantMultipleInfoSection } from 'features/automation/basicBuySell/InfoSections/CancelConstantMultipleInfoSection'
import { ConstantMultipleFormChange } from 'features/automation/protection/common/UITypes/constantMultipleFormChange'
import { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import React from 'react'
import { Text } from 'theme-ui'

interface SidebarConstantMultipleRemovalEditingStageProps {
  constantMultipleState: ConstantMultipleFormChange
  errors: VaultErrorMessage[]
  ilkData: IlkData
  vault: Vault
  warnings: VaultWarningMessage[]
}

export function SidebarConstantMultipleRemovalEditingStage({
  constantMultipleState,
  errors,
  ilkData,
  vault,
  warnings,
}: SidebarConstantMultipleRemovalEditingStageProps) {
  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        To cancel the Auto-Buy you’ll need to click the button below and confirm the transaction.
      </Text>
      <VaultErrors errorMessages={errors} ilkData={ilkData} />
      <VaultWarnings warningMessages={warnings} ilkData={ilkData} />
      <ConstantMultipleInfoSectionControl vault={vault} constantMultipleState={constantMultipleState} />
    </>
  )
}

interface ConstantMultipleInfoSectionControlProps {
  constantMultipleState: ConstantMultipleFormChange
  vault: Vault
}

function ConstantMultipleInfoSectionControl({
  constantMultipleState,
  vault,
}: ConstantMultipleInfoSectionControlProps) {
  return (
    <CancelConstantMultipleInfoSection
      collateralizationRatio={vault.collateralizationRatio}
      liquidationPrice={vault.liquidationPrice}
      constantMultipleState={constantMultipleState}
      debt={vault.debt}
    />
  )
}
