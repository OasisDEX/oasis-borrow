import { useMachine } from '@xstate/react'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

import { VaultChangesInformationContainer } from '../../../../../components/vault/VaultChangesInformation'
import { ProxyView } from '../../../../proxyNew/ProxyView'
import { OpenAaveStateMachine } from '../state/openAaveStateMachine.types'
import { GetSidebarTexts } from './GetSidebarTexts'
import { SidebarOpenAaveVaultEditingState } from './SidebarOpenAaveVaultEditingState'

export interface OpenAaveVaultProps {
  readonly aaveStateMachine: OpenAaveStateMachine
}

export function SidebarOpenAaveVault({ aaveStateMachine }: OpenAaveVaultProps) {
  const { t } = useTranslation()

  const [state, send] = useMachine(aaveStateMachine)

  const isSuccessStage = state.matches('txSuccess')

  const isFailed = state.matches('txFailure')

  const texts = GetSidebarTexts(state, t, send)

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
        {state.matches('proxyCreating') && state.context.refProxyMachine && (
          <ProxyView stage={state.context.refProxyMachine} />
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
