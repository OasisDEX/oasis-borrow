import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
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
  vault: Vault
  autoSellState: AutoBSFormChange
}

function AutoSellInfoSectionControl({ vault, autoSellState }: AutoSellInfoSectionControlProps) {
  const { t } = useTranslation()
  return (
    <CancelAutoBSInfoSection
      collateralizationRatio={vault.collateralizationRatio}
      liquidationPrice={vault.liquidationPrice}
      debt={vault.debt}
      title={t('auto-sell.cancel-summary-title')}
      targetLabel={t('auto-sell.target-col-ratio-each-sell')}
      triggerLabel={t('auto-sell.trigger-col-ratio-to-perfrom-sell')}
      autoBSState={autoSellState}
    />
  )
}

interface SidebarAutoSellCancelEditingStageProps {
  vault: Vault
  ilkData: IlkData
  errors: VaultErrorMessage[]
  warnings: VaultWarningMessage[]
  autoSellState: AutoBSFormChange
}

export function SidebarAutoSellCancelEditingStage({
  vault,
  ilkData,
  errors,
  warnings,
  autoSellState,
}: SidebarAutoSellCancelEditingStageProps) {
  const { t } = useTranslation()

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('auto-sell.cancel-summary-description')}
      </Text>
      <VaultErrors errorMessages={errors} ilkData={ilkData} />
      <VaultWarnings warningMessages={warnings} ilkData={ilkData} />
      <AutoSellInfoSectionControl vault={vault} autoSellState={autoSellState} />
    </>
  )
}
