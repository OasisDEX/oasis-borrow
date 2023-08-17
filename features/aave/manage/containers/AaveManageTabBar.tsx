import { useActor } from '@xstate/react'
import { useAutomationContext } from 'components/AutomationContextProvider'
import { TabBar } from 'components/TabBar'
import { DisabledHistoryControl, HistoryControl } from 'components/vault/HistoryControl'
import { ProtectionControl } from 'components/vault/ProtectionControl'
import { isAaveHistorySupported } from 'features/aave/helpers'
import { supportsAaveStopLoss } from 'features/aave/helpers/supportsAaveStopLoss'
import { useManageAaveStateMachineContext } from 'features/aave/manage/containers/AaveManageStateMachineContext'
import { SidebarManageAaveVault } from 'features/aave/manage/sidebars/SidebarManageAaveVault'
import { IStrategyConfig } from 'features/aave/types/strategy-config'
import { isSupportedAaveAutomationTokenPair } from 'features/automation/common/helpers'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { ReserveConfigurationData, ReserveData } from 'lendingProtocols/aaveCommon'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Grid } from 'theme-ui'

interface AaveManageTabBarProps {
  aaveReserveState: ReserveConfigurationData
  aaveReserveDataDebtToken: ReserveData
  strategyConfig: IStrategyConfig
}

export function AaveManageTabBar({
  strategyConfig,
  aaveReserveState,
  aaveReserveDataDebtToken,
}: AaveManageTabBarProps) {
  const { t } = useTranslation()
  const aaveProtection = useFeatureToggle('AaveV3Protection')
  const {
    automationTriggersData: { isAutomationDataLoaded },
    triggerData: { stopLossTriggerData },
  } = useAutomationContext()
  const { stateMachine } = useManageAaveStateMachineContext()
  const [state] = useActor(stateMachine)

  const VaultDetails = strategyConfig.viewComponents.vaultDetailsManage
  const PositionInfo = strategyConfig.viewComponents.positionInfo

  const {
    tokens: { collateral: collateralToken, debt: debtToken },
  } = state.context

  const protectionEnabled = stopLossTriggerData.isStopLossEnabled
  const showAutomationTabs = isSupportedAaveAutomationTokenPair(collateralToken, debtToken)

  const isClosingPosition = state.matches('frontend.reviewingClosing')
  const hasCloseTokenSet = !!state.context.manageTokenInput?.closingToken

  const adjustingTouched = state.matches('frontend.editing') && state.context.userInput.riskRatio
  const manageTouched =
    (state.matches('frontend.manageCollateral') || state.matches('frontend.manageDebt')) &&
    supportsAaveStopLoss(strategyConfig.protocol, strategyConfig.networkId) &&
    state.context.manageTokenInput?.manageTokenActionValue
  const nextPosition =
    adjustingTouched || manageTouched || (isClosingPosition && hasCloseTokenSet)
      ? state.context.transition?.simulation.position
      : undefined

  const historyIsSupported = isAaveHistorySupported(state.context.strategyConfig.networkId)

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
                currentPosition={state.context.currentPosition}
                collateralPrice={state.context.collateralPrice}
                tokenPrice={state.context.tokenPrice}
                debtPrice={state.context.debtPrice}
                nextPosition={nextPosition}
                dpmProxy={state.context.effectiveProxyAddress}
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
                  active: protectionEnabled,
                  isLoading: !isAutomationDataLoaded,
                },
                content: <ProtectionControl />,
              },
            ]
          : []),
        ...(historyIsSupported === undefined
          ? []
          : historyIsSupported
          ? [
              // Implement HistoryControl for AAVE V3
              {
                value: 'history',
                label: t('system.history'),
                content: <HistoryControl vaultHistory={[]} />,
              }
            ]
          : [
              {
                value: 'history',
                label: t('system.history'),
                content: <DisabledHistoryControl />,
              },
            ]),
      ]}
    />
  )
}
