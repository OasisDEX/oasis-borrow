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
  vault: Vault
  closePickerConfig: PickCloseStateProps
  isEditing: boolean
  sliderConfig: SliderValuePickerProps
}

export function SidebarAutoTakeProfitEditingStage({
  vault,
  closePickerConfig,
  isEditing,
  sliderConfig,
  autoTakeProfitState,
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
            triggerColRatio={autoTakeProfitState.executionCollRatio}
            triggerColPrice={autoTakeProfitState.executionPrice}
            lockedCollateral={vault.lockedCollateral}
            debt={vault.debt}
            debtOffset={vault.debtOffset}
            token={vault.token}
            toCollateral={autoTakeProfitState.toCollateral}
          />
        </>
      )}
    </>
  )
}

interface AutoTakeProfitInfoSectionControlProps {
  lockedCollateral: BigNumber
  triggerColPrice: BigNumber
  triggerColRatio: BigNumber
  debt: BigNumber
  debtOffset: BigNumber
  token: string
  toCollateral: boolean
}

function AutoTakeProfitInfoSectionControl({
  lockedCollateral,
  token,
  triggerColPrice,
  triggerColRatio,
  debt,
  debtOffset,
  toCollateral,
}: AutoTakeProfitInfoSectionControlProps) {
  // TODO: TDAutoTakeProfit | to be replaced with data from parent component
  const ethPrice = new BigNumber(1925)
  const ethPriceImpact = new BigNumber(-0.25)
  const { estimatedOasisFee, estimatedGasFee, totalTransactionCost } = getEstimatedCostOnClose({
    toCollateral,
    lockedCollateral,
    debt,
    debtOffset,
    marketPrice: triggerColPrice,
  })

  return (
    <AddAutoTakeProfitInfoSection
      debtRepaid={debt}
      estimatedGasFee={estimatedGasFee}
      estimatedOasisFee={estimatedOasisFee}
      ethPrice={ethPrice}
      ethPriceImpact={ethPriceImpact}
      token={token}
      totalTransactionCost={totalTransactionCost}
      triggerColPrice={triggerColPrice}
      triggerColRatio={triggerColRatio}
    />
  )
}
