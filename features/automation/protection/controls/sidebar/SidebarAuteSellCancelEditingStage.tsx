import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { CancelAutoBSInfoSection } from 'features/automation/basicBuySell/InfoSections/CancelAutoBSInfoSection'
import { BasicBSFormChange } from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'
import { Text } from 'theme-ui'

interface AutoSellInfoSectionControlProps {
  vault: Vault
  cancelTriggerGasEstimation: ReactNode
  basicSellState: BasicBSFormChange
}

function AutoSellInfoSectionControl({
  vault,
  cancelTriggerGasEstimation,
  basicSellState,
}: AutoSellInfoSectionControlProps) {
  const { t } = useTranslation()
  return (
    <CancelAutoBSInfoSection
      collateralizationRatio={vault.collateralizationRatio}
      liquidationPrice={vault.liquidationPrice}
      debt={vault.debt}
      estimatedTransactionCost={cancelTriggerGasEstimation}
      title={t('auto-sell.cancel-summary-title')}
      basicBSState={basicSellState}
    />
  )
}

interface SidebarAutoSellCancelEditingStageProps {
  vault: Vault
  ilkData: IlkData
  errors: VaultErrorMessage[]
  warnings: VaultWarningMessage[]
  cancelTriggerGasEstimation: ReactNode
  basicSellState: BasicBSFormChange
}

export function SidebarAutoSellCancelEditingStage({
  vault,
  ilkData,
  errors,
  warnings,
  cancelTriggerGasEstimation,
  basicSellState,
}: SidebarAutoSellCancelEditingStageProps) {
  const { t } = useTranslation()

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('auto-sell.cancel-summary-description')}
      </Text>
      <VaultErrors errorMessages={errors} ilkData={ilkData} />
      <VaultWarnings warningMessages={warnings} ilkData={ilkData} />
      <AutoSellInfoSectionControl
        vault={vault}
        cancelTriggerGasEstimation={cancelTriggerGasEstimation}
        basicSellState={basicSellState}
      />
    </>
  )
}
