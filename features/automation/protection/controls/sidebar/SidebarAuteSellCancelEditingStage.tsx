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

interface AutoSellInfoSectionControlProps {
  vault: Vault
  cancelTriggerGasEstimation: ReactNode
}

function AutoSellInfoSectionControl({
  vault,
  cancelTriggerGasEstimation,
}: AutoSellInfoSectionControlProps) {
  const { t } = useTranslation()
  return (
    <CancelAutoBSInfoSection
      collateralizationRatio={vault.collateralizationRatio}
      liquidationPrice={vault.liquidationPrice}
      estimatedTransactionCost={cancelTriggerGasEstimation}
      title={t('auto-sell.cancel-summary-title')}
    />
  )
}

interface SidebarAutoSellCancelEditingStageProps {
  vault: Vault
  ilkData: IlkData
  errors: VaultErrorMessage[]
  warnings: VaultWarningMessage[]
  cancelTriggerGasEstimation: ReactNode
}

export function SidebarAutoSellCancelEditingStage({
  vault,
  ilkData,
  errors,
  warnings,
  cancelTriggerGasEstimation,
}: SidebarAutoSellCancelEditingStageProps) {
  const { t } = useTranslation()

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'lavender' }}>
        {t('auto-sell.cancel-summary-description')}
      </Text>
      <VaultErrors errorMessages={errors} ilkData={ilkData} />
      <VaultWarnings warningMessages={warnings} ilkData={ilkData} />
      <AutoSellInfoSectionControl
        vault={vault}
        cancelTriggerGasEstimation={cancelTriggerGasEstimation}
      />
    </>
  )
}
