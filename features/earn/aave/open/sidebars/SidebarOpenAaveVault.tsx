import { ProxyView } from '@oasis-borrow/proxy'
import { useMachine } from '@xstate/react'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

import { VaultChangesInformationContainer } from '../../../../../components/vault/VaultChangesInformation'
import { OpenAaveStateMachine } from '../state/types'
import { GetSidebarTexts } from './GetSidebarTexts'
import { SidebarOpenAaveVaultEditingState } from './SidebarOpenAaveVaultEditingState'

export interface OpenAaveVaultProps {
  readonly aaveStateMachine: OpenAaveStateMachine
}

export function SidebarOpenAaveVault({ aaveStateMachine }: OpenAaveVaultProps) {
  const { t } = useTranslation()

  const machine = useMachine(aaveStateMachine, { devTools: true })
  const [state, send] = machine

  const proxy = useMachine(state.context.dependencies.proxyStateMachine)

  const isSuccessStage = state.matches('txSuccess')

  const isFailed = state.matches('txFailure')

  const texts = GetSidebarTexts(machine, proxy, t)

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('open-earn.aave.vault-form.title'),
    content: (
      <Grid gap={3}>
        {state.matches('editing') && (
          <SidebarOpenAaveVaultEditingState
            state={state}
            setAmount={(amount) => {
              if (amount) {
                send('SET_AMOUNT', { amount })
              }
            }}
          />
        )}
        {!state.matches('proxyCreating') && (
          <VaultChangesInformationContainer title="Order information"></VaultChangesInformationContainer>
        )}
        {state.matches('proxyCreating') && (
          <ProxyView proxyMachine={state.context.dependencies.proxyStateMachine} />
        )}
      </Grid>
    ),
    primaryButton: {
      ...texts,
    },
    textButton: {
      label: 'Button',
      hidden: !isFailed || isSuccessStage,
      action: () => {},
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}
