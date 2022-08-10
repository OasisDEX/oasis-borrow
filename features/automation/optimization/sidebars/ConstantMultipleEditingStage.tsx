import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { ActionPills } from 'components/ActionPills'
import { useAppContext } from 'components/AppContextProvider'
import { MultipleRangeSlider } from 'components/vault/MultipleRangeSlider'
import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { ConstantMultipleInfoSection } from 'features/automation/basicBuySell/InfoSections/ConstantMultipleInfoSection'
import { MaxGasPriceSection } from 'features/automation/basicBuySell/MaxGasPriceSection/MaxGasPriceSection'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import { ACCEPTABLE_FEE_DIFF } from 'features/automation/common/helpers'
import {
  ConstantMultipleTriggerData,
  prepareConstantMultipleResetData,
} from 'features/automation/optimization/common/constantMultipleTriggerData'
import {
  CONSTANT_MULTIPLE_FORM_CHANGE,
  ConstantMultipleFormChange,
} from 'features/automation/protection/common/UITypes/constantMultipleFormChange'
import { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { handleNumericInput } from 'helpers/input'
import {
  extractConstantMultipleCommonWarnings,
  extractConstantMultipleSliderWarnings,
} from 'helpers/messageMappers'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box } from 'theme-ui'

interface SidebaConstantMultiplerEditingStageProps {
  ilkData: IlkData
  isEditing: boolean
  autoBuyTriggerData: BasicBSTriggerData
  //   errors: VaultErrorMessage[]
  warnings: VaultWarningMessage[]
  token: string
  constantMultipleState: ConstantMultipleFormChange
  autoSellTriggerData: BasicBSTriggerData
  constantMultipleTriggerData: ConstantMultipleTriggerData
  nextBuyPrice: BigNumber
  nextSellPrice: BigNumber
  collateralToBePurchased: BigNumber
  collateralToBeSold: BigNumber
  estimatedGasCostOnTrigger?: BigNumber
  estimatedBuyFee: BigNumber
  estimatedSellFee: BigNumber
}

export function ConstantMultipleEditingStage({
  ilkData,
  isEditing,
  autoBuyTriggerData,
  //   errors,
  warnings,
  token,
  constantMultipleState,
  autoSellTriggerData,
  constantMultipleTriggerData,
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

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <ActionPills
          active={constantMultipleState.multiplier.toString()}
          variant="secondary"
          items={constantMultipleState.acceptableMultipliers.map((multiplier) => ({
            id: multiplier.toString(),
            label: `${multiplier}x`,
            action: () => {
              uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
                type: 'is-editing',
                isEditing: true,
              })
              uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
                type: 'multiplier',
                multiplier: multiplier,
              })
            },
          }))}
        />
      </Box>
      <MultipleRangeSlider
        min={constantMultipleState.minTargetRatio.toNumber()}
        max={constantMultipleState.maxTargetRatio.toNumber()}
        onChange={(value) => {
          uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
            type: 'is-editing',
            isEditing: true,
          })
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
          value0: 'warning100',
          value1: 'success100',
        }}
        step={1}
        leftDescription={t('auto-sell.sell-trigger-ratio')}
        rightDescription={t('auto-buy.trigger-coll-ratio')}
        leftThumbColor="warning100"
        rightThumbColor="success100"
        middleMark={{
          text: `${constantMultipleState.multiplier}x`,
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
            type: 'is-editing',
            isEditing: true,
          })
          uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
            type: 'max-buy-price',
            maxBuyPrice: maxBuyPrice,
          })
        })}
        onToggle={(toggleStatus) => {
          uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
            type: 'is-editing',
            isEditing: true,
          })
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
            type: 'is-editing',
            isEditing: true,
          })
          uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
            type: 'min-sell-price',
            minSellPrice,
          })
        })}
        onToggle={(toggleStatus) => {
          uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
            type: 'is-editing',
            isEditing: true,
          })
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
      <MaxGasPriceSection
        onChange={(maxBaseFeeInGwei) => {
          uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
            type: 'is-editing',
            isEditing: true,
          })
          uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
            type: 'max-gas-fee-in-gwei',
            maxBaseFeeInGwei: new BigNumber(maxBaseFeeInGwei),
          })
        }}
        value={constantMultipleState.maxBaseFeeInGwei.toNumber()}
      />
      {isEditing && (
        <>
          <SidebarResetButton
            clear={() => {
              uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
                type: 'reset',
                resetData: prepareConstantMultipleResetData({
                  defaultMultiplier: constantMultipleState.defaultMultiplier,
                  defaultCollRatio: constantMultipleState.defaultCollRatio,
                  constantMultipleTriggerData,
                }),
              })
            }}
          />
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
        </>
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
  const feeDiff = estimatedBuyFee.minus(estimatedSellFee).abs()
  const estimatedOasisFee = feeDiff.gt(ACCEPTABLE_FEE_DIFF)
    ? [estimatedBuyFee, estimatedSellFee].sort((a, b) => (a.gt(b) ? 0 : -1))
    : [BigNumber.maximum(estimatedBuyFee, estimatedSellFee)]

  return (
    <ConstantMultipleInfoSection
      token={token}
      targetColRatio={constantMultipleState.targetCollRatio}
      multiplier={constantMultipleState.multiplier}
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
