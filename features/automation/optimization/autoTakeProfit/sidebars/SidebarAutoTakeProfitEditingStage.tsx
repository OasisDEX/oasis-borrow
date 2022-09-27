import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { EstimationOnClose } from 'components/EstimationOnClose'
import { AddAutoTakeProfitInfoSection } from 'features/automation/optimization/autoTakeProfit/controls/AddAutoTakeProfitInfoSection'
import React from 'react'

interface SidebarAutoTakeProfitEditingStageProps {}

// TODO: TDAutoTakeProfit | temporary disable before neede interface props are known 
// eslint-disable-next-line no-empty-pattern
export function SidebarAutoTakeProfitEditingStage({}: SidebarAutoTakeProfitEditingStageProps) {
  return (
    <>
      Form placeholder
      <EstimationOnClose
        iconCircle={getToken('DAI').iconCircle}
        label="Estimated DAI at Trigger"
        value="$3,990,402.00 DAI"
      />
      <AutoTakeProfitInfoSectionControl />
    </>
  )
}

interface AutoTakeProfitInfoSectionControlProps {}

// TODO: TDAutoTakeProfit | temporary disable before neede interface props are known
// eslint-disable-next-line no-empty-pattern
function AutoTakeProfitInfoSectionControl({}: AutoTakeProfitInfoSectionControlProps) {
  // TODO: TDAutoTakeProfit | to be replaced with data from parent component
  const triggerColPrice = new BigNumber(2500)
  const triggerColRatio = new BigNumber(400)
  const debtRepaid = new BigNumber(45003407)
  const ethPrice = new BigNumber(1925)
  const ethPriceImpact = new BigNumber(-0.25)
  const setupTransactionCost = new BigNumber(3.24)
  const totalTransactionCost = new BigNumber(388.26)
  const estimatedOasisFee = new BigNumber(371.75)
  const estimatedMaxGasFee = new BigNumber(16.51)

  return (
    <AddAutoTakeProfitInfoSection
      debtRepaid={debtRepaid}
      estimatedMaxGasFee={estimatedMaxGasFee}
      estimatedOasisFee={estimatedOasisFee}
      ethPrice={ethPrice}
      ethPriceImpact={ethPriceImpact}
      setupTransactionCost={setupTransactionCost}
      totalTransactionCost={totalTransactionCost}
      triggerColPrice={triggerColPrice}
      triggerColRatio={triggerColRatio}
    />
  )
}
