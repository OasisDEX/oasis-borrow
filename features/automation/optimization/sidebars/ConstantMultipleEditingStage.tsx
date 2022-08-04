// import { Vault } from '@prisma/client'
import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { ActionPills } from 'components/ActionPills'
import { useAppContext } from 'components/AppContextProvider'
import { MultipleRangeSlider } from 'components/vault/MultipleRangeSlider'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { ConstantMultipleInfoSection } from 'features/automation/basicBuySell/InfoSections/ConstantMultipleInfoSection'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import { ACCEPTABLE_FEE_DIFF } from 'features/automation/common/helpers'
import { DEFAULT_BASIC_BS_MAX_SLIDER_VALUE } from 'features/automation/protection/common/consts/automationDefaults'
// import { BasicBSFormChange } from 'features/automation/protection/common/UITypes/basicBSFormChange'
import {
  CONSTANT_MULTIPLE_FORM_CHANGE,
  ConstantMultipleFormChange,
} from 'features/automation/protection/common/UITypes/constantMultipleFormChange'
import { INITIAL_MULTIPLIER_SELECTED } from 'features/automation/protection/useConstantMultipleStateInitialization'
// import { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { handleNumericInput } from 'helpers/input'
import {
  extractConstantMultipleCommonWarnings,
  extractConstantMultipleSliderWarnings,
} from 'helpers/messageMappers'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface SidebaConstantMultiplerEditingStageProps {
  //   vault: Vault
  ilkData: IlkData
  isEditing: boolean
  //   basicBuyState: BasicBSFormChange
  autoBuyTriggerData: BasicBSTriggerData
  //   errors: VaultErrorMessage[]
  warnings: VaultWarningMessage[]
  //   debtDelta: BigNumber
  //   collateralDelta: BigNumber
  sliderMin: BigNumber
  sliderMax: number
  token: string
  constantMultipleState: ConstantMultipleFormChange
  //   onChange: (multiplier: number) => void
  handleChangeMultiplier: (multiplier: number) => void
  autoSellTriggerData: BasicBSTriggerData
  nextBuyPrice: BigNumber
  nextSellPrice: BigNumber
  collateralToBePurchased: BigNumber
  collateralToBeSold: BigNumber
  estimatedGasCostOnTrigger?: BigNumber
  estimatedBuyFee: BigNumber
  estimatedSellFee: BigNumber
}

export function ConstantMultipleEditingStage({
  //   vault,
  ilkData,
  isEditing,
  //   basicBuyState,
  autoBuyTriggerData,
  //   errors,
  warnings,
  sliderMin,
  sliderMax,
  token,
  constantMultipleState,
  handleChangeMultiplier,
  autoSellTriggerData,
  nextBuyPrice,
  nextSellPrice,
  collateralToBePurchased,
  collateralToBeSold,
  estimatedGasCostOnTrigger,
  estimatedBuyFee,
  estimatedSellFee,
}: SidebaConstantMultiplerEditingStageProps) {
  const { uiChanges } = useAppContext()
  const { t } = useTranslation()

  const acceptableMultipliers = [1.25, 1.5, 2, 2.5, 3, 4]
  const largestSliderValueAllowed = DEFAULT_BASIC_BS_MAX_SLIDER_VALUE.times(100)
    .decimalPlaces(0, BigNumber.ROUND_DOWN)
    .toNumber()
  return (
    <>
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
    </>
  )
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
