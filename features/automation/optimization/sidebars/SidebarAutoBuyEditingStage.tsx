import { AutomationBotAddTriggerData } from 'blockchain/calls/automationBot'
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


interface SidebarAutoBuyEditingStageProps {
  vault: Vault
  ilkData: IlkData
  addTxData: AutomationBotAddTriggerData
  basicBuyState: BasicBSFormChange
}

export function SidebarAutoBuyEditingStage({
//   vault,
  ilkData,
  // isEditing,
//   addTxData,
  basicBuyState,
}: SidebarAutoBuyEditingStageProps) {
  const { uiChanges } = useAppContext()
  const { t } = useTranslation()

  // TODO to be updated
  const min = ilkData.liquidationRatio.plus(0.05).times(100).toNumber()
//   const max = basicBuyState.targetCollRatio ? basicBuyState.targetCollRatio.toNumber() : 500

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
          value0: basicBuyState.targetCollRatio.toNumber(),
          value1: basicBuyState.execCollRatio.toNumber(),
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
                amount={basicBuyState.maxBuyOrMinSellPrice}
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
          alert('Reset!')
        }}
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
    </>
  )
}
