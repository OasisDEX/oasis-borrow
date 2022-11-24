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
import { initializeMetadata } from 'features/automation/metadata/helpers'
import {
  AutomationDefinitionMetadata,
  OverwriteTriggersDefaults,
  StopLossMetadata,
} from 'features/automation/metadata/types'
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
import { useStopLossStateInitialization } from 'features/automation/protection/stopLoss/state/useStopLossStateInitialization'
import { VaultType } from 'features/generalManageVault/vaultType'
import { VaultProtocol } from 'helpers/getVaultProtocol'
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

export interface AutomationCommonData {
  nextCollateralPrice: BigNumber
  token: string
  controller?: string
}

export interface AutomationPositionData {
  positionRatio: BigNumber
  nextPositionRatio: BigNumber
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
  debtToken: string
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
  metadata: {
    stopLoss: StopLossMetadata
  }
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

const defaultAutomationTriggersData: TriggersData = { isAutomationEnabled: false, triggers: [] }

const automationContextInitialState = {
  autoBuyTriggerData: defaultAutoBSData,
  autoSellTriggerData: defaultAutoBSData,
  stopLossTriggerData: defaultStopLossData,
  constantMultipleTriggerData: defaultConstantMultipleData,
  autoTakeProfitTriggerData: defaultAutoTakeProfitData,
  automationTriggersData: defaultAutomationTriggersData,
}

export interface AutomationContextProviderProps {
  ethBalance: BigNumber
  context: Context
  ethAndTokenPricesData: Tickers
  positionData: AutomationPositionData
  commonData: AutomationCommonData
  protocol: VaultProtocol
  metadata: AutomationDefinitionMetadata
  overwriteTriggersDefaults?: OverwriteTriggersDefaults
}

export function AutomationContextProvider({
  children,
  ethBalance,
  context,
  ethAndTokenPricesData,
  protocol,
  positionData,
  commonData,
  metadata,
  overwriteTriggersDefaults = {},
}: PropsWithChildren<AutomationContextProviderProps>) {
  const { controller, nextCollateralPrice, token } = commonData

  if (!isAppContextAvailable()) {
    return null
  }

  // TODO we need to think how to separate context initialization for ilks eligible for auto and not eligible
  const tokenPriceResolved = ethAndTokenPricesData[token] || nextCollateralPrice

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
    ...overwriteTriggersDefaults,
    environmentData,
    positionData,
    protocol,
  }

  const initMetadata = useMemo(() => initializeMetadata(metadata, initialAutoContext), [])

  const [autoContext, setAutoContext] = useState<AutomationContext>({
    ...initialAutoContext,
    metadata: initMetadata,
  })

  const { automationTriggersData$ } = useAppContext()
  const autoTriggersData$ = automationTriggersData$(positionData.id)
  const [automationTriggersData] = useObservable(autoTriggersData$)

  useStopLossStateInitialization({
    positionRatio: positionData.positionRatio,
    stopLossTriggerData: autoContext.stopLossTriggerData,
    metadata: autoContext.metadata.stopLoss,
  })

  useAutoBSstateInitialization({
    autoTriggersData: autoContext.autoSellTriggerData,
    stopLossTriggerData: autoContext.stopLossTriggerData,
    positionRatio: positionData.positionRatio,
    type: TriggerType.BasicSell,
  })

  useAutoBSstateInitialization({
    autoTriggersData: autoContext.autoBuyTriggerData,
    stopLossTriggerData: autoContext.stopLossTriggerData,
    positionRatio: positionData.positionRatio,
    type: TriggerType.BasicBuy,
  })

  useConstantMultipleStateInitialization({
    ilk: positionData.ilk,
    debt: positionData.debt,
    debtFloor: positionData.debtFloor,
    liquidationRatio: positionData.liquidationRatio,
    positionRatio: positionData.positionRatio,
    lockedCollateral: positionData.lockedCollateral,
    stopLossTriggerData: autoContext.stopLossTriggerData,
    autoSellTriggerData: autoContext.autoSellTriggerData,
    autoBuyTriggerData: autoContext.autoBuyTriggerData,
    constantMultipleTriggerData: autoContext.constantMultipleTriggerData,
  })

  useAutoTakeProfitStateInitializator({
    debt: positionData.debt,
    lockedCollateral: positionData.lockedCollateral,
    positionRatio: positionData.positionRatio,
    autoTakeProfitTriggerData: autoContext.autoTakeProfitTriggerData,
  })

  useEffect(() => {
    const resolvedAutomationTriggersData = automationTriggersData || defaultAutomationTriggersData
    const update = {
      autoBuyTriggerData: extractAutoBSData({
        triggersData: resolvedAutomationTriggersData,
        triggerType: TriggerType.BasicBuy,
      }),
      autoSellTriggerData: extractAutoBSData({
        triggersData: resolvedAutomationTriggersData,
        triggerType: TriggerType.BasicSell,
      }),
      stopLossTriggerData: extractStopLossData(
        resolvedAutomationTriggersData,
        overwriteTriggersDefaults?.stopLossTriggerData,
      ),
      constantMultipleTriggerData: extractConstantMultipleData(resolvedAutomationTriggersData),
      autoTakeProfitTriggerData: extractAutoTakeProfitData(resolvedAutomationTriggersData),
      automationTriggersData: resolvedAutomationTriggersData,
      protocol,
      environmentData,
      positionData,
    }
    setAutoContext((prev) => ({
      ...prev,
      ...update,
      metadata: initializeMetadata(metadata, { ...prev, ...update }),
    }))
  }, [automationTriggersData, environmentData, positionData])

  return <automationContext.Provider value={autoContext}>{children}</automationContext.Provider>
}
