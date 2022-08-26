import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { TxHelpers, UIChanges } from 'components/AppContext'
import { useAppContext } from 'components/AppContextProvider'
import { useSharedUI } from 'components/SharedUIProvider'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/common/constantMultipleTriggerData'
import { StopLossTriggerData } from 'features/automation/protection/common/stopLossTriggerData'
import { accountIsConnectedValidator } from 'features/form/commonValidators'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { PriceInfo } from 'features/shared/priceInfo'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React, { useEffect } from 'react'

import {
  AutomationFromKind,
  PROTECTION_MODE_CHANGE_SUBJECT,
  ProtectionModeChange,
} from '../common/UITypes/ProtectionFormModeChange'
import { AdjustSlFormControl } from './AdjustSlFormControl'
import { CancelSlFormControl } from './CancelSlFormControl'

interface StopLossFormsProps {
  context: Context
  currentForm: ProtectionModeChange
  vault: Vault
  ilkData: IlkData
  uiChanges: UIChanges
  priceInfo: PriceInfo
  balanceInfo: BalanceInfo
  accountIsController: boolean
  stopLossTriggerData: StopLossTriggerData
  autoSellTriggerData: BasicBSTriggerData
  autoBuyTriggerData: BasicBSTriggerData
  constantMultipleTriggerData: ConstantMultipleTriggerData
  ethMarketPrice: BigNumber
  shouldRemoveAllowance: boolean
  txHelpers?: TxHelpers
}

function StopLossForms({
  context,
  currentForm,
  vault,
  ilkData,
  uiChanges,
  priceInfo,
  balanceInfo,
  txHelpers,
  accountIsController,
  stopLossTriggerData,
  autoSellTriggerData,
  autoBuyTriggerData,
  constantMultipleTriggerData,
  ethMarketPrice,
  shouldRemoveAllowance,
}: StopLossFormsProps) {
  return currentForm?.currentMode === AutomationFromKind.CANCEL ? (
    <CancelSlFormControl
      vault={vault}
      ilkData={ilkData}
      triggerData={stopLossTriggerData}
      tx={txHelpers}
      ctx={context}
      accountIsController={accountIsController}
      toggleForms={() => {
        uiChanges.publish(PROTECTION_MODE_CHANGE_SUBJECT, {
          currentMode: AutomationFromKind.ADJUST,
          type: 'change-mode',
        })
      }}
      priceInfo={priceInfo}
      balanceInfo={balanceInfo}
      ethMarketPrice={ethMarketPrice}
      shouldRemoveAllowance={shouldRemoveAllowance}
    />
  ) : (
    <AdjustSlFormControl
      vault={vault}
      priceInfo={priceInfo}
      ilkData={ilkData}
      triggerData={stopLossTriggerData}
      autoSellTriggerData={autoSellTriggerData}
      autoBuyTriggerData={autoBuyTriggerData}
      constantMultipleTriggerData={constantMultipleTriggerData}
      tx={txHelpers}
      ctx={context}
      accountIsController={accountIsController}
      toggleForms={() => {
        uiChanges.publish(PROTECTION_MODE_CHANGE_SUBJECT, {
          type: 'change-mode',
          currentMode: AutomationFromKind.CANCEL,
        })
      }}
      balanceInfo={balanceInfo}
      ethMarketPrice={ethMarketPrice}
    />
  )
}

interface StopLossFormControlProps {
  ilkData: IlkData
  stopLossTriggerData: StopLossTriggerData
  autoSellTriggerData: BasicBSTriggerData
  autoBuyTriggerData: BasicBSTriggerData
  constantMultipleTriggerData: ConstantMultipleTriggerData
  priceInfo: PriceInfo
  vault: Vault
  balanceInfo: BalanceInfo
  isStopLossActive: boolean
  txHelpers?: TxHelpers
  context: Context
  ethMarketPrice: BigNumber
  account?: string
  shouldRemoveAllowance: boolean
}

export function StopLossFormControl({
  ilkData,
  stopLossTriggerData,
  autoSellTriggerData,
  autoBuyTriggerData,
  constantMultipleTriggerData,
  priceInfo,
  vault,
  account,
  isStopLossActive,
  balanceInfo,
  context,
  txHelpers,
  ethMarketPrice,
  shouldRemoveAllowance,
}: StopLossFormControlProps) {
  const { uiChanges } = useAppContext()
  const { setVaultFormOpened } = useSharedUI()
  const isTouchDevice = window && 'ontouchstart' in window

  const basicBSEnabled = useFeatureToggle('BasicBS')

  useEffect(() => {
    if (isTouchDevice && !stopLossTriggerData.isStopLossEnabled) {
      setVaultFormOpened(true)
    }
  }, [])

  const [currentForm] = useUIChanges<ProtectionModeChange>(PROTECTION_MODE_CHANGE_SUBJECT)

  const accountIsConnected = accountIsConnectedValidator({ account })
  const accountIsController = accountIsConnected && account === vault.controller

  return basicBSEnabled ? (
    isStopLossActive ? (
      <StopLossForms
        currentForm={currentForm}
        txHelpers={txHelpers}
        context={context}
        vault={vault}
        ilkData={ilkData}
        uiChanges={uiChanges}
        priceInfo={priceInfo}
        balanceInfo={balanceInfo}
        accountIsController={accountIsController}
        stopLossTriggerData={stopLossTriggerData}
        autoSellTriggerData={autoSellTriggerData}
        autoBuyTriggerData={autoBuyTriggerData}
        constantMultipleTriggerData={constantMultipleTriggerData}
        ethMarketPrice={ethMarketPrice}
        shouldRemoveAllowance={shouldRemoveAllowance}
      />
    ) : (
      <></>
    )
  ) : (
    <StopLossForms
      currentForm={currentForm}
      txHelpers={txHelpers}
      context={context}
      vault={vault}
      ilkData={ilkData}
      uiChanges={uiChanges}
      priceInfo={priceInfo}
      balanceInfo={balanceInfo}
      accountIsController={accountIsController}
      stopLossTriggerData={stopLossTriggerData}
      autoSellTriggerData={autoSellTriggerData}
      autoBuyTriggerData={autoBuyTriggerData}
      constantMultipleTriggerData={constantMultipleTriggerData}
      ethMarketPrice={ethMarketPrice}
      shouldRemoveAllowance={shouldRemoveAllowance}
    />
  )
}
