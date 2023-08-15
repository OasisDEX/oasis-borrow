import { useActor } from '@xstate/react'
import { useAaveContext } from 'features/aave'
import { AaveManageTabBar } from 'features/aave/manage/containers/AaveManageTabBar'
import { IStrategyConfig } from 'features/aave/types/strategy-config'
import { AaveAutomationContext } from 'features/automation/contexts/AaveAutomationContext'
import { AavePositionNoticesView } from 'features/notices/VaultsNoticesView'
import { Survey } from 'features/survey'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { ReserveConfigurationData, ReserveData } from 'lendingProtocols/aaveCommon'
import React from 'react'
import { Box, Container } from 'theme-ui'

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
  aaveReserveState: ReserveConfigurationData
  aaveReserveDataDebtToken: ReserveData
  strategyConfig: IStrategyConfig
  address: string
}) {
  const Header = strategyConfig.viewComponents.headerManage
  const { stateMachine } = useManageAaveStateMachineContext()
  const [state] = useActor(stateMachine)

  if (!state.context.protocolData) {
    return null
  }

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
        {/*<Header strategyConfig={strategyConfig} positionId={state.context.positionId} />*/}
        <AaveManageTabBar
          strategyConfig={strategyConfig}
          aaveReserveState={aaveReserveState}
          aaveReserveDataDebtToken={aaveReserveDataDebtToken}
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
  const { aaveReserveConfigurationData$, getAaveReserveData$ } = useAaveContext(
    strategyConfig.protocol,
    strategyConfig.network,
  )
  console.log('<<<>>>')
  console.log(strategyConfig.type)
  const [aaveReserveDataDebt, aaveReserveDataDebtError] = useObservable(
    getAaveReserveData$({ token: strategyConfig.tokens.debt }),
  )
  const [aaveReserveState, aaveReserveStateError] = useObservable(
    aaveReserveConfigurationData$({
      collateralToken: strategyConfig.tokens.collateral,
      debtToken: strategyConfig.tokens.debt,
    }),
  )
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
