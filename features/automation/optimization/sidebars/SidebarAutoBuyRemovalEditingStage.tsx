import { AutomationBotRemoveTriggerData, removeAutomationBotTrigger } from "blockchain/calls/automationBot";
import { Vault } from "blockchain/vaults";
import { BasicBSFormChange } from "features/automation/protection/common/UITypes/basicBSFormChange";
import { PriceInfo } from "features/shared/priceInfo";
import { Text } from 'theme-ui'
import React, { useMemo } from 'react'
import { BuyInfoSection } from "features/automation/basicBuySell/InfoSections/BuyInfoSection";
import { useAppContext } from "components/AppContextProvider";
import { GasEstimationStatus } from "helpers/form";
import { useObservable } from "helpers/observableHook";
import { getEstimatedGasFeeText } from "components/vault/VaultChangesInformation";
import { getVaultChange } from 'features/multiply/manage/pipes/manageMultiplyVaultCalculations'
import { one, zero } from "helpers/zero";
import { LOAN_FEE, OAZO_FEE } from "helpers/multiply/calculations";


interface SidebarAutoBuyRemovalEditingStageProps {
    vault: Vault
    priceInfo: PriceInfo
    cancelTxData: AutomationBotRemoveTriggerData
    basicBuyState: BasicBSFormChange
  }

  export function SidebarAutoBuyRemovalEditingStage({
    vault,
    cancelTxData,
    priceInfo,
    basicBuyState,
  }: SidebarAutoBuyRemovalEditingStageProps) {
    // TODO dummy changes information for now
    return (
      <>
        <Text as="p" variant="paragraph3" sx={{ color: 'lavender' }}>
          To cancel the Auto-Buy you’ll need to click the button below and confirm the transaction.
        </Text>
        <AutoBuyInfoSectionControl
          cancelTxData={cancelTxData}
          priceInfo={priceInfo}
          basicBuyState={basicBuyState}
          vault={vault}
        />
      </>
    )
  }

  interface AutoSellInfoSectionControlProps {
    cancelTxData: AutomationBotRemoveTriggerData
    priceInfo: PriceInfo
    vault: Vault
    basicBuyState: BasicBSFormChange
  }
  
  function AutoBuyInfoSectionControl({
    cancelTxData,
    priceInfo,
    vault,
    basicBuyState,
  }: AutoSellInfoSectionControlProps) {
    const { addGasEstimation$, tokenPriceUSD$ } = useAppContext()
    const _tokenPriceUSD$ = useMemo(() => tokenPriceUSD$([vault.token]), [vault.token])
  
    const removeTriggerGasEstimationData$ = useMemo(() => {
      return addGasEstimation$(
        { gasEstimationStatus: GasEstimationStatus.unset },
        ({ estimateGas }) => estimateGas(removeAutomationBotTrigger, cancelTxData),
      )
    }, [cancelTxData])
  
    const [addTriggerGasEstimationData] = useObservable(removeTriggerGasEstimationData$)
    const [tokenPriceData] = useObservable(_tokenPriceUSD$)
    const marketPrice = tokenPriceData?.[vault.token] || priceInfo.currentCollateralPrice
    const gasEstimation = getEstimatedGasFeeText(addTriggerGasEstimationData)
  
    const { debtDelta, collateralDelta } = getVaultChange({
      currentCollateralPrice: priceInfo.currentCollateralPrice,
      marketPrice: marketPrice,
      slippage: basicBuyState.deviation.div(100),
      debt: vault.debt,
      lockedCollateral: vault.lockedCollateral,
      requiredCollRatio: basicBuyState.targetCollRatio.div(100),
      depositAmount: zero,
      paybackAmount: zero,
      generateAmount: zero,
      withdrawAmount: zero,
      OF: OAZO_FEE,
      FF: LOAN_FEE,
    })
  
    return (
        <BuyInfoSection
        colRatioAfterBuy={basicBuyState.targetCollRatio}
        multipleAfterBuy={one.div(basicBuyState.targetCollRatio.div(100).minus(one)).plus(one)}
          execCollRatio={basicBuyState.execCollRatio}
          nextBuyPrice={priceInfo.nextCollateralPrice}
          slippageLimit={basicBuyState.deviation}
          collateralAfterNextBuy={{
            value: vault.lockedCollateral,
            secondaryValue: vault.lockedCollateral.minus(collateralDelta.abs()).toFixed(2),
          }}
          outstandingDebtAfterNextBuy={{
            value: vault.debt,
            secondaryValue: vault.debt.minus(debtDelta.abs()),
          }}
          ethToBePurchased={collateralDelta.abs()}
          estimatedTransactionCost={gasEstimation}
        // TODO ŁW info section to be precised in other story
        />
    )
  }