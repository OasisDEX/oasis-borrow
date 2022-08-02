import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { ActionPills } from 'components/ActionPills'
import { useAppContext } from 'components/AppContextProvider'
import { useGasEstimationContext } from 'components/GasEstimationContextProvider'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { MultipleRangeSlider } from 'components/vault/MultipleRangeSlider'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { VaultWarnings } from 'components/vault/VaultWarnings'
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
import {
  CONSTANT_MULTIPLE_FORM_CHANGE,
  ConstantMultipleFormChange,
} from 'features/automation/protection/common/UITypes/constantMultipleFormChange'
import { INITIAL_MULTIPLIER_SELECTED } from 'features/automation/protection/useConstantMultipleStateInitialization'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { getPrimaryButtonLabel } from 'features/sidebar/getPrimaryButtonLabel'
import { isDropdownDisabled } from 'features/sidebar/isDropdownDisabled'
import { SidebarFlow, SidebarVaultStages } from 'features/types/vaults/sidebarLabels'
import { handleNumericInput } from 'helpers/input'
import {
  extractConstantMultipleCommonWarnings,
  extractConstantMultipleSliderWarnings,
} from 'helpers/messageMappers'
import { useUIChanges } from 'helpers/uiChangesHook'
import { zero } from 'helpers/zero'
import { min } from 'lodash'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

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

  // multiplier?: number
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
  estimatedGasCostOnTrigger,
  estimatedBuyFee,
  estimatedSellFee,
}: SidebarSetupConstantMultipleProps) {
  const { t } = useTranslation()
  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)
  const { uiChanges } = useAppContext()
  const gasEstimation = useGasEstimationContext()
  const { token } = vault

  const flow: SidebarFlow = isRemoveForm
    ? 'cancelConstantMultiple'
    : isFirstSetup
    ? 'addConstantMultiple'
    : 'editConstantMultiple'

  const primaryButtonLabel = getPrimaryButtonLabel({ flow, stage })
  const acceptableMultipliers = [1.25, 1.5, 2, 2.5, 3, 4]
  function handleChangeMultiplier(multiplier: number) {
    onMultiplierChange(multiplier)
  }

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
          <ActionPills
            active={
              constantMultipleState?.multiplier
                ? constantMultipleState.multiplier.toString()
                : INITIAL_MULTIPLIER_SELECTED.toString()
            }
            variant="secondary"
            items={acceptableMultipliers.map((multiplier) => {
              return {
                id: multiplier.toString(),
                label: `${multiplier}X`,
                action: () => {
                  handleChangeMultiplier(multiplier)
                },
              }
            })}
          />
          <MultipleRangeSlider
            min={sliderMin.toNumber()}
            max={sliderMax || largestSliderValueAllowed}
            onChange={(value) => {
              uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
                type: 'sell-execution-coll-ratio',
                sellExecutionCollRatio: new BigNumber(value.value0),
              })
              uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
                type: 'buy-execution-coll-ratio',
                buyExecutionCollRatio: new BigNumber(value.value1),
              })
            }}
            value={{
              value0: constantMultipleState.sellExecutionCollRatio.toNumber(),
              value1: constantMultipleState.buyExecutionCollRatio.toNumber(),
            }}
            valueColors={{
              value0: 'onSuccess',
              value1: 'onWarning',
            }}
            step={1}
            leftDescription={t('auto-sell.sell-trigger-ratio')}
            rightDescription={t('auto-buy.trigger-coll-ratio')}
            leftThumbColor="onSuccess"
            rightThumbColor="onWarning"
            middleMark={{
              text: constantMultipleState.multiplier.toString(),
              value: constantMultipleState.targetCollRatio.toNumber(),
            }}
          />
          <VaultWarnings
            warningMessages={extractConstantMultipleSliderWarnings(warnings)}
            ilkData={ilkData}
          />
          <VaultActionInput
            action={t('auto-buy.set-max-buy-price')}
            amount={constantMultipleState?.maxBuyPrice}
            hasAuxiliary={false}
            hasError={false}
            currencyCode="USD"
            onChange={handleNumericInput((maxBuyPrice) => {
              uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
                type: 'max-buy-price',
                maxBuyPrice: maxBuyPrice,
              })
            })}
            onToggle={(toggleStatus) => {
              uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
                type: 'buy-with-threshold',
                buyWithThreshold: toggleStatus,
              })
            }}
            showToggle={true}
            toggleOnLabel={t('protection.set-no-threshold')}
            toggleOffLabel={t('protection.set-threshold')}
            toggleOffPlaceholder={t('protection.no-threshold')}
            defaultToggle={constantMultipleState?.buyWithThreshold}
          />
          <VaultActionInput
            action={t('auto-sell.set-min-sell-price')}
            amount={constantMultipleState?.minSellPrice}
            hasAuxiliary={false}
            hasError={false}
            currencyCode="USD"
            onChange={handleNumericInput((minSellPrice) => {
              uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
                type: 'min-sell-price',
                minSellPrice,
              })
            })}
            onToggle={(toggleStatus) => {
              uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
                type: 'sell-with-threshold',
                sellWithThreshold: toggleStatus,
              })
            }}
            defaultToggle={constantMultipleState?.sellWithThreshold}
            showToggle={true}
            toggleOnLabel={t('protection.set-no-threshold')}
            toggleOffLabel={t('protection.set-threshold')}
            toggleOffPlaceholder={t('protection.no-threshold')}
          />
          <VaultWarnings
            warningMessages={extractConstantMultipleCommonWarnings(warnings)}
            ilkData={ilkData}
            isAutoBuyEnabled={autoBuyTriggerData.isTriggerEnabled}
            isAutoSellEnabled={autoSellTriggerData.isTriggerEnabled}
          />
          {isEditing && (
            <ConstantMultipleInfoSectionControl
              token={token}
              nextBuyPrice={nextBuyPrice}
              nextSellPrice={nextSellPrice}
              collateralToBePurchased={collateralToBePurchased}
              collateralToBeSold={collateralToBeSold}
              estimatedGasCostOnTrigger={estimatedGasCostOnTrigger}
              estimatedBuyFee={estimatedBuyFee}
              estimatedSellFee={estimatedSellFee}
              constantMultipleState={constantMultipleState}
            />
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

function ConstantMultipleInfoSectionControl({
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
