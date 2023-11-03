import { useActor } from '@xstate/react'
import { AppLink } from 'components/Links'
import { ListWithIcon } from 'components/ListWithIcon'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarSection } from 'components/sidebar/SidebarSection'
import {
  getEstimatedGasFeeTextOld,
  VaultChangesInformationContainer,
  VaultChangesInformationItem,
} from 'components/vault/VaultChangesInformation'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { useAppConfig } from 'helpers/config'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { checkmark } from 'theme/icons'
import { Grid, Image, Text } from 'theme-ui'
import type { ActorRefFrom, Sender } from 'xstate'

import type { ProxyEvent, ProxyStateMachine, ProxyStateMachineState } from './state'

interface ProxyViewProps {
  proxyMachine: ActorRefFrom<ProxyStateMachine>
  steps: [number, number]
}

interface ProxyViewStateProps {
  state: ProxyStateMachineState
  send: Sender<ProxyEvent>
  steps: [number, number]
}

function ProxyInfoStateView({ state, send, steps }: ProxyViewStateProps) {
  const { t } = useTranslation()
  const { ProxyCreationDisabled: isProxyCreationDisabled } = useAppConfig('features')

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('vault-form.header.proxy'),
    content: (
      <Grid gap={3}>
        <>
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
            <Trans
              i18nKey={'vault-form.subtext.proxy-start'}
              components={{
                1: <AppLink href={EXTERNAL_LINKS.KB.WHAT_IS_PROXY} sx={{ fontSize: 2 }} />,
              }}
            />
          </Text>
          <>
            <ListWithIcon
              icon={checkmark}
              iconSize="14px"
              iconColor="primary100"
              items={t('proxy-advantages', { returnObjects: true })}
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
      steps: steps,
      isLoading: false,
      disabled: isProxyCreationDisabled,
      label: state.matches('proxyFailure') ? t('retry-create-proxy') : t('create-proxy-btn'),
      action: state.matches('proxyFailure') ? () => send('RETRY') : () => send('START'),
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

function ProxyRunningView(props: { steps: [number, number] }) {
  const { t } = useTranslation()
  const sidebarSectionProps: SidebarSectionProps = {
    title: t('vault-form.header.proxy'),
    content: (
      <Grid gap={3}>
        <>
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
            <Trans
              i18nKey={'vault-form.subtext.proxy-progress'}
              components={{
                1: <AppLink href={EXTERNAL_LINKS.KB.WHAT_IS_PROXY} sx={{ fontSize: 2 }} />,
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
      steps: props.steps,
      isLoading: true,
      disabled: true,
      label: t('creating-proxy'),
    },
  }
  return <SidebarSection {...sidebarSectionProps} />
}
export function ProxyView({ proxyMachine, steps }: ProxyViewProps) {
  const [state, send] = useActor(proxyMachine)

  switch (true) {
    case state.matches('proxyIdle'):
    case state.matches('proxyWaitingForConfirmation'):
    case state.matches('proxyWaitingForApproval'):
    case state.matches('proxyFailure'):
      return <ProxyInfoStateView state={state} send={send} steps={steps} />
    case state.matches('proxyInProgress'):
      return <ProxyRunningView steps={steps} />
    default:
      return <></>
  }
}
