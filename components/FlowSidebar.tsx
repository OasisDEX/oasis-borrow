import { useActor } from '@xstate/react'
import { AllowanceView } from 'features/stateMachines/allowance'
import { CreateDPMAccountViewConsumed } from 'features/stateMachines/dpmAccount/CreateDPMAccountView'
import {
  DPMAccountStateMachine,
  DPMAccountStateMachineEvents,
} from 'features/stateMachines/dpmAccount/state/createDPMAccountStateMachine'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useFlowState } from 'helpers/useFlowState'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Image, Text } from 'theme-ui'
import { Sender, StateFrom } from 'xstate'

import { AppLink } from './Links'
import { ListWithIcon } from './ListWithIcon'
import { SidebarSection, SidebarSectionProps } from './sidebar/SidebarSection'
import { SidebarSectionFooterButtonSettings } from './sidebar/SidebarSectionFooter'
import {
  getEstimatedGasFeeTextOld,
  VaultChangesInformationContainer,
  VaultChangesInformationItem,
} from './vault/VaultChangesInformation'

export type CreateDPMAccountViewProps = {
  noConnectionContent?: JSX.Element
} & ReturnType<typeof useFlowState>

interface InternalViewsProps {
  state: StateFrom<DPMAccountStateMachine>
  send: Sender<DPMAccountStateMachineEvents>
}

function buttonInfoSettings({
  state,
  send,
}: InternalViewsProps): Pick<SidebarSectionFooterButtonSettings, 'label' | 'action'> {
  const { t } = useTranslation()

  const isRetry = state.matches('txFailure')

  return {
    label: isRetry
      ? t('dpm.create-flow.welcome-screen.retry-create-button')
      : t('dpm.create-flow.welcome-screen.create-button'),
    action: isRetry ? () => send('RETRY') : () => send('START'),
  }
}

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
  dpmMachine,
  allowanceMachine,
  isWalletConnected = false,
  token,
  amount,
  isProxyReady,
  isAllowanceReady,
  isLoading,
}: CreateDPMAccountViewProps) {
  const [dpmState, dpmSend] = useActor(dpmMachine)
  const [allowanceState] = useActor(allowanceMachine)
  const allowanceConsidered = token !== 'ETH' && amount

  if (!isWalletConnected) {
    return <NoConnectionStateView noConnectionContent={noConnectionContent} />
  }
  if (!isProxyReady && !isAllowanceReady) {
    switch (true) {
      case dpmState.matches('idle'):
      case dpmState.matches('txFailure'):
      case dpmState.matches('txInProgress'):
      case dpmState.matches('txSuccess'):
        return <CreateDPMAccountViewConsumed state={dpmState} send={dpmSend} />
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
        return <AllowanceView allowanceMachine={allowanceMachine} isLoading={isLoading} />
      default:
        return <></>
    }
  }
  return <></>
}
