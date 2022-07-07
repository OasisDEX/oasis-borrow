import { BigNumber } from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { MultipleRangeSlider } from 'components/vault/MultipleRangeSlider'
import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { AddAutoSellInfoSection } from 'features/automation/basicBuySell/InfoSections/AddAutoSellInfoSection'
import { MaxGasPriceSection } from 'features/automation/basicBuySell/MaxGasPriceSection/MaxGasPriceSection'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import {
  BASIC_SELL_FORM_CHANGE,
  BasicBSFormChange,
} from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { PriceInfo } from 'features/shared/priceInfo'
import { handleNumericInput } from 'helpers/input'
import { useUIChanges } from 'helpers/uiChangesHook'
import { one } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'

interface AutoSellInfoSectionControlProps {
  priceInfo: PriceInfo
  vault: Vault
  basicSellState: BasicBSFormChange
  addTriggerGasEstimation: ReactNode
  debtDelta: BigNumber
  collateralDelta: BigNumber
}

function AutoSellInfoSectionControl({
  priceInfo,
  vault,
  basicSellState,
  addTriggerGasEstimation,
  debtDelta,
  collateralDelta,
}: AutoSellInfoSectionControlProps) {
  const deviationPercent = basicSellState.deviation.div(100)

  const targetRatioWithDeviationFloor = one
    .minus(deviationPercent)
    .times(basicSellState.targetCollRatio)
  const targetRatioWithDeviationCeiling = one
    .plus(deviationPercent)
    .times(basicSellState.targetCollRatio)

  return (
    <AddAutoSellInfoSection
      targetCollRatio={basicSellState.targetCollRatio}
      multipleAfterSell={one.div(basicSellState.targetCollRatio.div(100).minus(one)).plus(one)}
      execCollRatio={basicSellState.execCollRatio}
      nextSellPrice={priceInfo.nextCollateralPrice}
      collateralAfterNextSell={{
        value: vault.lockedCollateral,
        secondaryValue: vault.lockedCollateral.plus(collateralDelta),
      }}
      outstandingDebtAfterSell={{
        value: vault.debt,
        secondaryValue: vault.debt.plus(debtDelta),
      }}
      ethToBeSoldAtNextSell={collateralDelta.abs()}
      estimatedTransactionCost={addTriggerGasEstimation}
      token={vault.token}
      targetRatioWithDeviationCeiling={targetRatioWithDeviationCeiling}
      targetRatioWithDeviationFloor={targetRatioWithDeviationFloor}
    />
  )
}

interface SidebarAutoSellAddEditingStageProps {
  vault: Vault
  ilkData: IlkData
  priceInfo: PriceInfo
  isEditing: boolean
  basicSellState: BasicBSFormChange
  autoSellTriggerData: BasicBSTriggerData
  errors: VaultErrorMessage[]
  warnings: VaultWarningMessage[]
  addTriggerGasEstimation: ReactNode
  debtDelta: BigNumber
  collateralDelta: BigNumber
  sliderMin: BigNumber
  sliderMax: BigNumber
}

export function SidebarAutoSellAddEditingStage({
  vault,
  ilkData,
  isEditing,
  priceInfo,
  basicSellState,
  autoSellTriggerData,
  errors,
  warnings,
  addTriggerGasEstimation,
  debtDelta,
  collateralDelta,
  sliderMin,
  sliderMax,
}: SidebarAutoSellAddEditingStageProps) {
  const { uiChanges } = useAppContext()
  const [uiStateBasicSell] = useUIChanges<BasicBSFormChange>(BASIC_SELL_FORM_CHANGE)
  const { t } = useTranslation()

  return (
    <>
      <MultipleRangeSlider
        min={sliderMin.toNumber()}
        max={sliderMax.toNumber()}
        onChange={(value) => {
          uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
            type: 'execution-coll-ratio',
            execCollRatio: new BigNumber(value.value0),
          })
          uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
            type: 'target-coll-ratio',
            targetCollRatio: new BigNumber(value.value1),
          })
        }}
        value={{
          value0: uiStateBasicSell.execCollRatio.toNumber(),
          value1: uiStateBasicSell.targetCollRatio.toNumber(),
        }}
        valueColors={{
          value0: 'onWarning',
          value1: 'primary',
        }}
        step={1}
        leftDescription={t('auto-sell.sell-trigger-ratio')}
        rightDescription={t('auto-sell.target-coll-ratio')}
        leftThumbColor="onWarning"
        rightThumbColor="primary"
      />
      <VaultActionInput
        action={t('auto-sell.set-min-sell-price')}
        amount={uiStateBasicSell.maxBuyOrMinSellPrice}
        hasAuxiliary={false}
        hasError={false}
        currencyCode="USD"
        onChange={handleNumericInput((maxBuyOrMinSellPrice) => {
          uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
            type: 'max-buy-or-sell-price',
            maxBuyOrMinSellPrice,
          })
        })}
        onToggle={(toggleStatus) => {
          uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
            type: 'with-threshold',
            withThreshold: toggleStatus,
          })
          uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
            type: 'max-buy-or-sell-price',
            maxBuyOrMinSellPrice: !toggleStatus
              ? undefined
              : autoSellTriggerData.maxBuyOrMinSellPrice,
          })
        }}
        defaultToggle={basicSellState.withThreshold}
        showToggle={true}
        toggleOnLabel={t('protection.set-no-threshold')}
        toggleOffLabel={t('protection.set-threshold')}
        toggleOffPlaceholder={t('protection.no-threshold')}
      />
      {isEditing && (
        <>
          <VaultErrors errorMessages={errors} ilkData={ilkData} />
          <VaultWarnings warningMessages={warnings} ilkData={ilkData} />
        </>
      )}

      <SidebarResetButton
        clear={() => {
          uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
            type: 'reset',
            resetData: {
              targetCollRatio: autoSellTriggerData.targetCollRatio,
              execCollRatio: autoSellTriggerData.execCollRatio,
              maxBuyOrMinSellPrice: autoSellTriggerData.maxBuyOrMinSellPrice,
              withThreshold:
                !autoSellTriggerData.maxBuyOrMinSellPrice.isZero() ||
                autoSellTriggerData.triggerId.isZero(),
            },
          })
        }}
      />
      <MaxGasPriceSection
        onChange={(maxGasGweiPrice) => {
          uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
            type: 'max-gas-gwei-price',
            maxGasGweiPrice,
          })
        }}
        defaultValue={uiStateBasicSell.maxGasPercentagePrice}
      />
      {isEditing && (
        <AutoSellInfoSectionControl
          priceInfo={priceInfo}
          basicSellState={basicSellState}
          vault={vault}
          addTriggerGasEstimation={addTriggerGasEstimation}
          debtDelta={debtDelta}
          collateralDelta={collateralDelta}
        />
      )}
    </>
  )
}
