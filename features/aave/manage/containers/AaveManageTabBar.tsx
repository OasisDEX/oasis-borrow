import { useActor } from '@xstate/react'
import { useAutomationContext } from 'components/context/AutomationContextProvider'
import { PositionHistory } from 'components/history/PositionHistory'
import type { TabSection } from 'components/TabBar'
import { TabBar } from 'components/TabBar'
import { DisabledOptimizationControl } from 'components/vault/DisabledOptimizationControl'
import { DisabledProtectionControl } from 'components/vault/DisabledProtectionControl'
import { DisabledHistoryControl } from 'components/vault/HistoryControl'
import { isAaveHistorySupported } from 'features/aave/helpers'
import { supportsAaveStopLoss } from 'features/aave/helpers/supportsAaveStopLoss'
import { useMinNetValue } from 'features/aave/hooks/useMinNetValue'
import {
  useManageAaveStateMachineContext,
  useTriggersAaveStateMachineContext,
} from 'features/aave/manage/contexts'
import { SidebarManageAaveVault } from 'features/aave/manage/sidebars/SidebarManageAaveVault'
import {
  areTriggersLoading,
  hasActiveOptimization,
  hasActiveProtection,
  isOptimizationEnabled,
} from 'features/aave/manage/state'
import { calculateUsdNetValueBasedOnState } from 'features/aave/services/calculate-usd-net-value'
import { type IStrategyConfig, ProxyType } from 'features/aave/types/strategy-config'
import { AutomationFeatures } from 'features/automation/common/types'
import { isShortPosition } from 'features/omni-kit/helpers'
import { useAppConfig } from 'helpers/config'
import type {
  AaveLikeReserveConfigurationData,
  AaveLikeReserveData,
} from 'lendingProtocols/aave-like-common'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Grid } from 'theme-ui'

import { OptimizationControl } from './OptimizationControl'
import { ProtectionControlWrapper } from './ProtectionControlWrapper'

interface AaveManageTabBarProps {
  aaveReserveState: AaveLikeReserveConfigurationData
  aaveReserveDataDebtToken: AaveLikeReserveData
  strategyConfig: IStrategyConfig
}

