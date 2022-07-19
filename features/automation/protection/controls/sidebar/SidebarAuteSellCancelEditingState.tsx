import {
  AutomationBotRemoveTriggerData,
  removeAutomationBotTrigger,
} from 'blockchain/calls/automationBot'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { getEstimatedGasFeeText } from 'components/vault/VaultChangesInformation'
import { AutoSellInfoSection } from 'features/automation/basicBuySell/InfoSections/AutoSellInfoSection'
import { BasicBSFormChange } from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { getVaultChange } from 'features/multiply/manage/pipes/manageMultiplyVaultCalculations'
import { PriceInfo } from 'features/shared/priceInfo'
import { GasEstimationStatus } from 'helpers/form'
import { LOAN_FEE, OAZO_FEE } from 'helpers/multiply/calculations'
import { useObservable } from 'helpers/observableHook'
import { one, zero } from 'helpers/zero'
import React, { useMemo } from 'react'
import { Text } from 'theme-ui'

interface AutoSellInfoSectionControlProps {
  cancelTxData: AutomationBotRemoveTriggerData
  priceInfo: PriceInfo
  vault: Vault
  basicSellState: BasicBSFormChange
}

function AutoSellInfoSectionControl({
  cancelTxData,
  priceInfo,
  vault,
  basicSellState,
}: AutoSellInfoSectionControlProps) {
  const { addGasEstimation$, tokenPriceUSD$ } = useAppContext()
  const _tokenPriceUSD$ = useMemo(() => tokenPriceUSD$([vault.token]), [vault.token])

  const addTriggerGasEstimationData$ = useMemo(() => {
    return addGasEstimation$(
      { gasEstimationStatus: GasEstimationStatus.unset },
      ({ estimateGas }) => estimateGas(removeAutomationBotTrigger, cancelTxData),
    )
  }, [cancelTxData])

  const [addTriggerGasEstimationData] = useObservable(addTriggerGasEstimationData$)
  const [tokenPriceData] = useObservable(_tokenPriceUSD$)
  const marketPrice = tokenPriceData?.[vault.token] || priceInfo.currentCollateralPrice
  const gasEstimation = getEstimatedGasFeeText(addTriggerGasEstimationData)

  const { debtDelta, collateralDelta } = getVaultChange({
    currentCollateralPrice: priceInfo.currentCollateralPrice,
    marketPrice: marketPrice,
    slippage: basicSellState.deviation.div(100),
    debt: vault.debt,
    lockedCollateral: vault.lockedCollateral,
    requiredCollRatio: basicSellState.targetCollRatio.div(100),
    depositAmount: zero,
    paybackAmount: zero,
    generateAmount: zero,
    withdrawAmount: zero,
    OF: OAZO_FEE,
    FF: LOAN_FEE,
  })

  return (
    <AutoSellInfoSection
      targetCollRatio={basicSellState.targetCollRatio}
      multipleAfterSell={one.div(basicSellState.targetCollRatio.div(100).minus(one)).plus(one)}
      execCollRatio={basicSellState.execCollRatio}
      nextSellPrice={priceInfo.nextCollateralPrice}
      slippageLimit={basicSellState.deviation}
      collateralAfterNextSell={{
        value: vault.lockedCollateral,
        secondaryValue: vault.lockedCollateral.minus(collateralDelta.abs()),
      }}
      outstandingDebtAfterSell={{
        value: vault.debt,
        secondaryValue: vault.debt.minus(debtDelta.abs()),
      }}
      ethToBeSoldAtNextSell={collateralDelta.abs()}
      estimatedTransactionCost={gasEstimation}
      token={vault.token}
    />
  )
}

interface SidebarAutoSellCancelEditingStageProps {
  vault: Vault
  priceInfo: PriceInfo
  cancelTxData: AutomationBotRemoveTriggerData
  basicSellState: BasicBSFormChange
}

export function SidebarAutoSellCancelEditingStage({
  vault,
  cancelTxData,
  priceInfo,
  basicSellState,
}: SidebarAutoSellCancelEditingStageProps) {
  // TODO dummy changes information for now
  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        To cancel the Auto-Buy you’ll need to click the button below and confirm the transaction.
      </Text>
      <AutoSellInfoSectionControl
        cancelTxData={cancelTxData}
        priceInfo={priceInfo}
        basicSellState={basicSellState}
        vault={vault}
      />
    </>
  )
}
