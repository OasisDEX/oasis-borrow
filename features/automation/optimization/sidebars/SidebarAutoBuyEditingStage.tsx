import { addAutomationBotTrigger, AutomationBotAddTriggerData, AutomationBotRemoveTriggerData } from 'blockchain/calls/automationBot'
import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import {
  BasicBSFormChange,
  BASIC_BUY_FORM_CHANGE,
} from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useTranslation } from 'next-i18next'
import { MultipleRangeSlider } from 'components/vault/MultipleRangeSlider'
import React, { useMemo } from 'react'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { MaxGasPriceSection } from 'features/automation/basicBuySell/MaxGasPriceSection/MaxGasPriceSection'
import BigNumber from 'bignumber.js'
import { handleNumericInput } from 'helpers/input'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import { PriceInfo } from 'features/shared/priceInfo'
import { GasEstimationStatus } from 'helpers/form'
import { useObservable } from 'helpers/observableHook'
import { getEstimatedGasFeeText } from 'components/vault/VaultChangesInformation'
import { getVaultChange } from 'features/multiply/manage/pipes/manageMultiplyVaultCalculations'
import { one, zero } from 'helpers/zero'
import { OAZO_FEE, LOAN_FEE } from 'helpers/multiply/calculations'
import { BuyInfoSection } from 'features/automation/basicBuySell/InfoSections/BuyInfoSection'

interface SidebarAutoBuyEditingStageProps {
  vault: Vault
  ilkData: IlkData
  addTxData: AutomationBotAddTriggerData
  basicBuyState: BasicBSFormChange
  isEditing: boolean
  autoBuyTriggerData: BasicBSTriggerData
  priceInfo: PriceInfo
}

export function SidebarAutoBuyEditingStage({
    vault,
  ilkData,
  isEditing,
    addTxData,
  basicBuyState,
  autoBuyTriggerData,
  priceInfo,
}: SidebarAutoBuyEditingStageProps) {
  const { uiChanges } = useAppContext()
  const { t } = useTranslation()

  // TODO to be updated
  const min = ilkData.liquidationRatio.plus(0.05).times(100).toNumber()
  //   const max = basicBuyState.targetCollRatio ? basicBuyState.targetCollRatio.toNumber() : 500
  const [uiStateBasicBuy] = useUIChanges<BasicBSFormChange>(BASIC_BUY_FORM_CHANGE)

  return (
    <>
      <MultipleRangeSlider
        min={min}
        max={500} // TODO ŁW use meaningful max
        onChange={(value) => {
          uiChanges.publish(BASIC_BUY_FORM_CHANGE, {
            type: 'target-coll-ratio',
            targetCollRatio: new BigNumber(value.value0),
          })
          uiChanges.publish(BASIC_BUY_FORM_CHANGE, {
            type: 'execution-coll-ratio',
            execCollRatio: new BigNumber(value.value1),
          })
        }}
        value={{
          value0: uiStateBasicBuy.targetCollRatio.toNumber(),
          value1: uiStateBasicBuy.execCollRatio.toNumber(),
        }}
        valueColors={{
          value1: 'onSuccess',
        }}
        leftDescription={t('auto-buy.target-coll-ratio')}
        rightDescription={t('auto-buy.trigger-coll-ratio')}
        minDescription={`(${t('auto-buy.min-ratio')})`}
      />
      <VaultActionInput
        action={t('auto-buy.set-max-buy-price')}
        amount={uiStateBasicBuy.maxBuyOrMinSellPrice}
        hasAuxiliary={true}
        hasError={false}
        currencyCode="USD"
        onChange={handleNumericInput((maxBuyOrMinSellPrice) => {
          uiChanges.publish(BASIC_BUY_FORM_CHANGE, {
            type: 'max-buy-or-sell-price',
            maxBuyOrMinSellPrice,
          })
        })}
        onToggle={(toggleStatus) => {
          uiChanges.publish(BASIC_BUY_FORM_CHANGE, {
            type: 'with-threshold',
            withThreshold: toggleStatus,
          })
        }}
        onAuxiliaryChange={() => {}}
        showToggle={true}
        toggleOnLabel={t('protection.set-no-threshold')}
        toggleOffLabel={t('protection.set-threshold')}
        toggleOffPlaceholder={t('protection.no-threshold')}
      />

      <SidebarResetButton
        clear={() => {
            uiChanges.publish(BASIC_BUY_FORM_CHANGE, {
                type: 'reset',
                resetData: {
                  targetCollRatio: autoBuyTriggerData.targetCollRatio,
                  execCollRatio: autoBuyTriggerData.execCollRatio,
                  maxBuyOrMinSellPrice: autoBuyTriggerData.maxBuyOrMinSellPrice,
                  withThreshold:
                    !autoBuyTriggerData.maxBuyOrMinSellPrice.isZero() ||
                    autoBuyTriggerData.triggerId.isZero(),
                },
              })        }}
      />
      <MaxGasPriceSection
        onChange={(maxGasPercentagePrice) => {
          uiChanges.publish(BASIC_BUY_FORM_CHANGE, {
            type: 'max-gas-percentage-price',
            maxGasPercentagePrice,
          })
        }}
        defaultValue={basicBuyState.maxGasPercentagePrice}
      />
      {isEditing && (
        <AutoBuyInfoSectionControl
          addTxData={addTxData}
          priceInfo={priceInfo}
          basicBuyState={basicBuyState}
          vault={vault}
        />
      )}
    </>
  )
}

