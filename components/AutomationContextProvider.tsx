import { TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
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
  AutoBSMetadata,
  AutomationDefinitionMetadata,
  AutoTakeProfitMetadata,
  ConstantMultipleMetadata,
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
  controller?: string
  nextCollateralPrice: BigNumber
  token: string
}

export interface AutomationPositionData {
  debt: BigNumber
  debtFloor: BigNumber
  debtOffset: BigNumber
  debtToken: string
  id: BigNumber
  ilk: string
  liquidationPenalty: BigNumber
  liquidationPrice: BigNumber
  liquidationRatio: BigNumber
  lockedCollateral: BigNumber
  nextPositionRatio: BigNumber
  owner: string
  positionRatio: BigNumber
  token: string
  vaultType: VaultType
  debtTokenAddress?: string
  collateralTokenAddress?: string
}

export interface AutomationContext {
  automationTriggersData: TriggersData
  environmentData: AutomationEnvironmentData
  metadata: {
    autoBuyMetadata: AutoBSMetadata
    autoSellMetadata: AutoBSMetadata
    autoTakeProfitMetadata: AutoTakeProfitMetadata
    constantMultipleMetadata: ConstantMultipleMetadata
    stopLossMetadata: StopLossMetadata
  }
  positionData: AutomationPositionData
  protocol: VaultProtocol
  triggerData: {
    autoBuyTriggerData: AutoBSTriggerData
    autoSellTriggerData: AutoBSTriggerData
    autoTakeProfitTriggerData: AutoTakeProfitTriggerData
    constantMultipleTriggerData: ConstantMultipleTriggerData
    stopLossTriggerData: StopLossTriggerData
  }
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

const automationTriggersDataInitialState = { isAutomationEnabled: false, triggers: [] }
const automationContextInitialState = {
  autoBuyTriggerData: defaultAutoBSData,
  autoSellTriggerData: defaultAutoBSData,
  autoTakeProfitTriggerData: defaultAutoTakeProfitData,
  constantMultipleTriggerData: defaultConstantMultipleData,
  stopLossTriggerData: defaultStopLossData,
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
      etherscanUrl: getNetworkContracts(context.chainId).etherscan.url,
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
    automationTriggersData: automationTriggersDataInitialState,
    environmentData,
    positionData,
    protocol,
    triggerData: {
      ...automationContextInitialState,
      ...overwriteTriggersDefaults,
    },
  }

  const initializedMetadata = useMemo(
    () => initializeMetadata({ automationContext: initialAutoContext, metadata }),
    [],
  )

  const [autoContext, setAutoContext] = useState<AutomationContext>({
    ...initialAutoContext,
    metadata: initializedMetadata,
  })

  const { automationTriggersData$ } = useAppContext()
  const autoTriggersData$ = useMemo(
    () => automationTriggersData$(positionData.id),
    [positionData.id.toNumber()],
  )
  const [automationTriggersData] = useObservable(autoTriggersData$)

  useStopLossStateInitialization({
    stopLossTriggerData: autoContext.triggerData.stopLossTriggerData,
    metadata: autoContext.metadata.stopLossMetadata,
    positionRatio: positionData.positionRatio,
  })

  useAutoBSstateInitialization({
    autoTriggersData: autoContext.triggerData.autoSellTriggerData,
    stopLossTriggerData: autoContext.triggerData.stopLossTriggerData,
    positionRatio: positionData.positionRatio,
    type: TriggerType.BasicSell,
  })

  useAutoBSstateInitialization({
    autoTriggersData: autoContext.triggerData.autoBuyTriggerData,
    stopLossTriggerData: autoContext.triggerData.stopLossTriggerData,
    positionRatio: positionData.positionRatio,
    type: TriggerType.BasicBuy,
  })

  useConstantMultipleStateInitialization({
    autoBuyTriggerData: autoContext.triggerData.autoBuyTriggerData,
    autoSellTriggerData: autoContext.triggerData.autoSellTriggerData,
    constantMultipleTriggerData: autoContext.triggerData.constantMultipleTriggerData,
    stopLossTriggerData: autoContext.triggerData.stopLossTriggerData,
    debt: positionData.debt,
    debtFloor: positionData.debtFloor,
    ilk: positionData.ilk,
    liquidationRatio: positionData.liquidationRatio,
    lockedCollateral: positionData.lockedCollateral,
    positionRatio: positionData.positionRatio,
  })

  useAutoTakeProfitStateInitializator({
    autoTakeProfitTriggerData: autoContext.triggerData.autoTakeProfitTriggerData,
    debt: positionData.debt,
    lockedCollateral: positionData.lockedCollateral,
    positionRatio: positionData.positionRatio,
  })

  useEffect(() => {
    const resolvedAutomationTriggersData =
      automationTriggersData || automationTriggersDataInitialState
    const update = {
      automationTriggersData: resolvedAutomationTriggersData,
      environmentData,
      positionData,
      protocol,
      triggerData: {
        autoBuyTriggerData: extractAutoBSData({
          triggersData: resolvedAutomationTriggersData,
          triggerType: TriggerType.BasicBuy,
        }),
        autoSellTriggerData: extractAutoBSData({
          triggersData: resolvedAutomationTriggersData,
          triggerType: TriggerType.BasicSell,
        }),
        autoTakeProfitTriggerData: extractAutoTakeProfitData(resolvedAutomationTriggersData),
        constantMultipleTriggerData: extractConstantMultipleData(resolvedAutomationTriggersData),
        stopLossTriggerData: extractStopLossData(
          resolvedAutomationTriggersData,
          overwriteTriggersDefaults?.stopLossTriggerData,
        ),
      },
    }
    setAutoContext((prev) => ({
      ...prev,
      ...update,
      metadata: initializeMetadata({ automationContext: { ...prev, ...update }, metadata }),
    }))
  }, [automationTriggersData, environmentData, positionData])

  return <automationContext.Provider value={autoContext}>{children}</automationContext.Provider>
}
