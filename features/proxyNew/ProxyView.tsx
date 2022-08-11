import { useActor } from '@xstate/react'
import { AppLink } from 'components/Links'
import { ListWithIcon } from 'components/ListWithIcon'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Image, Text } from 'theme-ui'
import { ActorRefFrom, Sender } from 'xstate'

import { SidebarSection, SidebarSectionProps } from '../../components/sidebar/SidebarSection'
import {
  getEstimatedGasFeeTextOld,
  VaultChangesInformationContainer,
  VaultChangesInformationItem,
} from '../../components/vault/VaultChangesInformation'
import { ProxyEvent, ProxyStateMachine, ProxyStateMachineState } from './state'

interface ProxyViewProps {
  proxyMachine: ActorRefFrom<ProxyStateMachine>
}

interface ProxyViewStateProps {
  state: ProxyStateMachineState
  send: Sender<ProxyEvent>
}

function ProxyInfoStateView({ state, send }: ProxyViewStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: 'Create proxy',
    content: (
      <Grid gap={3}>
        <>
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
            <Trans
              i18nKey={'vault-form.subtext.proxy-start'}
              components={{
                1: (
                  <AppLink
                    href="https://kb.oasis.app/help/what-is-a-proxy-contract"
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
              items={t<string, string[]>('proxy-advantages-new', { returnObjects: true })}
              listStyle={{ my: 2 }}
            />
            <VaultChangesInformationContainer title={t('creating-proxy-contract')}>
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
      label: state.matches('proxyFailure') ? t('retry-create-proxy') : t('create-proxy-btn'),
      action: state.matches('proxyFailure') ? () => send('RETRY') : () => send('START'),
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

function ProxyRunningView() {
  const { t } = useTranslation()
  const sidebarSectionProps: SidebarSectionProps = {
    title: 'Create proxy',
    content: (
      <Grid gap={3}>
        <>
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
            <Trans
              i18nKey={'vault-form.subtext.proxy-progress'}
              components={{
                1: (
                  <AppLink
                    href="https://kb.oasis.app/help/what-is-a-proxy-contract"
                    sx={{ fontSize: 2 }}
                  />
                ),
              }}
            />
          </Text>
          (
          <Image
            src={staticFilesRuntimeUrl('/static/img/proxy_complete.gif')}
            sx={{ display: 'block', maxWidth: '210px', mx: 'auto' }}
          />
        </>
      </Grid>
    ),
    primaryButton: {
      isLoading: true,
      disabled: false,
      label: t('creating-proxy'),
    },
  }
  return <SidebarSection {...sidebarSectionProps} />
}
export function ProxyView({ proxyMachine }: ProxyViewProps) {
  const [state, send] = useActor(proxyMachine)

  switch (true) {
    case state.matches('proxyIdle'):
    case state.matches('proxyWaitingForConfirmation'):
    case state.matches('proxyWaitingForApproval'):
    case state.matches('proxyFailure'):
      return <ProxyInfoStateView state={state} send={send} />
    case state.matches('proxyInProgress'):
      return <ProxyRunningView />
    default:
      return <></>
  }
}
