import { TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import { Tickers } from 'blockchain/prices'
import { isAppContextAvailable, useAppContext } from 'components/AppContextProvider'
import { TriggersData } from 'features/automation/api/automationTriggersData'
import {
  AutoBSTriggerData,
  defaultAutoBSData,
  extractAutoBSData,
} from 'features/automation/common/state/autoBSTriggerData'
import { useAutoBSstateInitialization } from 'features/automation/common/state/useAutoBSStateInitializator'
import {
  AutoTakeProfitTriggerData,
  defaultAutoTakeProfitData,
  extractAutoTakeProfitData,
} from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import { useAutoTakeProfitStateInitializator } from 'features/automation/optimization/autoTakeProfit/state/useAutoTakeProfitStateInitializator'
import {
  ConstantMultipleTriggerData,
  defaultConstantMultipleData,
  extractConstantMultipleData,
} from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import { useConstantMultipleStateInitialization } from 'features/automation/optimization/constantMultiple/state/useConstantMultipleStateInitialization'
import {
  defaultStopLossData,
  extractStopLossData,
  StopLossTriggerData,
} from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { useStopLossStateInitializator } from 'features/automation/protection/stopLoss/state/useStopLossStateInitializator'
import { GeneralManageVaultState } from 'features/generalManageVault/generalManageVault'
import { VaultType } from 'features/generalManageVault/vaultType'
import { useObservable } from 'helpers/observableHook'
import React, { PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react'

// TODO INTERFACE THAT HAS TO BE ADJUSTED FOR ALL PROTOCOLS
interface AutomationCommonData {
  environmentInfo: {
    canInteract: boolean
    ethBalance: BigNumber
    ethMarketPrice: BigNumber
    tokenMarketPrice: BigNumber
    nextCollateralPrice: BigNumber
    etherscanUrl: string
  }
  positionInfo: {
    id: BigNumber
    token: string
    ilk: string
    debt: BigNumber
    debtOffset: BigNumber
    debtFloor: BigNumber
    lockedCollateral: BigNumber
    collateralizationRatio: BigNumber
    collateralizationRatioAtNextPrice: BigNumber
    liquidationRatio: BigNumber
    owner: string
    liquidationPenalty: BigNumber
    liquidationPrice: BigNumber
    vaultType: VaultType
  }
}

interface AutomationContext {
  autoSellTriggerData: AutoBSTriggerData
  autoBuyTriggerData: AutoBSTriggerData
  stopLossTriggerData: StopLossTriggerData
  constantMultipleTriggerData: ConstantMultipleTriggerData
  automationTriggersData: TriggersData
  autoTakeProfitTriggerData: AutoTakeProfitTriggerData
  commonData: AutomationCommonData
}

export const automationContext = React.createContext<AutomationContext | undefined>(undefined)

export function useAutomationContext(): AutomationContext {
  const ac = useContext(automationContext)
  if (!ac) {
    throw new Error(
      "AutomationContext not available! useAutomationContext can't be used serverside",
    )
  }
  return ac
}

/*
  This component is providing computed data from cache about active automation triggers on the vault
*/

const automationContextInitialState = {
  autoBuyTriggerData: defaultAutoBSData,
  autoSellTriggerData: defaultAutoBSData,
  stopLossTriggerData: defaultStopLossData,
  constantMultipleTriggerData: defaultConstantMultipleData,
  autoTakeProfitTriggerData: defaultAutoTakeProfitData,
  automationTriggersData: { isAutomationEnabled: false, triggers: [] },
}

export interface AutomationContextProviderProps {
  generalManageVault: GeneralManageVaultState
  context: Context
  ethAndTokenPricesData: Tickers
}

export function AutomationContextProvider({
  children,
  generalManageVault,
  context,
  ethAndTokenPricesData,
}: PropsWithChildren<AutomationContextProviderProps>) {
  const {
    balanceInfo: { ethBalance },
    vault: {
      id,
      token,
      ilk,
      debt,
      debtOffset,
      owner,
      controller,
      lockedCollateral,
      collateralizationRatio,
      collateralizationRatioAtNextPrice,
      liquidationPrice,
    },
    priceInfo: { nextCollateralPrice },
    ilkData: { liquidationRatio, debtFloor, liquidationPenalty },
  } = generalManageVault.state

  if (!isAppContextAvailable()) {
    return null
  }

  const commonData = useMemo(
    () => ({
      environmentInfo: {
        canInteract: context.status === 'connected' && context.account === controller,
        etherscanUrl: context.etherscan.url,
        ethBalance,
        nextCollateralPrice,
        ethMarketPrice: ethAndTokenPricesData['ETH'],
        tokenMarketPrice: ethAndTokenPricesData[token],
      },
      positionInfo: {
        id,
        token,
        ilk,
        debt,
        debtFloor,
        debtOffset,
        lockedCollateral,
        collateralizationRatio,
        collateralizationRatioAtNextPrice,
        owner,
        liquidationRatio,
        liquidationPrice,
        liquidationPenalty,
        vaultType: generalManageVault.type,
      },
    }),
    [
      context.status,
      controller,
      ethBalance.toString(),
      nextCollateralPrice.toString(),
      ethAndTokenPricesData['ETH'].toString(),
      ethAndTokenPricesData[token].toString(),
      id.toString(),
      token,
      ilk,
      debt.toString(),
      debtFloor.toString(),
      debtOffset.toString(),
      lockedCollateral.toString(),
      collateralizationRatio.toString(),
      collateralizationRatioAtNextPrice.toString(),
      owner,
      liquidationRatio.toString(),
      liquidationPrice.toString(),
      liquidationPenalty.toString(),
      generalManageVault.type,
    ],
  )

  const [autoContext, setAutoContext] = useState<AutomationContext>({
    ...automationContextInitialState,
    commonData,
  })

  const { automationTriggersData$ } = useAppContext()
  const autoTriggersData$ = automationTriggersData$(id)
  const [automationTriggersData] = useObservable(autoTriggersData$)

  useStopLossStateInitializator({
    liquidationRatio,
    collateralizationRatio,
    stopLossTriggerData: autoContext.stopLossTriggerData,
  })

  useAutoBSstateInitialization({
    autoTriggersData: autoContext.autoSellTriggerData,
    stopLossTriggerData: autoContext.stopLossTriggerData,
    collateralizationRatio,
    type: TriggerType.BasicSell,
  })

  useAutoBSstateInitialization({
    autoTriggersData: autoContext.autoBuyTriggerData,
    stopLossTriggerData: autoContext.stopLossTriggerData,
    collateralizationRatio,
    type: TriggerType.BasicBuy,
  })

  useConstantMultipleStateInitialization({
    ilk,
    debt,
    debtFloor,
    liquidationRatio,
    collateralizationRatio,
    lockedCollateral,
    stopLossTriggerData: autoContext.stopLossTriggerData,
    autoSellTriggerData: autoContext.autoSellTriggerData,
    autoBuyTriggerData: autoContext.autoBuyTriggerData,
    constantMultipleTriggerData: autoContext.constantMultipleTriggerData,
  })

  useAutoTakeProfitStateInitializator({
    debt,
    lockedCollateral,
    collateralizationRatio,
    autoTakeProfitTriggerData: autoContext.autoTakeProfitTriggerData,
  })

  useEffect(() => {
    if (automationTriggersData) {
      setAutoContext({
        autoBuyTriggerData: extractAutoBSData({
          triggersData: automationTriggersData,
          triggerType: TriggerType.BasicBuy,
        }),
        autoSellTriggerData: extractAutoBSData({
          triggersData: automationTriggersData,
          triggerType: TriggerType.BasicSell,
        }),
        stopLossTriggerData: extractStopLossData(automationTriggersData),
        constantMultipleTriggerData: extractConstantMultipleData(automationTriggersData),
        autoTakeProfitTriggerData: extractAutoTakeProfitData(automationTriggersData),
        automationTriggersData,
        commonData,
      })
    }
  }, [automationTriggersData, commonData])

  return <automationContext.Provider value={autoContext}>{children}</automationContext.Provider>
}
