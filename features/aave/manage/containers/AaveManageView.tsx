import { useActor } from '@xstate/react'
import { AaveV2ReserveConfigurationData } from 'blockchain/aave/aaveV2ProtocolDataProvider'
import { TabBar } from 'components/TabBar'
import { ProtectionControl } from 'components/vault/ProtectionControl'
import { isSupportedAutomationTokenPair } from 'features/automation/common/helpers'
import { AaveAutomationContext } from 'features/automation/contexts/AaveAutomationContext'
import { Survey } from 'features/survey'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Card, Container, Grid } from 'theme-ui'

import { PreparedAaveReserveData } from '../../../../lendingProtocols/aave-v2/pipelines'
import { AavePositionNoticesView } from '../../../notices/VaultsNoticesView'
import { useAaveContext } from '../../AaveContextProvider'
import { IStrategyConfig } from '../../common/StrategyConfigTypes'
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
  aaveReserveState: AaveV2ReserveConfigurationData
  aaveReserveDataDebtToken: PreparedAaveReserveData
  strategyConfig: IStrategyConfig
  address: string
}) {
  const { t } = useTranslation()
  const Header = strategyConfig.viewComponents.headerManage
  const VaultDetails = strategyConfig.viewComponents.vaultDetailsManage
  const PositionInfo = strategyConfig.viewComponents.positionInfo
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

  const isClosingPosition = state.matches('frontend.reviewingClosing')
  const hasCloseTokenSet = !!state.context.manageTokenInput?.closingToken

  const nextPosition =
    !isClosingPosition || hasCloseTokenSet ? state.context.strategy?.simulation.position : undefined

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
                      nextPosition={nextPosition}
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
  const { aaveSTETHReserveConfigurationData, wrappedGetAaveReserveData$ } = useAaveContext(
    strategyConfig.protocol,
  )
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
