import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { Vault } from 'blockchain/vaults'
import { PickCloseState, PickCloseStateProps } from 'components/dumb/PickCloseState'
import { SliderValuePicker, SliderValuePickerProps } from 'components/dumb/SliderValuePicker'
import { EstimationOnClose } from 'components/EstimationOnClose'
import { AddAutoTakeProfitInfoSection } from 'features/automation/optimization/autoTakeProfit/controls/AddAutoTakeProfitInfoSection'
import React from 'react'

interface SidebarAutoTakeProfitEditingStageProps {
  vault: Vault
  closePickerConfig: PickCloseStateProps
  sliderConfig: SliderValuePickerProps
}

export function SidebarAutoTakeProfitEditingStage({
  vault,
  closePickerConfig,
  sliderConfig,
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
      <AutoTakeProfitInfoSectionControl token={vault.token} />
    </>
  )
}

interface AutoTakeProfitInfoSectionControlProps {
  token: string
}

function AutoTakeProfitInfoSectionControl({ token }: AutoTakeProfitInfoSectionControlProps) {
  // TODO: TDAutoTakeProfit | to be replaced with data from parent component
  const triggerColPrice = new BigNumber(2500)
  const triggerColRatio = new BigNumber(400)
  const debtRepaid = new BigNumber(45003407)
  const ethPrice = new BigNumber(1925)
  const ethPriceImpact = new BigNumber(-0.25)
  const setupTransactionCost = new BigNumber(3.24)
  const totalTransactionCost = new BigNumber(388.26)
  const estimatedOasisFee = new BigNumber(371.75)
  const estimatedGasFee = new BigNumber(16.51)

  return (
    <AddAutoTakeProfitInfoSection
      debtRepaid={debtRepaid}
      estimatedGasFee={estimatedGasFee}
      estimatedOasisFee={estimatedOasisFee}
      ethPrice={ethPrice}
      ethPriceImpact={ethPriceImpact}
      setupTransactionCost={setupTransactionCost}
      token={token}
      totalTransactionCost={totalTransactionCost}
      triggerColPrice={triggerColPrice}
      triggerColRatio={triggerColRatio}
    />
  )
}
