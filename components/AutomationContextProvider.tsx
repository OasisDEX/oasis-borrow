import { TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import { Tickers } from 'blockchain/prices'
import { isAppContextAvailable, useAppContext } from 'components/AppContextProvider'
import { TriggersData } from 'features/automation/api/automationTriggersData'
import { getAutomationEnvironment } from 'features/automation/common/context/getAutomationEnvironment'
import { getAutomationPositionData } from 'features/automation/common/context/getAutomationPositionData'
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
import { getVaultProtocol, VaultProtocol } from 'helpers/getVaultProtocol'
import { useObservable } from 'helpers/observableHook'
import React, { PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react'

export interface AutomationEnvironmentData {
  canInteract: boolean
  ethBalance: BigNumber
  etherscanUrl: string
  ethMarketPrice: BigNumber
  nextCollateralPrice: BigNumber
  tokenMarketPrice: BigNumber
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

interface AutomationContext {
  autoBuyTriggerData: AutoBSTriggerData
  automationTriggersData: TriggersData
  autoSellTriggerData: AutoBSTriggerData
  autoTakeProfitTriggerData: AutoTakeProfitTriggerData
  constantMultipleTriggerData: ConstantMultipleTriggerData
  stopLossTriggerData: StopLossTriggerData
  environmentData: AutomationEnvironmentData
  positionData: AutomationPositionData
  vaultProtocol: VaultProtocol
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
  const vaultProtocol = getVaultProtocol()
  const { controller, ethBalance, nextCollateralPrice, token } = getAutomationEnvironment({
    generalManageVault,
    vaultProtocol,
  })

  if (!isAppContextAvailable()) {
    return null
  }

  const environmentData = useMemo(
    () => ({
      canInteract: context.status === 'connected' && context.account === controller,
      ethBalance,
      etherscanUrl: context.etherscan.url,
      ethMarketPrice: ethAndTokenPricesData['ETH'],
      nextCollateralPrice,
      tokenMarketPrice: ethAndTokenPricesData[token],
    }),
    [
      context.status,
      generalManageVault,
      ethAndTokenPricesData['ETH'].toString(),
      ethAndTokenPricesData[token].toString(),
    ],
  )
  const positionData = useMemo(
    () => getAutomationPositionData({ generalManageVault, vaultProtocol }),
    [generalManageVault, vaultProtocol],
  )

  const [autoContext, setAutoContext] = useState<AutomationContext>({
    ...automationContextInitialState,
    environmentData,
    positionData,
    vaultProtocol,
  })

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
        environmentData,
        positionData,
        vaultProtocol,
      })
    }
  }, [automationTriggersData, environmentData, positionData])

  return <automationContext.Provider value={autoContext}>{children}</automationContext.Provider>
}
