import { useActor } from '@xstate/react'
import { AaveReserveConfigurationData } from 'blockchain/calls/aave/aaveProtocolDataProvider'
import { TabBar } from 'components/TabBar'
import { AaveFaq } from 'features/content/faqs/aave'
import { useEarnContext } from 'features/earn/EarnContextProvider'
import { AavePositionAlreadyOpenedNotice } from 'features/notices/VaultsNoticesView'
import { Survey } from 'features/survey'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Card, Container, Grid } from 'theme-ui'

import { useObservable } from '../../../../../helpers/observableHook'
import { useAaveContext } from '../../AaveContextProvider'
import { AavePositionHeader } from '../../components'
import { PreparedAaveReserveData } from '../../helpers/aavePrepareReserveData'
import { createAaveUserConfiguration, hasOtherAssets } from '../../helpers/aaveUserConfiguration'
import { ManageSectionComponent } from '../components'
import { SidebarManageAaveVault } from '../sidebars/SidebarManageAaveVault'
import { ManageAaveStateMachine } from '../state'
import {
  ManageAaveStateMachineContextProvider,
  useManageAaveStateMachineContext,
} from './AaveManageStateMachineContext'

interface AaveManageViewPositionViewProps {
  address: string
  strategy: string // TODO: Get token from strategy
}

function AaveManageContainer({
  manageAaveStateMachine,
  strategy,
  aaveReserveState,
  aaveReserveDataETH,
}: AaveManageViewPositionViewProps & {
  manageAaveStateMachine: ManageAaveStateMachine
  aaveReserveState: AaveReserveConfigurationData
  aaveReserveDataETH: PreparedAaveReserveData
}) {
  const { t } = useTranslation()
  return (
    <ManageAaveStateMachineContextProvider machine={manageAaveStateMachine}>
      <Container variant="vaultPageContainer">
        <AavePositionNotice />
        <AavePositionHeader strategyName={strategy} noDetails />
        <TabBar
          variant="underline"
          sections={[
            {
              value: 'overview',
              label: t('system.overview'),
              content: (
                <Grid variant="vaultContainer">
                  <Box>
                    <ManageSectionComponent
                      aaveReserveState={aaveReserveState}
                      aaveReserveDataETH={aaveReserveDataETH}
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

export function AaveManagePositionView({ address, strategy }: AaveManageViewPositionViewProps) {
  const { aaveManageStateMachine$ } = useAaveContext()
  const { aaveSTETHReserveConfigurationData, aavePreparedReserveDataETH$ } = useEarnContext()
  const [stateMachine, stateMachineError] = useObservable(
    aaveManageStateMachine$({ token: 'ETH', address: address, strategy: 'stETHeth' }),
  ) // TODO: should be created with strategy and address. Then should be more generic.
  const [aaveReserveDataETH] = useObservable(aavePreparedReserveDataETH$)
  const [aaveReserveState, aaveReserveStateError] = useObservable(aaveSTETHReserveConfigurationData)

  return (
    <WithErrorHandler error={[stateMachineError, aaveReserveStateError]}>
      <WithLoadingIndicator
        value={[stateMachine, aaveReserveState, aaveReserveDataETH]}
        customLoader={<VaultContainerSpinner />}
      >
        {([_stateMachine, _aaveReserveState, _aaveReserveDataETH]) => {
          return (
            <AaveManageContainer
              address={address}
              strategy={strategy}
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
