import {
  AutomationBotRemoveTriggerData,
  removeAutomationBotTrigger,
} from 'blockchain/calls/automationBot'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { getEstimatedGasFeeText } from 'components/vault/VaultChangesInformation'
import { CancelAutoSellInfoSection } from 'features/automation/basicBuySell/InfoSections/CancelAutoSellInfoSection'
import { GasEstimationStatus } from 'helpers/form'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React, { useMemo } from 'react'
import { Text } from 'theme-ui'

interface AutoSellInfoSectionControlProps {
  cancelTxData: AutomationBotRemoveTriggerData
  vault: Vault
}

function AutoSellInfoSectionControl({ cancelTxData, vault }: AutoSellInfoSectionControlProps) {
  const { addGasEstimation$ } = useAppContext()

  const cancelTriggerGasEstimationData$ = useMemo(() => {
    return addGasEstimation$(
      { gasEstimationStatus: GasEstimationStatus.unset },
      ({ estimateGas }) => estimateGas(removeAutomationBotTrigger, cancelTxData),
    )
  }, [cancelTxData])

  const [addTriggerGasEstimationData] = useObservable(cancelTriggerGasEstimationData$)
  const gasEstimation = getEstimatedGasFeeText(addTriggerGasEstimationData)

  return (
    <CancelAutoSellInfoSection
      collateralizationRatio={vault.collateralizationRatio}
      liquidationPrice={vault.liquidationPrice}
      estimatedTransactionCost={gasEstimation}
    />
  )
}

interface SidebarAutoSellCancelEditingStageProps {
  vault: Vault
  cancelTxData: AutomationBotRemoveTriggerData
}

export function SidebarAutoSellCancelEditingStage({
  vault,
  cancelTxData,
}: SidebarAutoSellCancelEditingStageProps) {
  const { t } = useTranslation()

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'lavender' }}>
        {t('auto-sell.cancel-summary-description')}
      </Text>
      <AutoSellInfoSectionControl cancelTxData={cancelTxData} vault={vault} />
    </>
  )
}
