import { useActor } from '@xstate/react'
import { AaveReserveConfigurationData } from 'blockchain/calls/aave/aaveProtocolDataProvider'
import { useAutomationContext } from 'components/AutomationContextProvider'
import { TabBar } from 'components/TabBar'
import { ProtectionControl } from 'components/vault/ProtectionControl'
import { IStrategyConfig } from 'features/aave/common/StrategyConfigTypes'
import { PreparedAaveReserveData } from 'features/aave/helpers/aavePrepareReserveData'
import { useManageAaveStateMachineContext } from 'features/aave/manage/containers/AaveManageStateMachineContext'
import { SidebarManageAaveVault } from 'features/aave/manage/sidebars/SidebarManageAaveVault'
import { isSupportedAutomationTokenPair } from 'features/automation/common/helpers'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Card, Grid } from 'theme-ui'

interface AaveManageTabBarProps {
  aaveReserveState: AaveReserveConfigurationData
  aaveReserveDataDebtToken: PreparedAaveReserveData
  strategyConfig: IStrategyConfig
}

export function AaveManageTabBar({
  strategyConfig,
  aaveReserveState,
  aaveReserveDataDebtToken,
}: AaveManageTabBarProps) {
  const { t } = useTranslation()
  const aaveProtection = useFeatureToggle('AaveProtection')
  const {
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
  const showAutomationTabs = isSupportedAutomationTokenPair(collateralToken, debtToken)

  return (
    <TabBar
      variant="underline"
      sections={[
        {
          value: 'overview',
          label: t('system.overview'),
          content: (
            <Grid variant="vaultContainer">
              <Box>
                <VaultDetails
                  aaveReserveState={aaveReserveState}
                  aaveReserveDataDebtToken={aaveReserveDataDebtToken}
                  strategyConfig={strategyConfig}
                  currentPosition={state.context.currentPosition}
                  collateralPrice={state.context.collateralPrice}
                  tokenPrice={state.context.tokenPrice}
                  debtPrice={state.context.debtPrice}
                  nextPosition={state.context.strategy?.simulation.position}
                />
              </Box>
              <Box>{<SidebarManageAaveVault />}</Box>
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
                tag: { include: true, active: protectionEnabled },
                content: <ProtectionControl />,
              },
            ]
          : []),
      ]}
    />
  )
}
