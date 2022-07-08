import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { CancelAutoBSInfoSection } from 'features/automation/basicBuySell/InfoSections/CancelAutoBSInfoSection'
import { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'
import { Text } from 'theme-ui'

interface SidebarAutoBuyRemovalEditingStageProps {
  vault: Vault
  ilkData: IlkData
  errors: VaultErrorMessage[]
  warnings: VaultWarningMessage[]
  cancelTriggerGasEstimation: ReactNode
}

export function SidebarAutoBuyRemovalEditingStage({
  vault,
  ilkData,
  errors,
  warnings,
  cancelTriggerGasEstimation,
}: SidebarAutoBuyRemovalEditingStageProps) {
  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'lavender' }}>
        To cancel the Auto-Buy you’ll need to click the button below and confirm the transaction.
      </Text>
      <VaultErrors errorMessages={errors} ilkData={ilkData} />
      <VaultWarnings warningMessages={warnings} ilkData={ilkData} />
      <AutoBuyInfoSectionControl
        vault={vault}
        cancelTriggerGasEstimation={cancelTriggerGasEstimation}
      />
    </>
  )
}

interface AutoBuyInfoSectionControlProps {
  vault: Vault
  cancelTriggerGasEstimation: ReactNode
}

function AutoBuyInfoSectionControl({
  vault,
  cancelTriggerGasEstimation,
}: AutoBuyInfoSectionControlProps) {
  const { t } = useTranslation()
  return (
    <CancelAutoBSInfoSection
      collateralizationRatio={vault.collateralizationRatio}
      liquidationPrice={vault.liquidationPrice}
      estimatedTransactionCost={cancelTriggerGasEstimation}
      title={t('auto-buy.cancel-summary-title')}
    />
  )
}
