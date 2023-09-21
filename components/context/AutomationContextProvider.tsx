import { TriggerType } from '@oasisdex/automation'
import type BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import type { Context } from 'blockchain/network.types'
import { NetworkIds } from 'blockchain/networks'
import type { Tickers } from 'blockchain/prices.types'
import { isProductContextAvailable, useProductContext } from 'components/context'
import type { TriggersData } from 'features/automation/api/automationTriggersData.types'
import {
  defaultAutoBSData,
  extractAutoBSData,
} from 'features/automation/common/state/autoBSTriggerData'
import type { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData.types'
import { useAutoBSstateInitialization } from 'features/automation/common/state/useAutoBSStateInitializator'
import { initializeMetadata } from 'features/automation/metadata/helpers'
import type {
  AutoBSMetadata,
  AutomationDefinitionMetadata,
  AutoTakeProfitMetadata,
  ConstantMultipleMetadata,
  OverwriteTriggersDefaults,
  StopLossMetadata,
} from 'features/automation/metadata/types'
import { extractAutoTakeProfitData } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import type { AutoTakeProfitTriggerData } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData.types'
import { defaultAutoTakeProfitData } from 'features/automation/optimization/autoTakeProfit/state/defaultAutoTakeProfitData'
import { useAutoTakeProfitStateInitializator } from 'features/automation/optimization/autoTakeProfit/state/useAutoTakeProfitStateInitializator'
import { extractConstantMultipleData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import { defaultConstantMultipleData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData.constants'
import type { ConstantMultipleTriggerData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData.types'
import { useConstantMultipleStateInitialization } from 'features/automation/optimization/constantMultiple/state/useConstantMultipleStateInitialization'
import { extractStopLossData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { defaultStopLossData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData.constants'
import type { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData.types'
import { useStopLossStateInitialization } from 'features/automation/protection/stopLoss/state/useStopLossStateInitialization'
import type { VaultType } from 'features/generalManageVault/vaultType.types'
import type { VaultProtocol } from 'helpers/getVaultProtocol'
import { useObservable } from 'helpers/observableHook'
import type { PropsWithChildren } from 'react'
import React, { useContext, useEffect, useMemo, useState } from 'react'

export interface AutomationEnvironmentData {
  canInteract: boolean
  ethBalance: BigNumber
  etherscanUrl: string
  ethMarketPrice: BigNumber
  nextCollateralPrice: BigNumber
  tokenMarketPrice: BigNumber
  chainId: NetworkIds
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

const automationTriggersDataInitialState = {
  isAutomationEnabled: false,
  triggers: [],
  isAutomationDataLoaded: false,
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

  if (!isProductContextAvailable()) {
    return null
  }

  // TODO we need to think how to separate context initialization for ilks eligible for auto and not eligible
  const tokenPriceResolved = ethAndTokenPricesData[token] || nextCollateralPrice

  const environmentData = useMemo(
    () => ({
      canInteract: context.status === 'connected' && context.account === controller,
      ethBalance,
      etherscanUrl: getNetworkContracts(NetworkIds.MAINNET, context.chainId).etherscan.url,
      ethMarketPrice: ethAndTokenPricesData['ETH'],
      nextCollateralPrice,
      tokenMarketPrice: tokenPriceResolved,
      chainId:
        context.chainId === NetworkIds.GOERLI || context.chainId === NetworkIds.MAINNET
          ? context.chainId
          : NetworkIds.MAINNET,
    }),
    [
      context.status,
      context.chainId,
      ethAndTokenPricesData['ETH'].toString(),
      tokenPriceResolved.toString(),
      ethBalance.toString(),
      controller,
    ],
  )

  // I moved it here because I had an error in test: `ReferenceError: Cannot access 'defaultAutoBSData' before initialization`
  const automationContextInitialState = {
    autoBuyTriggerData: defaultAutoBSData,
    autoSellTriggerData: defaultAutoBSData,
    autoTakeProfitTriggerData: defaultAutoTakeProfitData,
    constantMultipleTriggerData: defaultConstantMultipleData,
    stopLossTriggerData: defaultStopLossData,
  }

  const initialAutoContext = {
    automationTriggersData: {
      ...automationTriggersDataInitialState,
      chainId: environmentData.chainId,
    },
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

  const { automationTriggersData$ } = useProductContext()
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
    const resolvedAutomationTriggersData = {
      ...(automationTriggersData ?? automationTriggersDataInitialState),
      chainId: environmentData.chainId,
    }
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
          overwriteTriggersDefaults.stopLossTriggerData,
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
