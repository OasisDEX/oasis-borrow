import { useActor } from '@xstate/react'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Image, Text } from 'theme-ui'
import { ActorRefFrom, Sender, StateFrom } from 'xstate'

import { AppLink } from '../../../components/Links'
import { ListWithIcon } from '../../../components/ListWithIcon'
import { SidebarSection, SidebarSectionProps } from '../../../components/sidebar/SidebarSection'
import { SidebarSectionFooterButtonSettings } from '../../../components/sidebar/SidebarSectionFooter'
import {
  getEstimatedGasFeeTextOld,
  VaultChangesInformationContainer,
  VaultChangesInformationItem,
} from '../../../components/vault/VaultChangesInformation'
import { staticFilesRuntimeUrl } from '../../../helpers/staticPaths'
import {
  DPMAccountStateMachine,
  DPMAccountStateMachineEvents,
} from './state/createDPMAccountStateMachine'

export interface CreateDPMAccountViewProps {
  machine: ActorRefFrom<DPMAccountStateMachine>
}

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
    label: isRetry ? t('retry-create-proxy') : t('create-proxy-btn'),
    action: isRetry ? () => send('RETRY') : () => send('START'),
  }
}

function InfoStateView({ state, send }: InternalViewsProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('vault-form.header.proxy'),
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
              items={t<string, string[]>('proxy-advantages', { returnObjects: true })}
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
      ...buttonInfoSettings({ state, send }),
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

function InProgressView(_: InternalViewsProps) {
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
                1: (
                  <AppLink
                    href="https://kb.oasis.app/help/what-is-a-proxy-contract"
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
      label: t('creating-proxy'),
    },
  }
  return <SidebarSection {...sidebarSectionProps} />
}

function SuccessStateView({ send }: InternalViewsProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('vault-form.header.proxy'),
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
              items={t<string, string[]>('proxy-advantages', { returnObjects: true })}
              listStyle={{ my: 2 }}
            />
          </>
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

export function CreateDPMAccountView({ machine }: CreateDPMAccountViewProps) {
  const [state, send] = useActor(machine)

  switch (true) {
    case state.matches('idle'):
    case state.matches('txFailure'):
      return <InfoStateView state={state} send={send} />
    case state.matches('txInProgress'):
      return <InProgressView state={state} send={send} />
    case state.matches('txSuccess'):
      return <SuccessStateView state={state} send={send} />
    default:
      return <></>
  }
}
