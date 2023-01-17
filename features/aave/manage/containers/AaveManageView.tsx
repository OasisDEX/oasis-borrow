import { useActor } from '@xstate/react'
import { AaveReserveConfigurationData } from 'blockchain/calls/aave/aaveProtocolDataProvider'
import { AaveManageTabBar } from 'features/aave/manage/containers/AaveManageTabBar'
import { AaveAutomationContext } from 'features/automation/contexts/AaveAutomationContext'
import { Survey } from 'features/survey'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import React from 'react'
import { Box, Container } from 'theme-ui'

import { AavePositionNoticesView } from '../../../notices/VaultsNoticesView'
import { useAaveContext } from '../../AaveContextProvider'
import { IStrategyConfig } from '../../common/StrategyConfigTypes'
import { PreparedAaveReserveData } from '../../helpers/aavePrepareReserveData'
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
        <Header strategyConfig={strategyConfig} />
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
