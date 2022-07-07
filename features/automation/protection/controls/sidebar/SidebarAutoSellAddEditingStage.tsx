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
import { getVaultChange } from 'features/multiply/manage/pipes/manageMultiplyVaultCalculations'
import { PriceInfo } from 'features/shared/priceInfo'
import { handleNumericInput } from 'helpers/input'
import { LOAN_FEE, OAZO_FEE } from 'helpers/multiply/calculations'
import { useUIChanges } from 'helpers/uiChangesHook'
import { one, zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'

interface AutoSellInfoSectionControlProps {
  priceInfo: PriceInfo
  vault: Vault
  basicSellState: BasicBSFormChange
  tokenMarketPrice: BigNumber
  addTriggerGasEstimation: ReactNode
}

function AutoSellInfoSectionControl({
  priceInfo,
  vault,
  basicSellState,
  tokenMarketPrice,
  addTriggerGasEstimation,
}: AutoSellInfoSectionControlProps) {
  const { debtDelta, collateralDelta } = getVaultChange({
    currentCollateralPrice: priceInfo.currentCollateralPrice,
    marketPrice: tokenMarketPrice,
    slippage: basicSellState.deviation.div(100),
    debt: vault.debt,
    lockedCollateral: vault.lockedCollateral,
    requiredCollRatio: basicSellState.targetCollRatio.div(100),
    depositAmount: zero,
    paybackAmount: zero,
    generateAmount: zero,
    withdrawAmount: zero,
    OF: OAZO_FEE,
    FF: LOAN_FEE,
  })

  return (
    <AddAutoSellInfoSection
      targetCollRatio={basicSellState.targetCollRatio}
      multipleAfterSell={one.div(basicSellState.targetCollRatio.div(100).minus(one)).plus(one)}
      execCollRatio={basicSellState.execCollRatio}
      nextSellPrice={priceInfo.nextCollateralPrice}
      slippageLimit={basicSellState.deviation}
      collateralAfterNextSell={{
        value: vault.lockedCollateral,
        secondaryValue: vault.lockedCollateral.minus(collateralDelta.abs()),
      }}
      outstandingDebtAfterSell={{
        value: vault.debt,
        secondaryValue: vault.debt.minus(debtDelta.abs()),
      }}
      ethToBeSoldAtNextSell={collateralDelta.abs()}
      estimatedTransactionCost={addTriggerGasEstimation}
      token={vault.token}
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
  autoBuyTriggerData: BasicBSTriggerData
  errors: VaultErrorMessage[]
  warnings: VaultWarningMessage[]
  tokenMarketPrice: BigNumber
  addTriggerGasEstimation: ReactNode
}

export function SidebarAutoSellAddEditingStage({
  vault,
  ilkData,
  isEditing,
  priceInfo,
  basicSellState,
  autoSellTriggerData,
  autoBuyTriggerData,
  errors,
  warnings,
  tokenMarketPrice,
  addTriggerGasEstimation,
}: SidebarAutoSellAddEditingStageProps) {
  const { uiChanges } = useAppContext()
  const [uiStateBasicSell] = useUIChanges<BasicBSFormChange>(BASIC_SELL_FORM_CHANGE)
  const { t } = useTranslation()

  // TODO to be updated
  const min = ilkData.liquidationRatio.plus(0.05).times(100).toNumber()
  const max = !autoBuyTriggerData.targetCollRatio.isZero()
    ? autoBuyTriggerData.targetCollRatio.toNumber()
    : 500

  return (
    <>
      <MultipleRangeSlider
        min={min}
        max={max}
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
          value1: 'onSuccess',
        }}
        leftDescription={t('auto-sell.sell-trigger-ratio')}
        rightDescription={t('auto-sell.target-coll-ratio')}
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
        onChange={(maxGasPercentagePrice) => {
          uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
            type: 'max-gas-percentage-price',
            maxGasPercentagePrice,
          })
        }}
        defaultValue={uiStateBasicSell.maxGasPercentagePrice}
      />
      {isEditing && (
        <AutoSellInfoSectionControl
          priceInfo={priceInfo}
          basicSellState={basicSellState}
          vault={vault}
          tokenMarketPrice={tokenMarketPrice}
          addTriggerGasEstimation={addTriggerGasEstimation}
        />
      )}
    </>
  )
}
