import {
  AutomationBotRemoveTriggerData,
  removeAutomationBotTrigger,
} from 'blockchain/calls/automationBot'
import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { getEstimatedGasFeeText } from 'components/vault/VaultChangesInformation'
import { VaultErrors } from 'components/vault/VaultErrors'
import { BuyInfoSection } from 'features/automation/basicBuySell/InfoSections/BuyInfoSection'
import { BasicBSFormChange } from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import { getVaultChange } from 'features/multiply/manage/pipes/manageMultiplyVaultCalculations'
import { PriceInfo } from 'features/shared/priceInfo'
import { GasEstimationStatus } from 'helpers/form'
import { LOAN_FEE, OAZO_FEE } from 'helpers/multiply/calculations'
import { useObservable } from 'helpers/observableHook'
import { one, zero } from 'helpers/zero'
import React, { useMemo } from 'react'
import { Text } from 'theme-ui'

interface SidebarAutoBuyRemovalEditingStageProps {
  vault: Vault
  priceInfo: PriceInfo
  cancelTxData: AutomationBotRemoveTriggerData
  basicBuyState: BasicBSFormChange
  ilkData: IlkData
  errors: VaultErrorMessage[]
}

export function SidebarAutoBuyRemovalEditingStage({
  vault,
  cancelTxData,
  priceInfo,
  basicBuyState,
  ilkData,
  errors,
}: SidebarAutoBuyRemovalEditingStageProps) {
  // TODO dummy changes information for now
  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'lavender' }}>
        To cancel the Auto-Buy you’ll need to click the button below and confirm the transaction.
      </Text>
      {/* <VaultErrors errorMessages={errors} ilkData={ilkData} /> */}
      {/* <VaultWarnings warningMessages={warnings} ilkData={ilkData} /> */}
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
        secondaryValue: vault.lockedCollateral.minus(collateralDelta),
      }}
      outstandingDebtAfterNextBuy={{
        value: vault.debt,
        secondaryValue: vault.debt.minus(debtDelta.abs()),
      }}
      collateralToBePurchased={collateralDelta}
      estimatedTransactionCost={gasEstimation}
      token={vault.token}
    />
  )
}
