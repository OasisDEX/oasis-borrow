import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { Vault } from 'blockchain/vaults'
import { PickCloseState, PickCloseStateProps } from 'components/dumb/PickCloseState'
import { SliderValuePicker, SliderValuePickerProps } from 'components/dumb/SliderValuePicker'
import { EstimationOnClose } from 'components/EstimationOnClose'
import { getEstimatedCostOnClose } from 'features/automation/common/estimations/estimatedCostOnClose'
import { AddAutoTakeProfitInfoSection } from 'features/automation/optimization/autoTakeProfit/controls/AddAutoTakeProfitInfoSection'
import { AutoTakeProfitFormChange } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange'
import React from 'react'

interface SidebarAutoTakeProfitEditingStageProps {
  autoTakeProfitState: AutoTakeProfitFormChange
  closePickerConfig: PickCloseStateProps
  ethMarketPrice: BigNumber
  isEditing: boolean
  sliderConfig: SliderValuePickerProps
  tokenMarketPrice: BigNumber
  vault: Vault
}

export function SidebarAutoTakeProfitEditingStage({
  autoTakeProfitState,
  closePickerConfig,
  ethMarketPrice,
  isEditing,
  sliderConfig,
  tokenMarketPrice,
  vault,
}: SidebarAutoTakeProfitEditingStageProps) {
  return (
    <>
      <PickCloseState {...closePickerConfig} />
      <SliderValuePicker {...sliderConfig} />

      <EstimationOnClose
        iconCircle={getToken('DAI').iconCircle}
        label="Estimated DAI at Trigger"
        value="$3,990,402.00 DAI"
      />
      {isEditing && (
        <>
          {/* TODO: TDAutoTakeProfit | handle SidebarResetButton here */}
          <AutoTakeProfitInfoSectionControl
            debt={vault.debt}
            debtOffset={vault.debtOffset}
            ethMarketPrice={ethMarketPrice}
            lockedCollateral={vault.lockedCollateral}
            toCollateral={autoTakeProfitState.toCollateral}
            token={vault.token}
            tokenMarketPrice={tokenMarketPrice}
            triggerColPrice={autoTakeProfitState.executionPrice}
            triggerColRatio={autoTakeProfitState.executionCollRatio}
          />
        </>
      )}
    </>
  )
}

interface AutoTakeProfitInfoSectionControlProps {
  debt: BigNumber
  debtOffset: BigNumber
  ethMarketPrice: BigNumber
  lockedCollateral: BigNumber
  toCollateral: boolean
  token: string
  tokenMarketPrice: BigNumber
  triggerColPrice: BigNumber
  triggerColRatio: BigNumber
}

function AutoTakeProfitInfoSectionControl({
  debt,
  debtOffset,
  ethMarketPrice,
  lockedCollateral,
  toCollateral,
  token,
  triggerColPrice,
  triggerColRatio,
}: AutoTakeProfitInfoSectionControlProps) {
  const {
    estimatedOasisFeeOnTrigger,
    estimatedGasFeeOnTrigger,
    totalTriggerCost,
  } = getEstimatedCostOnClose({
    toCollateral,
    lockedCollateral,
    debt,
    debtOffset,
    ethMarketPrice,
    colMarketPrice: triggerColPrice,
  })

  return (
    <AddAutoTakeProfitInfoSection
      debtRepaid={debt}
      estimatedOasisFeeOnTrigger={estimatedOasisFeeOnTrigger}
      estimatedGasFeeOnTrigger={estimatedGasFeeOnTrigger}
      token={token}
      totalTriggerCost={totalTriggerCost}
      triggerColPrice={triggerColPrice}
      triggerColRatio={triggerColRatio}
    />
  )
}
