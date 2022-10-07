import { TabBar } from 'components/TabBar'
import { aaveFaq } from 'features/content/faqs/aave'
import { Survey } from 'features/survey'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Card, Container, Grid } from 'theme-ui'

import { useObservable } from '../../../../../helpers/observableHook'
import { useAaveContext } from '../../AaveContextProvider'
import { AaveOverviewSectionComponent } from '../components'
import { SidebarManageAaveVault } from '../sidebars/SidebarManageAaveVault'
import { ManageAaveStateMachine } from '../state'
import { ManageAaveStateMachineContextProvider } from './AaveManageStateMachineContext'

interface AaveManageViewPositionViewProps {
  address: string
  strategy: string // TODO: Get token from strategy
}

function AaveManageContainer({
  manageAaveStateMachine,
  strategy,
}: AaveManageViewPositionViewProps & { manageAaveStateMachine: ManageAaveStateMachine }) {
  const { t } = useTranslation()
  return (
    <ManageAaveStateMachineContextProvider machine={manageAaveStateMachine}>
      <Container variant="vaultPageContainer">
        {strategy} [HEADER]
        <TabBar
          variant="underline"
          sections={[
            {
              value: 'overview',
              label: t('system.overview'),
              content: (
                <Grid variant="vaultContainer">
                  <Box>
                    <AaveOverviewSectionComponent />
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

export function AaveManagePositionView({ address, strategy }: AaveManageViewPositionViewProps) {
  const { aaveManageStateMachine$ } = useAaveContext()
  const [stateMachine, stateMachineError] = useObservable(
    aaveManageStateMachine$({ token: 'ETH', address: address, strategy: 'STETH' }),
  ) // TODO: should be created with strategy and address. Then should be more generic.

  return (
    <WithErrorHandler error={[stateMachineError]}>
      <WithLoadingIndicator value={[stateMachine]} customLoader={<VaultContainerSpinner />}>
        {([_stateMachine]) => {
          return (
            <AaveManageContainer
              address={address}
              strategy={strategy}
              manageAaveStateMachine={_stateMachine}
            />
          )
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
