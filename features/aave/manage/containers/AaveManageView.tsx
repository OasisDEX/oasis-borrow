import { useActor } from '@xstate/react'
import { AaveReserveConfigurationData } from 'blockchain/calls/aave/aaveProtocolDataProvider'
import { TabBar } from 'components/TabBar'
import { ProtectionControl } from 'components/vault/ProtectionControl'
import { isSupportedAutomationTokenPair } from 'features/automation/common/helpers'
import { AaveAutomationContext } from 'features/automation/contexts/AaveAutomationContext'
import { AaveFaq } from 'features/content/faqs/aave'
import { Survey } from 'features/survey'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Card, Container, Grid } from 'theme-ui'

import { AavePositionNoticesView } from '../../../notices/VaultsNoticesView'
import { useAaveContext } from '../../AaveContextProvider'
import { IStrategyConfig } from '../../common/StrategyConfigTypes'
import { PreparedAaveReserveData } from '../../helpers/aavePrepareReserveData'
import { SidebarManageAaveVault } from '../sidebars/SidebarManageAaveVault'
import { useManageAaveStateMachineContext } from './AaveManageStateMachineContext'

interface AaveManageViewPositionViewProps {
  address: string
  strategyConfig: IStrategyConfig
}

function AaveManageContainer({
  strategyConfig,
  aaveReserveState,
  aaveReserveDataDebtToken,
  address,
}: {
  aaveReserveState: AaveReserveConfigurationData
  aaveReserveDataDebtToken: PreparedAaveReserveData
  strategyConfig: IStrategyConfig
  address: string
}) {
  const { t } = useTranslation()
  const Header = strategyConfig.viewComponents.headerManage
  const VaultDetails = strategyConfig.viewComponents.vaultDetailsManage
  const { stateMachine } = useManageAaveStateMachineContext()
  const [state] = useActor(stateMachine)
  const aaveProtection = useFeatureToggle('AaveProtection')

  if (!state.context.protocolData) {
    return null
  }

  const {
    tokens: { collateral: collateralToken, debt: debtToken },
  } = state.context
  const showAutomationTabs = isSupportedAutomationTokenPair(collateralToken, debtToken)

  return (
    <AaveAutomationContext
      aaveManageVault={{
        address,
        aaveReserveState,
        strategyConfig,
        context: state.context,
      }}
    >
      <Container variant="vaultPageContainer">
        <Box mb={4}>
          <AavePositionNoticesView />
        </Box>
        <Header strategyConfig={strategyConfig} />
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
                  <AaveFaq />
                </Card>
              ),
            },
            ...(aaveProtection && showAutomationTabs
              ? [
                  {
                    label: t('system.protection'),
                    value: 'protection',
                    tag: { include: true, active: false },
                    content: <ProtectionControl />,
                  },
                ]
              : []),
          ]}
        />
        <Survey for="earn" />
      </Container>
    </AaveAutomationContext>
  )
}

export function AaveManagePositionView({
  address,
  strategyConfig,
}: AaveManageViewPositionViewProps) {
  const { aaveSTETHReserveConfigurationData, wrappedGetAaveReserveData$ } = useAaveContext()
  const [aaveReserveDataDebt, aaveReserveDataDebtError] = useObservable(
    wrappedGetAaveReserveData$(strategyConfig.tokens.debt),
  )
  const [aaveReserveState, aaveReserveStateError] = useObservable(aaveSTETHReserveConfigurationData)
  return (
    <WithErrorHandler error={[aaveReserveStateError, aaveReserveDataDebtError]}>
      <WithLoadingIndicator
        value={[aaveReserveState, aaveReserveDataDebt]}
        customLoader={<VaultContainerSpinner />}
      >
        {([_aaveReserveState, _aaveReserveDataDebt]) => {
          return (
            <AaveManageContainer
              strategyConfig={strategyConfig}
              aaveReserveState={_aaveReserveState}
              aaveReserveDataDebtToken={_aaveReserveDataDebt}
              address={address}
            />
          )
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
