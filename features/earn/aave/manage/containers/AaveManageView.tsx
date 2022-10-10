import { useActor } from '@xstate/react'
import { AaveReserveConfigurationData } from 'blockchain/calls/aave/aaveProtocolDataProvider'
import { amountToWei } from 'blockchain/utils'
import { TabBar } from 'components/TabBar'
import { aaveFaq } from 'features/content/faqs/aave'
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
  aaveReserveState?: AaveReserveConfigurationData
}

function AaveManageContainer({
  manageAaveStateMachine,
  strategy,
  aaveReserveState,
}: AaveManageViewPositionViewProps & { manageAaveStateMachine: ManageAaveStateMachine }) {
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
                    <ManageSectionComponent aaveReserveState={aaveReserveState} />
                  </Box>
                  <Box>{<SidebarManageAaveVault />}</Box>
                </Grid>
              ),
            },
            {
              value: 'faq',
              label: t('system.faq'),
              content: <Card variant="faq">{aaveFaq}</Card>,
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
  if (
    context.protocolData &&
    amountToWei(context.protocolData.accountData.totalCollateralETH, context.token).gt(1)
  ) {
    return <AavePositionAlreadyOpenedNotice />
  }
  return null
}

export function AaveManagePositionView({ address, strategy }: AaveManageViewPositionViewProps) {
  const { aaveManageStateMachine$ } = useAaveContext()
  const { aaveSTETHReserveConfigurationData } = useEarnContext()
  const [stateMachine, stateMachineError] = useObservable(
    aaveManageStateMachine$({ token: 'ETH', address: address, strategy: 'STETH' }),
  ) // TODO: should be created with strategy and address. Then should be more generic.
  const [aaveReserveState, aaveReserveStateError] = useObservable(aaveSTETHReserveConfigurationData)

  return (
    <WithErrorHandler error={[stateMachineError, aaveReserveStateError]}>
      <WithLoadingIndicator
        value={[stateMachine, aaveReserveState]}
        customLoader={<VaultContainerSpinner />}
      >
        {([_stateMachine, _aaveReserveState]) => {
          return (
            <AaveManageContainer
              address={address}
              strategy={strategy}
              manageAaveStateMachine={_stateMachine}
              aaveReserveState={_aaveReserveState}
            />
          )
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
