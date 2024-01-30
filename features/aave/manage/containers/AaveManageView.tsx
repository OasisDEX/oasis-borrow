import { useActor } from '@xstate/react'
import { useAaveContext } from 'features/aave'
import { AaveManageTabBar } from 'features/aave/manage/containers/AaveManageTabBar'
import { useManageAaveStateMachineContext } from 'features/aave/manage/contexts'
import type { IStrategyConfig } from 'features/aave/types/strategy-config'
import { AaveAutomationContext } from 'features/automation/contexts/AaveAutomationContext'
import { AavePositionNoticesView } from 'features/notices/VaultsNoticesView'
import { Survey } from 'features/survey'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import type {
  AaveLikeReserveConfigurationData,
  AaveLikeReserveData,
} from 'lendingProtocols/aave-like-common'
import React from 'react'
import { Box, Container } from 'theme-ui'

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
  aaveReserveState: AaveLikeReserveConfigurationData
  aaveReserveDataDebtToken: AaveLikeReserveData
  strategyConfig: IStrategyConfig
  address: string
}) {
  const Header = strategyConfig.viewComponents.headerManage
  const { stateMachine } = useManageAaveStateMachineContext()
  const [state] = useActor(stateMachine)

  if (!state.context.currentPosition) {
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
        <Header
          strategyConfig={strategyConfig}
          positionId={state.context.positionId}
          currentPosition={state.context.currentPosition}
        />
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
  const { aaveLikeReserveConfigurationData$, getAaveLikeReserveData$ } = useAaveContext(
    strategyConfig.protocol,
    strategyConfig.network,
  )
  const [aaveReserveDataDebt, aaveReserveDataDebtError] = useObservable(
    getAaveLikeReserveData$({ token: strategyConfig.tokens.debt }),
  )
  const [aaveReserveState, aaveReserveStateError] = useObservable(
    aaveLikeReserveConfigurationData$({
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
