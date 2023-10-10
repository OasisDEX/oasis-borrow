import { useActor } from '@xstate/react'
import { PageSEOTags } from 'components/HeadTags'
import { TabBar } from 'components/TabBar'
import { useAaveContext } from 'features/aave'
import { hasUserInteracted } from 'features/aave/helpers/hasUserInteracted'
import { SidebarOpenAaveVault } from 'features/aave/open/sidebars/SidebarOpenAaveVault'
import type { OpenAaveStateMachine } from 'features/aave/open/state'
import type { IStrategyConfig } from 'features/aave/types/strategy-config'
import { AutomationContextInput } from 'features/automation/contexts/AutomationContextInput'
import { getAaveStopLossData } from 'features/automation/protection/stopLoss/openFlow/openVaultStopLossAave'
import { AavePositionAlreadyOpenedNotice } from 'features/notices/VaultsNoticesView'
import { Survey } from 'features/survey'
import { LendingProtocolLabel } from 'lendingProtocols'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Card, Container, Grid } from 'theme-ui'

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

function SimulateSectionComponent({ config }: { config: IStrategyConfig }) {
  const SimulateSection = config.viewComponents.simulateSection
  const { stateMachine } = useOpenAaveStateMachineContext()
  const [state] = useActor(stateMachine)

  return (
    <SimulateSection
      isOpenView
      strategyConfig={config}
      currentPosition={state.context.currentPosition}
      collateralPrice={state.context.collateralPrice}
      tokenPrice={state.context.tokenPrice}
      debtPrice={state.context.debtPrice}
      nextPosition={
        hasUserInteracted(state) ? state.context.transition?.simulation.position : undefined
      }
    />
  )
}

function TabSectionComponent({ strategyConfig }: { strategyConfig: IStrategyConfig }) {
  const { t } = useTranslation()
  const { stateMachine } = useOpenAaveStateMachineContext()
  const [state, send] = useActor(stateMachine)
  const PositionInfo = strategyConfig.viewComponents.positionInfo

  const { automationContextProps } = getAaveStopLossData(state.context, send)

  return (
    <TabBar
      variant="underline"
      sections={[
        {
          value: 'simulate',
          label: t('open-vault.simulate'),
          content: (
            <Grid variant="vaultContainer">
              <AutomationContextInput {...automationContextProps}>
                <Box>
                  <SimulateSectionComponent config={strategyConfig} />
                  <Box sx={{ mt: 5 }}></Box>
                </Box>
                <Box>
                  <SidebarOpenAaveVault />
                </Box>
              </AutomationContextInput>
            </Grid>
          ),
        },
        {
          value: 'position-info',
          label: t('system.position-info'),
          content: (
            <Card variant="faq">
              <PositionInfo />
            </Card>
          ),
          callback: () => {
            // this resets the amount value in the sidebar
            send({ type: 'SET_AMOUNT', amount: undefined })
          },
        },
      ]}
    />
  )
}

function AaveOpenContainer({
  aaveStateMachine,
  config,
}: {
  aaveStateMachine: OpenAaveStateMachine
  config: IStrategyConfig
}) {
  const Header = config.viewComponents.headerOpen
  return (
    <OpenAaveStateMachineContextProvider machine={aaveStateMachine} config={config}>
      <Container variant="vaultPageContainer">
        <AavePositionNotice />
        <Header strategyConfig={config} />
        <TabSectionComponent strategyConfig={config} />
        <Survey for="earn" />
      </Container>
    </OpenAaveStateMachineContextProvider>
  )
}

export function AaveOpenView({ config }: { config: IStrategyConfig }) {
  const { aaveStateMachine } = useAaveContext(config.protocol, config.network)
  const { t } = useTranslation()
  return (
    <>
      <PageSEOTags
        title="seo.title-product-w-tokens"
        titleParams={{
          product: t(`seo.${config.type.toLocaleLowerCase()}.title`),
          protocol: LendingProtocolLabel[config.protocol],
          token1: config.tokens.collateral,
          token2: config.tokens.debt,
        }}
        description="seo.multiply.description"
        url={`/${config.type.toLocaleLowerCase()}`}
      />
      <AaveOpenContainer aaveStateMachine={aaveStateMachine} config={config} />
    </>
  )
}
