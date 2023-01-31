import { useActor } from '@xstate/react'
import { AllowanceView } from 'features/stateMachines/allowance'
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

function DPMInfoStateView({ state, send }: InternalViewsProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('dpm.create-flow.welcome-screen.header'),
    content: (
      <Grid gap={3}>
        <>
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
            <Trans
              i18nKey={'dpm.create-flow.welcome-screen.paragraph'}
              components={{
                1: (
                  <AppLink
                    href="https://kb.oasis.app/help/what-is-a-smart-defi-account"
                    sx={{ fontSize: 2 }}
                  />
                ),
              }}
            />
          </Text>
          <>
            <ListWithIcon
              icon="checkmark"
              iconSize="14px"
              iconColor="primary100"
              items={t<string, string[]>('dpm.create-flow.bullet-points', {
                returnObjects: true,
              })}
              listStyle={{ my: 2 }}
            />
            <VaultChangesInformationContainer
              title={t('dpm.create-flow.welcome-screen.create-order-summary-heading')}
            >
              <VaultChangesInformationItem
                label={t('transaction-fee')}
                value={getEstimatedGasFeeTextOld(state.context.gasData)}
              />
            </VaultChangesInformationContainer>
          </>
        </>
      </Grid>
    ),
    primaryButton: {
      isLoading: false,
      disabled: false,
      ...buttonInfoSettings({ state, send }),
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

function DPMInProgressView(_: InternalViewsProps) {
  const { t } = useTranslation()
  const sidebarSectionProps: SidebarSectionProps = {
    title: t('dpm.create-flow.proxy-creating-screen.header'),
    content: (
      <Grid gap={3}>
        <>
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
            <Trans
              i18nKey={'dpm.create-flow.proxy-creating-screen.paragraph'}
              components={{
                1: (
                  <AppLink
                    href="https://kb.oasis.app/help/what-is-a-smart-defi-account"
                    sx={{ fontSize: 2 }}
                  />
                ),
              }}
            />
          </Text>
          <Image
            src={staticFilesRuntimeUrl('/static/img/proxy_complete.gif')}
            sx={{ display: 'block', maxWidth: '210px', mx: 'auto' }}
          />
        </>
      </Grid>
    ),
    primaryButton: {
      isLoading: true,
      disabled: true,
      label: t('dpm.create-flow.proxy-creating-screen.button'),
    },
  }
  return <SidebarSection {...sidebarSectionProps} />
}

function DPMSuccessStateView({ send }: InternalViewsProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('dpm.create-flow.proxy-created-screen.header'),
    content: (
      <Grid gap={3}>
        <>
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
            <Trans
              i18nKey={'dpm.create-flow.proxy-created-screen.paragraph'}
              components={{
                1: (
                  <AppLink
                    href="https://kb.oasis.app/help/what-is-a-smart-defi-account"
                    sx={{ fontSize: 2 }}
                  />
                ),
              }}
            />
          </Text>
          <Image
            src={staticFilesRuntimeUrl('/static/img/proxy_complete.gif')}
            sx={{ display: 'block', maxWidth: '210px', mx: 'auto' }}
          />
        </>
      </Grid>
    ),
    primaryButton: {
      isLoading: false,
      disabled: false,
      label: t('continue'),
      action: () => send('CONTINUE'),
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
        return <DPMInfoStateView state={dpmState} send={dpmSend} />
      case dpmState.matches('txInProgress'):
        return <DPMInProgressView state={dpmState} send={dpmSend} />
      case dpmState.matches('txSuccess'):
        return <DPMSuccessStateView state={dpmState} send={dpmSend} />
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
