import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { useGasEstimationContext } from 'components/GasEstimationContextProvider'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { ConstantMultipleInfoSection } from 'features/automation/basicBuySell/InfoSections/ConstantMultipleInfoSection'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import { ACCEPTABLE_FEE_DIFF } from 'features/automation/common/helpers'
import { commonOptimizationDropdownItems } from 'features/automation/optimization/common/dropdown'
import { warningsConstantMultipleValidation } from 'features/automation/optimization/validators'
import { DEFAULT_BASIC_BS_MAX_SLIDER_VALUE } from 'features/automation/protection/common/consts/automationDefaults'
import { getBasicSellMinMaxValues } from 'features/automation/protection/common/helpers'
import { StopLossTriggerData } from 'features/automation/protection/common/stopLossTriggerData'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
} from 'features/automation/protection/common/UITypes/AutomationFeatureChange'
import { ConstantMultipleFormChange } from 'features/automation/protection/common/UITypes/constantMultipleFormChange'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { getPrimaryButtonLabel } from 'features/sidebar/getPrimaryButtonLabel'
import { isDropdownDisabled } from 'features/sidebar/isDropdownDisabled'
import { SidebarFlow, SidebarVaultStages } from 'features/types/vaults/sidebarLabels'
import { useUIChanges } from 'helpers/uiChangesHook'
import { zero } from 'helpers/zero'
import { min } from 'lodash'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

import { ConstantMultipleEditingStage } from './ConstantMultipleEditingStage'

interface SidebarSetupConstantMultipleProps {
  vault: Vault
  balanceInfo: BalanceInfo
  stage: SidebarVaultStages
  constantMultipleState: ConstantMultipleFormChange
  isAddForm: boolean
  isRemoveForm: boolean
  // isEditing: boolean //TODO ŁW, will be used in middle stages
  isDisabled: boolean
  isFirstSetup: boolean
  onChange: (multiplier: number) => void
  txHandler: () => void
  ilkData: IlkData
  autoBuyTriggerData: BasicBSTriggerData
  autoSellTriggerData: BasicBSTriggerData
  stopLossTriggerData: StopLossTriggerData
  ethMarketPrice: BigNumber
  isEditing: boolean
  nextBuyPrice: BigNumber
  nextSellPrice: BigNumber
  collateralToBePurchased: BigNumber
  collateralToBeSold: BigNumber
  estimatedGasCostOnTrigger?: BigNumber
  estimatedBuyFee: BigNumber
  estimatedSellFee: BigNumber
}

const largestSliderValueAllowed = DEFAULT_BASIC_BS_MAX_SLIDER_VALUE.times(100)
  .decimalPlaces(0, BigNumber.ROUND_DOWN)
  .toNumber()

