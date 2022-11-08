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

interface AutomationEnvironmentData {
  canInteract: boolean
  ethBalance: BigNumber
  etherscanUrl: string
  ethMarketPrice: BigNumber
  nextCollateralPrice: BigNumber
  tokenMarketPrice: BigNumber
}

interface AutomationPositionData {
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
      controller,
      ethAndTokenPricesData['ETH'].toString(),
      ethAndTokenPricesData[token].toString(),
      ethBalance.toString(),
      nextCollateralPrice.toString(),
    ],
  )
  const positionData = useMemo(
    () => ({
      collateralizationRatio,
      collateralizationRatioAtNextPrice,
      debt,
      debtFloor,
      debtOffset,
      id,
      ilk,
      liquidationPenalty,
      liquidationPrice,
      liquidationRatio,
      lockedCollateral,
      owner,
      token,
      vaultType: generalManageVault.type,
    }),
    [
      collateralizationRatio.toString(),
      collateralizationRatioAtNextPrice.toString(),
      debt.toString(),
      debtFloor.toString(),
      debtOffset.toString(),
      generalManageVault.type,
      id.toString(),
      ilk,
      liquidationPenalty.toString(),
      liquidationPrice.toString(),
      liquidationRatio.toString(),
      lockedCollateral.toString(),
      owner,
      token,
    ],
  )

  const [autoContext, setAutoContext] = useState<AutomationContext>({
    ...automationContextInitialState,
    environmentData,
    positionData,
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
        environmentData,
        positionData,
      })
    }
  }, [automationTriggersData, environmentData, positionData])

  return <automationContext.Provider value={autoContext}>{children}</automationContext.Provider>
}