export function AaveManageTabBar({
  strategyConfig,
  aaveReserveState,
  aaveReserveDataDebtToken,
}: AaveManageTabBarProps) {
  const { t } = useTranslation()
  const { AaveV3Protection: aaveProtection, AaveV3History: aaveHistory } = useAppConfig('features')

  const minNetValue = useMinNetValue(strategyConfig)

  const {
    automationTriggersData: { isAutomationDataLoaded },
  } = useAutomationContext()
  const { stateMachine } = useManageAaveStateMachineContext()
  const [state] = useActor(stateMachine)
  const triggersStateMachine = useTriggersAaveStateMachineContext()
  const [triggersState, sendTriggerEvent] = useActor(triggersStateMachine)

  const VaultDetails = strategyConfig.viewComponents.vaultDetailsManage
  const PositionInfo = strategyConfig.viewComponents.positionInfo

  const {
    tokens: { collateral: collateralToken, debt: debtToken },
  } = state.context

  const showAutomationTabs =
    strategyConfig.isAutomationFeatureEnabled(AutomationFeatures.STOP_LOSS) ||
    strategyConfig.isAutomationFeatureEnabled(AutomationFeatures.AUTO_SELL)

  const isClosingPosition = state.matches('frontend.reviewingClosing')
  const hasCloseTokenSet = !!state.context.manageTokenInput?.closingToken

  const adjustingTouched = state.matches('frontend.editing') && state.context.userInput.riskRatio
  const manageTouched =
    (state.matches('frontend.manageCollateral') || state.matches('frontend.manageDebt')) &&
    supportsAaveStopLoss(strategyConfig.protocol, strategyConfig.networkId) &&
    state.context.manageTokenInput?.manageInput1Value

  const nextPosition =
    adjustingTouched || manageTouched || (isClosingPosition && hasCloseTokenSet)
      ? state.context.transition?.simulation.position
      : undefined

  const historyIsSupported =
    aaveHistory &&
    isAaveHistorySupported(
      state.context.strategyConfig.networkId,
      state.context.strategyConfig.proxyType,
    )

  const isOptimizationTabEnabled = isOptimizationEnabled(triggersState)
  const isOptimizationTabLoading = areTriggersLoading(triggersState)
  const hasActiveOptimizationTrigger = hasActiveOptimization(triggersState)
  const hasActiveProtectionTrigger = hasActiveProtection(triggersState)

  const netValue = calculateUsdNetValueBasedOnState(state.context)
  // get net value
  // get min net value from config
  // update banners
  const isProtectionAvailable = netValue.gte(minNetValue) || hasActiveProtectionTrigger
  const isOptimizationAvailable = netValue.gte(minNetValue) || hasActiveOptimizationTrigger

  const optimizationTab: TabSection[] = isOptimizationTabEnabled
    ? [
        {
          value: 'optimization',
          label: t('system.optimization'),
          content:
            isOptimizationAvailable && triggersState ? (
              <OptimizationControl
                triggersState={triggersState}
                sendTriggerEvent={sendTriggerEvent}
              />
            ) : (
              <DisabledOptimizationControl minNetValue={minNetValue} />
            ),
          tag: {
            active: hasActiveOptimizationTrigger,
            isLoading: isOptimizationTabLoading,
            include: true,
          },
        },
      ]
    : []

  return (
    <TabBar
      variant="underline"
      sections={[
        {
          value: 'overview',
          label: t('system.overview'),
          content: (
            <Grid variant="vaultContainer">
              <VaultDetails
                aaveReserveState={aaveReserveState}
                aaveReserveDataDebtToken={aaveReserveDataDebtToken}
                strategyConfig={strategyConfig}
                currentPosition={state.context.currentPosition!}
                collateralPrice={state.context.balance?.collateral.price}
                debtPrice={state.context.balance?.debt.price}
                nextPosition={nextPosition}
                cumulatives={state.context.cumulatives}
                dpmProxy={state.context.effectiveProxyAddress}
                triggersState={triggersState}
                sendTriggerEvent={sendTriggerEvent}
              />
              <SidebarManageAaveVault />
            </Grid>
          ),
        },
        {
          value: 'position-info',
          label: t('system.position-info'),
          content: (
            <Card variant="faq">
              <PositionInfo />
            </Card>
          ),
        },
        ...(aaveProtection && showAutomationTabs
          ? [
              {
                label: t('system.protection'),
                value: 'protection',
                tag: {
                  include: true,
                  active: hasActiveProtectionTrigger,
                  isLoading: !isAutomationDataLoaded,
                },
                content: isProtectionAvailable ? (
                  <ProtectionControlWrapper
                    triggersState={triggersState}
                    sendTriggerEvent={sendTriggerEvent}
                  />
                ) : (
                  <DisabledProtectionControl minNetValue={minNetValue} />
                ),
              },
            ]
          : []),
        ...optimizationTab,
        ...(historyIsSupported === undefined
          ? []
          : historyIsSupported
          ? [
              {
                value: 'history',
                label: t('system.history'),
                content: (
                  <PositionHistory
                    collateralToken={collateralToken}
                    historyEvents={state.context.historyEvents}
                    quoteToken={debtToken}
                    networkId={strategyConfig.networkId}
                    isShort={isShortPosition({ collateralToken })}
                  />
                ),
              },
            ]
          : [
              {
                value: 'history',
                label: t('system.history'),
                content: (
                  <DisabledHistoryControl
                    protocol={strategyConfig.protocol}
                    networkName={strategyConfig.network}
                    proxyVersion={
                      {
                        [ProxyType.DpmProxy]: 'DPM Proxy',
                        [ProxyType.DsProxy]: 'DS Proxy',
                      }[state.context.strategyConfig.proxyType]
                    }
                  />
                ),
              },
            ]),
      ]}
    />
  )
}
