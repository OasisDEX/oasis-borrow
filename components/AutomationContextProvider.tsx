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
import { VaultType } from 'features/generalManageVault/vaultType'
import { VaultProtocol } from 'helpers/getVaultProtocol'
import { useObservable } from 'helpers/observableHook'
import { zero } from 'helpers/zero'
import React, { PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react'

export interface AutomationEnvironmentData {
  canInteract: boolean
  ethBalance: BigNumber
  etherscanUrl: string
  ethMarketPrice: BigNumber
  nextCollateralPrice: BigNumber
  tokenMarketPrice: BigNumber
}

export interface AutomationCommonData {
  nextCollateralPrice: BigNumber
  token: string
  controller?: string
}

export interface AutomationPositionData {
  collateralizationRatio: BigNumber
  collateralizationRatioAtNextPrice: BigNumber
  debt: BigNumber
  debtFloor: BigNumber
  debtOffset: BigNumber
  id: BigNumber
  ilk: string
  liquidationPenalty: BigNumber
  liquidationPrice: BigNumber
  liquidationRatio: BigNumber
  lockedCollateral: BigNumber
  owner: string
  token: string
  vaultType: VaultType
}

export interface AutomationContext {
  autoBuyTriggerData: AutoBSTriggerData
  automationTriggersData: TriggersData
  autoSellTriggerData: AutoBSTriggerData
  autoTakeProfitTriggerData: AutoTakeProfitTriggerData
  constantMultipleTriggerData: ConstantMultipleTriggerData
  stopLossTriggerData: StopLossTriggerData
  environmentData: AutomationEnvironmentData
  positionData: AutomationPositionData
  protocol: VaultProtocol
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
  ethBalance: BigNumber
  context: Context
  ethAndTokenPricesData: Tickers
  positionData: AutomationPositionData
  commonData: AutomationCommonData
  protocol: VaultProtocol
}

export function AutomationContextProvider({
  children,
  ethBalance,
  context,
  ethAndTokenPricesData,
  protocol,
  positionData,
  commonData,
}: PropsWithChildren<AutomationContextProviderProps>) {
  const { controller, nextCollateralPrice, token } = commonData

  if (!isAppContextAvailable()) {
    return null
  }

  // TODO we need to think how to separate context initialization for ilks eligible for auto and not eligible
  const tokenPriceResolved = ethAndTokenPricesData[token] || zero

  const environmentData = useMemo(
    () => ({
      canInteract: context.status === 'connected' && context.account === controller,
      ethBalance,
      etherscanUrl: context.etherscan.url,
      ethMarketPrice: ethAndTokenPricesData['ETH'],
      nextCollateralPrice,
      tokenMarketPrice: tokenPriceResolved,
    }),
    [
      context.status,
      ethAndTokenPricesData['ETH'].toString(),
      tokenPriceResolved.toString(),
      ethBalance.toString(),
      controller,
    ],
  )

  const initialAutoContext = {
    ...automationContextInitialState,
    environmentData,
    positionData,
    protocol,
  }

  const [autoContext, setAutoContext] = useState<AutomationContext>(initialAutoContext)

  const { automationTriggersData$ } = useAppContext()
  const autoTriggersData$ = automationTriggersData$(positionData.id)
  const [automationTriggersData] = useObservable(autoTriggersData$)

  useStopLossStateInitializator({
    liquidationRatio: positionData.liquidationRatio,
    collateralizationRatio: positionData.collateralizationRatio,
    stopLossTriggerData: autoContext.stopLossTriggerData,
  })

  useAutoBSstateInitialization({
    autoTriggersData: autoContext.autoSellTriggerData,
    stopLossTriggerData: autoContext.stopLossTriggerData,
    collateralizationRatio: positionData.collateralizationRatio,
    type: TriggerType.BasicSell,
  })

  useAutoBSstateInitialization({
    autoTriggersData: autoContext.autoBuyTriggerData,
    stopLossTriggerData: autoContext.stopLossTriggerData,
    collateralizationRatio: positionData.collateralizationRatio,
    type: TriggerType.BasicBuy,
  })

  useConstantMultipleStateInitialization({
    ilk: positionData.ilk,
    debt: positionData.debt,
    debtFloor: positionData.debtFloor,
    liquidationRatio: positionData.liquidationRatio,
    collateralizationRatio: positionData.collateralizationRatio,
    lockedCollateral: positionData.lockedCollateral,
    stopLossTriggerData: autoContext.stopLossTriggerData,
    autoSellTriggerData: autoContext.autoSellTriggerData,
    autoBuyTriggerData: autoContext.autoBuyTriggerData,
    constantMultipleTriggerData: autoContext.constantMultipleTriggerData,
  })

  useAutoTakeProfitStateInitializator({
    debt: positionData.debt,
    lockedCollateral: positionData.lockedCollateral,
    collateralizationRatio: positionData.collateralizationRatio,
    autoTakeProfitTriggerData: autoContext.autoTakeProfitTriggerData,
  })

  useEffect(() => {
    if (automationTriggersData) {
      setAutoContext((prev) => ({
        ...prev,
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
        protocol,
      }))
    }
  }, [automationTriggersData])

  useEffect(() => {
    setAutoContext((prev) => ({ ...prev, environmentData, positionData }))
  }, [environmentData, positionData])

  return <automationContext.Provider value={autoContext}>{children}</automationContext.Provider>
}
