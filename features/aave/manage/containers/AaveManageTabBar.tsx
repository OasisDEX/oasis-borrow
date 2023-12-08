import { useActor } from '@xstate/react'
import { useAutomationContext } from 'components/context/AutomationContextProvider'
import { PositionHistory } from 'components/history/PositionHistory'
import { TabBar } from 'components/TabBar'
import { DisabledHistoryControl } from 'components/vault/HistoryControl'
import { ProtectionControl } from 'components/vault/ProtectionControl'
import { isAaveHistorySupported } from 'features/aave/helpers'
import { supportsAaveStopLoss } from 'features/aave/helpers/supportsAaveStopLoss'
import { useManageAaveStateMachineContext } from 'features/aave/manage/containers/AaveManageStateMachineContext'
import { SidebarManageAaveVault } from 'features/aave/manage/sidebars/SidebarManageAaveVault'
import type { IStrategyConfig } from 'features/aave/types/strategy-config'
import { isSupportedAaveAutomationTokenPair } from 'features/automation/common/helpers/isSupportedAaveAutomationTokenPair'
import { isShortPosition } from 'features/omni-kit/helpers'
import { useAppConfig } from 'helpers/config'
import type {
  AaveLikeReserveConfigurationData,
  AaveLikeReserveData,
} from 'lendingProtocols/aave-like-common'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Grid } from 'theme-ui'

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

  const historyIsSupported =
    aaveHistory && isAaveHistorySupported(state.context.strategyConfig.networkId)

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
                collateralPrice={state.context.collateralPrice}
                tokenPrice={state.context.tokenPrice}
                debtPrice={state.context.debtPrice}
                nextPosition={nextPosition}
                cumulatives={state.context.cumulatives}
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
                content: <DisabledHistoryControl protocol={strategyConfig.protocol} />,
              },
            ]),
      ]}
    />
  )
}
