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
import { AavePositionHeaderWithDetails } from '../../components'
import { SimulateSectionComponent } from '../components'
import { SidebarOpenAaveVault } from '../sidebars/SidebarOpenAaveVault'
import { OpenAaveStateMachine } from '../state'
import { OpenAaveStateMachineContextProvider } from './AaveOpenStateMachineContext'

interface OpenAaveViewProps {
  strategyName: string
}

function AaveOpenContainer({
  aaveStateMachine,
  strategyName,
}: {
  strategyName: string
  aaveStateMachine: OpenAaveStateMachine
}) {
  const { t } = useTranslation()
  return (
    <OpenAaveStateMachineContextProvider machine={aaveStateMachine}>
      <Container variant="vaultPageContainer">
        <AavePositionHeaderWithDetails strategyName={strategyName} />
        <TabBar
          variant="underline"
          sections={[
            {
              value: 'simulate',
              label: t('open-vault.simulate'),
              content: (
                <Grid variant="vaultContainer">
                  <Box>
                    <SimulateSectionComponent />
                  </Box>
                  <Box>{<SidebarOpenAaveVault />}</Box>
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
    </OpenAaveStateMachineContextProvider>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function AaveOpenView({ strategyName }: OpenAaveViewProps) {
  const { aaveStateMachine$ } = useAaveContext()
  const [stateMachine, stateMachineError] = useObservable(aaveStateMachine$)

  return (
    <WithErrorHandler error={[stateMachineError]}>
      <WithLoadingIndicator value={[stateMachine]} customLoader={<VaultContainerSpinner />}>
        {([_stateMachine]) => {
          return <AaveOpenContainer aaveStateMachine={_stateMachine} strategyName={strategyName} />
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