export function SidebarSetupConstantMultiple({
  vault,
  balanceInfo,
  isAddForm,
  isRemoveForm,
  isDisabled,
  isFirstSetup,
  stage,
  onChange: onMultiplierChange,
  constantMultipleState,
  txHandler,
  ilkData,
  autoBuyTriggerData,
  autoSellTriggerData,
  stopLossTriggerData,
  ethMarketPrice,
  isEditing,
  nextBuyPrice,
  nextSellPrice,
  collateralToBePurchased,
  collateralToBeSold,
  estimatedBuyFee,
  estimatedSellFee,
}: SidebarSetupConstantMultipleProps) {
  const { t } = useTranslation()
  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)
  const { uiChanges } = useAppContext()
  const gasEstimation = useGasEstimationContext()

  const flow: SidebarFlow = isRemoveForm
    ? 'cancelConstantMultiple'
    : isFirstSetup
    ? 'addConstantMultiple'
    : 'editConstantMultiple'

  const primaryButtonLabel = getPrimaryButtonLabel({ flow, stage })

  const { min: sliderMin } = getBasicSellMinMaxValues({
    autoBuyTriggerData,
    stopLossTriggerData,
    ilkData,
  })
  const sliderMax = min([
    vault.lockedCollateralUSD
      .div(ilkData.debtFloor)
      .multipliedBy(100)
      .decimalPlaces(0, BigNumber.ROUND_DOWN)
      .toNumber(),
    largestSliderValueAllowed,
  ])

  const warnings = warningsConstantMultipleValidation({
    vault,
    gasEstimationUsd: gasEstimation?.usdValue,
    ethBalance: balanceInfo.ethBalance,
    ethPrice: ethMarketPrice,
    sliderMin,
    isStopLossEnabled: stopLossTriggerData.isStopLossEnabled,
    isAutoBuyEnabled: autoBuyTriggerData.isTriggerEnabled,
    isAutoSellEnabled: autoSellTriggerData.isTriggerEnabled,
    constantMultipleState,
  })
  function handleChangeMultiplier(multiplier: number) {
    onMultiplierChange(multiplier)
  }
  if (activeAutomationFeature?.currentOptimizationFeature === 'constantMultiple') {
    const sidebarSectionProps: SidebarSectionProps = {
      title: t('constant-multiple.title'),
      dropdown: {
        forcePanel: 'constantMultiple',
        disabled: isDropdownDisabled({ stage }),
        items: commonOptimizationDropdownItems(uiChanges, t),
      },
      content: (
        <Grid gap={3}>
          {(stage === 'editing' || stage === 'txFailure') && (
            <>
              <ConstantMultipleEditingStage
                ilkData={ilkData}
                isEditing={isEditing}
                // basicBuyState={undefined}
                autoBuyTriggerData={autoBuyTriggerData}
                // errors={[]}
                warnings={warnings}
                // debtDelta={new BigNumber()}
                // collateralDelta={new BigNumber()}
                sliderMin={sliderMin}
                sliderMax={sliderMax !== undefined ? sliderMax : largestSliderValueAllowed}
                token={''}
                constantMultipleState={constantMultipleState}
                handleChangeMultiplier={handleChangeMultiplier}
                autoSellTriggerData={autoSellTriggerData}
                nextBuyPrice={nextBuyPrice}
                nextSellPrice={nextSellPrice}
                collateralToBePurchased={collateralToBePurchased}
                collateralToBeSold={collateralToBeSold}
                estimatedBuyFee={estimatedBuyFee}
                estimatedSellFee={estimatedSellFee}
              />
            </>
          )}
        </Grid>
      ),
      primaryButton: {
        label: primaryButtonLabel,
        disabled: isDisabled /*|| !!errors.length*/ && stage !== 'txSuccess',
        isLoading: stage === 'txInProgress',
        action: () => txHandler(),
      },
      ...(stage !== 'txInProgress' && {
        textButton: {
          label: isAddForm ? t('system.remove-trigger') : t('system.add-trigger'),
          hidden: true,
          action: () => textButtonHandler(),
        },
      }),
      // TODO ŁW status:
    }
    return <SidebarSection {...sidebarSectionProps} />
  }
  return null
}

function textButtonHandler(): void {
  alert('switch to remove')
}

interface ConstantMultipleInfoSectionControlProps {
  token: string
  nextBuyPrice: BigNumber
  nextSellPrice: BigNumber
  collateralToBePurchased: BigNumber
  collateralToBeSold: BigNumber
  estimatedGasCostOnTrigger?: BigNumber
  estimatedBuyFee: BigNumber
  estimatedSellFee: BigNumber
  constantMultipleState: ConstantMultipleFormChange
}

export function ConstantMultipleInfoSectionControl({
  token,
  nextBuyPrice,
  nextSellPrice,
  collateralToBePurchased,
  collateralToBeSold,
  estimatedGasCostOnTrigger,
  estimatedBuyFee,
  estimatedSellFee,
  constantMultipleState,
}: ConstantMultipleInfoSectionControlProps) {
  // TODO: PK where do I get slippage?
  const slippage = new BigNumber(0.5)
  const feeDiff = estimatedBuyFee.minus(estimatedSellFee).abs()
  const estimatedOasisFee = feeDiff.gt(ACCEPTABLE_FEE_DIFF)
    ? [estimatedBuyFee, estimatedSellFee].sort((a, b) => (a.gt(b) ? 0 : -1))
    : [BigNumber.maximum(estimatedBuyFee, estimatedSellFee)]

  return (
    <ConstantMultipleInfoSection
      token={token}
      targetColRatio={constantMultipleState.targetCollRatio}
      multiplier={constantMultipleState.multiplier}
      slippage={slippage}
      buyExecutionCollRatio={constantMultipleState.buyExecutionCollRatio}
      nextBuyPrice={nextBuyPrice}
      collateralToBePurchased={collateralToBePurchased}
      maxPriceToBuy={
        constantMultipleState.buyWithThreshold
          ? constantMultipleState.maxBuyPrice || zero
          : undefined
      }
      sellExecutionCollRatio={constantMultipleState.sellExecutionCollRatio}
      nextSellPrice={nextSellPrice}
      collateralToBeSold={collateralToBeSold}
      minPriceToSell={
        constantMultipleState.sellWithThreshold
          ? constantMultipleState.minSellPrice || zero
          : undefined
      }
      estimatedOasisFee={estimatedOasisFee}
      estimatedGasCostOnTrigger={estimatedGasCostOnTrigger}
    />
  )
}
