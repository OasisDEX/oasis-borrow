import { useActor } from '@xstate/react'
import { TabBar } from 'components/TabBar'
import { AaveFaq } from 'features/content/faqs/aave'
import { Survey } from 'features/survey'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Card, Container, Grid } from 'theme-ui'

import { AavePositionAlreadyOpenedNotice } from '../../../notices/VaultsNoticesView'
import { useAaveContext } from '../../AaveContextProvider'
import { StrategyConfig } from '../../common/StrategyConfigTypes'
import { SidebarOpenAaveVault } from '../sidebars/SidebarOpenAaveVault'
import { OpenAaveStateMachine } from '../state'
import {
  OpenAaveStateMachineContextProvider,
  useOpenAaveStateMachineContext,
} from './AaveOpenStateMachineContext'

function AavePositionNotice() {
  const { stateMachine } = useOpenAaveStateMachineContext()
  const [state] = useActor(stateMachine)
  const { context } = state

  if (context.hasOpenedPosition) {
    return <AavePositionAlreadyOpenedNotice />
  }
  return null
}

function SimulateSectionComponent({ config }: { config: StrategyConfig }) {
  const SimulateSection = config.viewComponents.simulateSection
  const { stateMachine } = useOpenAaveStateMachineContext()
  const [state] = useActor(stateMachine)

  return (
    <SimulateSection
      strategyConfig={config}
      currentPosition={state.context.currentPosition}
      collateralPrice={state.context.collateralPrice}
      tokenPrice={state.context.tokenPrice}
      nextPosition={state.context.strategy?.simulation.position}
    />
  )
}

function AaveOpenContainer({
  aaveStateMachine,
  config,
}: {
  aaveStateMachine: OpenAaveStateMachine
  config: StrategyConfig
}) {
  const { t } = useTranslation()
  const Header = config.viewComponents.headerOpen
  return (
    <OpenAaveStateMachineContextProvider machine={aaveStateMachine} config={config}>
      <Container variant="vaultPageContainer">
        <AavePositionNotice />
        <Header strategyConfig={config} />
        <TabBar
          variant="underline"
          sections={[
            {
              value: 'simulate',
              label: t('open-vault.simulate'),
              content: (
                <Grid variant="vaultContainer">
                  <Box>
                    <SimulateSectionComponent config={config} />
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

export function AaveOpenView({ config }: { config: StrategyConfig }) {
  const { aaveStateMachine } = useAaveContext()
  return <AaveOpenContainer aaveStateMachine={aaveStateMachine} config={config} />
}