interface AutoBuyInfoSectionControlProps {
    addTxData: AutomationBotAddTriggerData
    priceInfo: PriceInfo
    vault: Vault
    basicBuyState: BasicBSFormChange
}
  

function AutoBuyInfoSectionControl({
    addTxData,
    priceInfo,
    vault,
    basicBuyState,
  }: AutoBuyInfoSectionControlProps) {
    const { addGasEstimation$, tokenPriceUSD$ } = useAppContext()
    const _tokenPriceUSD$ = useMemo(() => tokenPriceUSD$([vault.token]), [vault.token])
  
    const addTriggerGasEstimationData$ = useMemo(() => {
      return addGasEstimation$(
        { gasEstimationStatus: GasEstimationStatus.unset },
        ({ estimateGas }) => estimateGas(addAutomationBotTrigger, addTxData),
      )
    }, [addTxData])
  
    const [addTriggerGasEstimationData] = useObservable(addTriggerGasEstimationData$)
    const [tokenPriceData] = useObservable(_tokenPriceUSD$)
    const marketPrice = tokenPriceData?.[vault.token] || priceInfo.currentCollateralPrice
    const gasEstimation = getEstimatedGasFeeText(addTriggerGasEstimationData)
  
    const { debtDelta, collateralDelta } = getVaultChange({
      currentCollateralPrice: priceInfo.currentCollateralPrice,
      marketPrice: marketPrice,
      slippage: basicBuyState.deviation.div(100),
      debt: vault.debt,
      lockedCollateral: vault.lockedCollateral,
      requiredCollRatio: basicBuyState.targetCollRatio.div(100),
      depositAmount: zero,
      paybackAmount: zero,
      generateAmount: zero,
      withdrawAmount: zero,
      OF: OAZO_FEE,
      FF: LOAN_FEE,
    })

    return (
        <BuyInfoSection
        colRatioAfterBuy={basicBuyState.targetCollRatio}
        multipleAfterBuy={one.div(basicBuyState.targetCollRatio.div(100).minus(one)).plus(one)}
          execCollRatio={basicBuyState.execCollRatio}
          nextBuyPrice={priceInfo.nextCollateralPrice}
          slippageLimit={basicBuyState.deviation}
          collateralAfterNextBuy={{
            value: vault.lockedCollateral,
            secondaryValue: vault.lockedCollateral.minus(collateralDelta.abs()).toFixed(2),
          }}
          outstandingDebtAfterNextBuy={{
            value: vault.debt,
            secondaryValue: vault.debt.minus(debtDelta.abs()),
          }}
          ethToBePurchased={collateralDelta.abs()}
          estimatedTransactionCost={gasEstimation}
        //   token={vault.token}
        />
      )
  }
  