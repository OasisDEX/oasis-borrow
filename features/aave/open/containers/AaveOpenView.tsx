import { TabBar } from 'components/TabBar'
import { AaveFaq } from 'features/content/faqs/aave'
import { Survey } from 'features/survey'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Card, Container, Grid } from 'theme-ui'

import { useObservable } from '../../../../helpers/observableHook'
import { useAaveContext } from '../../AaveContextProvider'
import { StrategyConfig } from '../../common/StrategyConfigTypes'
import { SidebarOpenAaveVault } from '../sidebars/SidebarOpenAaveVault'
import { OpenAaveStateMachine } from '../state'
import { OpenAaveStateMachineContextProvider } from './AaveOpenStateMachineContext'

function AaveOpenContainer({
  aaveStateMachine,
  config,
}: {
  aaveStateMachine: OpenAaveStateMachine
  config: StrategyConfig
}) {
  const { t } = useTranslation()
  const Header = config.viewComponents.headerOpen
  const SimulateSection = config.viewComponents.simulateSection
  return (
    <OpenAaveStateMachineContextProvider machine={aaveStateMachine}>
      <Container variant="vaultPageContainer">
        <Header strategyName={config.name} />
        <TabBar
          variant="underline"
          sections={[
            {
              value: 'simulate',
              label: t('open-vault.simulate'),
              content: (
                <Grid variant="vaultContainer">
                  <Box>
                    <SimulateSection />
                  </Box>
                  <Box>{<SidebarOpenAaveVault />}</Box>
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
    </OpenAaveStateMachineContextProvider>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function AaveOpenView({ config }: { config: StrategyConfig }) {
  const { aaveStateMachine$ } = useAaveContext()
  const [stateMachine, stateMachineError] = useObservable(aaveStateMachine$)

  return (
    <WithErrorHandler error={[stateMachineError]}>
      <WithLoadingIndicator value={[stateMachine]} customLoader={<VaultContainerSpinner />}>
        {([_stateMachine]) => {
          return <AaveOpenContainer aaveStateMachine={_stateMachine} config={config} />
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
