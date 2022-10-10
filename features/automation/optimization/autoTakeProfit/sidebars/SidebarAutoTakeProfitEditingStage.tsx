import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { Vault } from 'blockchain/vaults'
import { PickCloseState, PickCloseStateProps } from 'components/dumb/PickCloseState'
import { SliderValuePicker, SliderValuePickerProps } from 'components/dumb/SliderValuePicker'
import { EstimationOnClose } from 'components/EstimationOnClose'
import { getOnCloseEstimations } from 'features/automation/common/estimations/onCloseEstimations'
import { AddAutoTakeProfitInfoSection } from 'features/automation/optimization/autoTakeProfit/controls/AddAutoTakeProfitInfoSection'
import { AutoTakeProfitFormChange } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange'
import { formatAmount } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
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
  const { t } = useTranslation()

  const { estimatedProfitOnClose } = getOnCloseEstimations({
    colMarketPrice: autoTakeProfitState.executionPrice,
    colOraclePrice: autoTakeProfitState.executionPrice,
    debt: vault.debt,
    debtOffset: vault.debtOffset,
    ethMarketPrice,
    lockedCollateral: vault.lockedCollateral,
    toCollateral: autoTakeProfitState.toCollateral,
  })
  const closeToToken = autoTakeProfitState.toCollateral ? vault.token : 'DAI'

  return (
    <>
      <PickCloseState {...closePickerConfig} />
      <SliderValuePicker {...sliderConfig} />

      <EstimationOnClose
        iconCircle={getToken(closeToToken).iconCircle}
        label={t('auto-take-profit.estimated-at-trigger', { token: closeToToken })}
        value={`${formatAmount(estimatedProfitOnClose, closeToToken)} ${closeToToken}`}
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
    estimatedGasFeeOnTrigger,
    estimatedOasisFeeOnTrigger,
    totalTriggerCost,
  } = getOnCloseEstimations({
    colMarketPrice: triggerColPrice,
    colOraclePrice: triggerColPrice,
    debt: debt,
    debtOffset: debtOffset,
    ethMarketPrice,
    lockedCollateral: lockedCollateral,
    toCollateral: toCollateral,
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
