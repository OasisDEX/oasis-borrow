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
import { getAutomationMetadata } from 'features/automation/common/state/automationMetadata'
import { useAutoBSstateInitialization } from 'features/automation/common/state/useAutoBSStateInitializator'
import { AutomationFeatures } from 'features/automation/common/types'
import {
  AutomationAutoBuyMetadata,
  defaultAutoBuyMetadata,
} from 'features/automation/optimization/autoBuy/state/automationAutoBuyMetadata'
import {
  AutomationAutoTakeProfitMetadata,
  defaultAutoTakeProfitMetadata,
} from 'features/automation/optimization/autoTakeProfit/state/automationAutoTakeProfitMetadata'
import {
  AutoTakeProfitTriggerData,
  defaultAutoTakeProfitData,
  extractAutoTakeProfitData,
} from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import { useAutoTakeProfitStateInitializator } from 'features/automation/optimization/autoTakeProfit/state/useAutoTakeProfitStateInitializator'
import {
  AutomationConstantMultipleMetadata,
  defaultConstantMultipleMetadata,
} from 'features/automation/optimization/constantMultiple/state/automationConstantMultipleMetadata'
import {
  ConstantMultipleTriggerData,
  defaultConstantMultipleData,
  extractConstantMultipleData,
} from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import { useConstantMultipleStateInitialization } from 'features/automation/optimization/constantMultiple/state/useConstantMultipleStateInitialization'
import {
  AutomationAutoSellMetadata,
  defaultAutoSellMetadata,
} from 'features/automation/protection/autoSell/state/automationAutoSellMetadata'
import {
  AutomationStopLossMetadata,
  defaultStopLossMetadata,
} from 'features/automation/protection/stopLoss/state/automationStopLossMetadata'
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
  automationTriggersData: TriggersData
  autoBuy: {
    autoBuyTriggerData: AutoBSTriggerData
    autoBuyMetadata: AutomationAutoBuyMetadata
  }
  autoSell: {
    autoSellTriggerData: AutoBSTriggerData
    autoSellMetadata: AutomationAutoSellMetadata
  }
  autoTakeProfit: {
    autoTakeProfitTriggerData: AutoTakeProfitTriggerData
    autoTakeProfitMetadata: AutomationAutoTakeProfitMetadata
  }
  constantMultiple: {
    constantMultipleTriggerData: ConstantMultipleTriggerData
    constantMultipleMetadata: AutomationConstantMultipleMetadata
  }
  stopLoss: {
    stopLossTriggerData: StopLossTriggerData
    stopLossMetadata: AutomationStopLossMetadata
  }
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
  automationTriggersData: { isAutomationEnabled: false, triggers: [] },
  autoBuy: {
    autoBuyTriggerData: defaultAutoBSData,
    autoBuyMetadata: defaultAutoBuyMetadata,
  },
  autoSell: {
    autoSellTriggerData: defaultAutoBSData,
    autoSellMetadata: defaultAutoSellMetadata,
  },
  autoTakeProfit: {
    autoTakeProfitTriggerData: defaultAutoTakeProfitData,
    autoTakeProfitMetadata: defaultAutoTakeProfitMetadata,
  },
  constantMultiple: {
    constantMultipleTriggerData: defaultConstantMultipleData,
    constantMultipleMetadata: defaultConstantMultipleMetadata,
  },
  stopLoss: {
    stopLossTriggerData: defaultStopLossData,
    stopLossMetadata: defaultStopLossMetadata,
  },
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

  const [automationState, setAutomationState] = useState<AutomationContext>({
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
    stopLossTriggerData: automationState.stopLoss.stopLossTriggerData,
  })

  useAutoBSstateInitialization({
    autoTriggersData: automationState.autoSell.autoSellTriggerData,
    stopLossTriggerData: automationState.stopLoss.stopLossTriggerData,
    collateralizationRatio: positionData.collateralizationRatio,
    type: TriggerType.BasicSell,
  })

  useAutoBSstateInitialization({
    autoTriggersData: automationState.autoBuy.autoBuyTriggerData,
    stopLossTriggerData: automationState.stopLoss.stopLossTriggerData,
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
    stopLossTriggerData: automationState.stopLoss.stopLossTriggerData,
    autoSellTriggerData: automationState.autoSell.autoSellTriggerData,
    autoBuyTriggerData: automationState.autoBuy.autoBuyTriggerData,
    constantMultipleTriggerData: automationState.constantMultiple.constantMultipleTriggerData,
  })

  useAutoTakeProfitStateInitializator({
    debt: positionData.debt,
    lockedCollateral: positionData.lockedCollateral,
    collateralizationRatio: positionData.collateralizationRatio,
    autoTakeProfitTriggerData: automationState.autoTakeProfit.autoTakeProfitTriggerData,
  })

  useEffect(() => {
    if (automationTriggersData) {
      setAutomationState({
        autoBuy: {
          autoBuyTriggerData: extractAutoBSData({
            triggersData: automationTriggersData,
            triggerType: TriggerType.BasicBuy,
          }),
          autoBuyMetadata: getAutomationMetadata<AutomationFeatures.AUTO_BUY>(
            AutomationFeatures.AUTO_BUY,
            vaultProtocol,
          ),
        },
        autoSell: {
          autoSellTriggerData: extractAutoBSData({
            triggersData: automationTriggersData,
            triggerType: TriggerType.BasicSell,
          }),
          autoSellMetadata: getAutomationMetadata<AutomationFeatures.AUTO_SELL>(
            AutomationFeatures.AUTO_SELL,
            vaultProtocol,
          ),
        },
        autoTakeProfit: {
          autoTakeProfitTriggerData: extractAutoTakeProfitData(automationTriggersData),
          autoTakeProfitMetadata: getAutomationMetadata<AutomationFeatures.AUTO_TAKE_PROFIT>(
            AutomationFeatures.AUTO_TAKE_PROFIT,
            vaultProtocol,
          ),
        },
        constantMultiple: {
          constantMultipleTriggerData: extractConstantMultipleData(automationTriggersData),
          constantMultipleMetadata: getAutomationMetadata<AutomationFeatures.CONSTANT_MULTIPLE>(
            AutomationFeatures.CONSTANT_MULTIPLE,
            vaultProtocol,
          ),
        },
        stopLoss: {
          stopLossTriggerData: extractStopLossData(automationTriggersData),
          stopLossMetadata: getAutomationMetadata<AutomationFeatures.STOP_LOSS>(
            AutomationFeatures.STOP_LOSS,
            vaultProtocol,
          ),
        },
        automationTriggersData,
        environmentData,
        positionData,
        vaultProtocol,
      })
    }
  }, [automationTriggersData, environmentData, positionData, vaultProtocol])

  return <automationContext.Provider value={automationState}>{children}</automationContext.Provider>
}
