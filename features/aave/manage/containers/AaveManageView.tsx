import { useActor } from '@xstate/react'
import { AaveReserveConfigurationData } from 'blockchain/calls/aave/aaveProtocolDataProvider'
import { TabBar } from 'components/TabBar'
import { getAaveStrategy$ } from 'features/aave/featureConfig'
import { AaveFaq } from 'features/content/faqs/aave'
import { useEarnContext } from 'features/earn/EarnContextProvider'
import { AavePositionAlreadyOpenedNotice } from 'features/notices/VaultsNoticesView'
import { Survey } from 'features/survey'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Card, Container, Grid } from 'theme-ui'

import { useObservable } from '../../../../helpers/observableHook'
import { useAaveContext } from '../../AaveContextProvider'
import { StrategyConfig } from '../../common/StrategyConfigType'
import { PreparedAaveReserveData } from '../../helpers/aavePrepareReserveData'
import { createAaveUserConfiguration, hasOtherAssets } from '../../helpers/aaveUserConfiguration'
import { SidebarManageAaveVault } from '../sidebars/SidebarManageAaveVault'
import { ManageAaveStateMachine } from '../state'
import {
  ManageAaveStateMachineContextProvider,
  useManageAaveStateMachineContext,
} from './AaveManageStateMachineContext'

interface AaveManageViewPositionViewProps {
  address: string
}

function AaveManageContainer({
  manageAaveStateMachine,
  strategyConfig,
  aaveReserveState,
  aaveReserveDataETH,
}: {
  manageAaveStateMachine: ManageAaveStateMachine
  aaveReserveState: AaveReserveConfigurationData
  aaveReserveDataETH: PreparedAaveReserveData
  strategyConfig: StrategyConfig
}) {
  const { t } = useTranslation()
  const Header = strategyConfig.viewComponents.headerManage
  const VaultDetails = strategyConfig.viewComponents.vaultDetailsManage
  return (
    <ManageAaveStateMachineContextProvider machine={manageAaveStateMachine}>
      <Container variant="vaultPageContainer">
        <AavePositionNotice />
        <Header strategyName={strategyConfig.name} noDetails />
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
                      aaveReserveDataETH={aaveReserveDataETH}
                      strategyConfig={strategyConfig}
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
          ]}
        />
        <Survey for="earn" />
      </Container>
    </ManageAaveStateMachineContextProvider>
  )
}

function AavePositionNotice() {
  const { stateMachine } = useManageAaveStateMachineContext()
  const [state] = useActor(stateMachine)
  const { context } = state
  const { aaveUserConfiguration, aaveReservesList } = context.protocolData || {}
  const hasOtherAssetsThanETH_STETH = hasOtherAssets(
    createAaveUserConfiguration(aaveUserConfiguration, aaveReservesList),
    ['ETH', 'STETH'],
  )

  if (hasOtherAssetsThanETH_STETH) {
    return <AavePositionAlreadyOpenedNotice />
  }
  return null
}

export function AaveManagePositionView({ address }: AaveManageViewPositionViewProps) {
  const { aaveManageStateMachine$ } = useAaveContext()
  const { aaveSTETHReserveConfigurationData, aavePreparedReserveDataETH$ } = useEarnContext()
  const [stateMachine, stateMachineError] = useObservable(
    aaveManageStateMachine$({ token: 'ETH', address: address, strategy: 'stETHeth' }),
  ) // TODO: should be created with strategy and address. Then should be more generic.
  const [aaveReserveDataETH] = useObservable(aavePreparedReserveDataETH$)
  const [aaveReserveState, aaveReserveStateError] = useObservable(aaveSTETHReserveConfigurationData)
  const [aaveStrategy, aaveStrategyError] = useObservable(getAaveStrategy$(address))
  return (
    <WithErrorHandler error={[stateMachineError, aaveReserveStateError, aaveStrategyError]}>
      <WithLoadingIndicator
        value={[stateMachine, aaveReserveState, aaveReserveDataETH, aaveStrategy]}
        customLoader={<VaultContainerSpinner />}
      >
        {([_stateMachine, _aaveReserveState, _aaveReserveDataETH, _aaveStrategy]) => {
          return (
            <AaveManageContainer
              strategyConfig={_aaveStrategy}
              manageAaveStateMachine={_stateMachine}
              aaveReserveState={_aaveReserveState}
              aaveReserveDataETH={_aaveReserveDataETH}
            />
          )
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
