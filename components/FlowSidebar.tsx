import { useActor } from '@xstate/react'
import { AllowanceView } from 'features/stateMachines/allowance'
import { CreateDPMAccountViewConsumed } from 'features/stateMachines/dpmAccount/CreateDPMAccountView'
import { useFlowState } from 'helpers/useFlowState'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Text } from 'theme-ui'

import { SidebarSection, SidebarSectionProps } from './sidebar/SidebarSection'

export type CreateDPMAccountViewProps = {
  noConnectionContent?: JSX.Element
} & ReturnType<typeof useFlowState>

function NoConnectionStateView({
  noConnectionContent,
}: {
  noConnectionContent?: CreateDPMAccountViewProps['noConnectionContent']
}) {
  const { t } = useTranslation()
  const sidebarSectionProps: SidebarSectionProps = {
    title: t('dpm.create-flow.welcome-screen.header'),
    content: (
      <Grid gap={3}>
        {noConnectionContent || (
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
            {t('vaults-overview.headers.not-connected-suggestions')}
          </Text>
        )}
      </Grid>
    ),
    primaryButton: {
      isLoading: false,
      disabled: false,
      label: t('connect-wallet'),
      url: '/connect',
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

export function FlowSidebar({
  noConnectionContent,
  internals,
  isWalletConnected = false,
  token,
  amount,
  isProxyReady,
  isAllowanceReady,
  isLoading,
}: CreateDPMAccountViewProps) {
  const [dpmState, dpmSend] = useActor(internals.dpmMachine)
  const [allowanceState] = useActor(internals.allowanceMachine)
  const allowanceConsidered = !!token && token !== 'ETH' && amount

  if (!isWalletConnected) {
    return <NoConnectionStateView noConnectionContent={noConnectionContent} />
  }
  if (!isProxyReady && !isAllowanceReady) {
    switch (true) {
      case dpmState.matches('idle'):
      case dpmState.matches('txFailure'):
      case dpmState.matches('txInProgress'):
      case dpmState.matches('txSuccess'):
        return (
          <CreateDPMAccountViewConsumed state={dpmState} send={dpmSend} backButtonOnFirstStep />
        )
      default:
        return <></>
    }
  }
  if (isProxyReady && !isAllowanceReady && allowanceConsidered) {
    switch (true) {
      case allowanceState.matches('idle'):
      case allowanceState.matches('txFailure'):
      case allowanceState.matches('txInProgress'):
      case allowanceState.matches('txSuccess'):
        return (
          <AllowanceView
            allowanceMachine={internals.allowanceMachine}
            isLoading={isLoading}
            backButtonOnFirstStep
          />
        )
      default:
        return <></>
    }
  }
  return <></>
}
