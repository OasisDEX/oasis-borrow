import { Event, EventData, SingleOrArray } from 'xstate'

import { SidebarSectionFooterButtonSettings } from '../../../../../components/sidebar/SidebarSectionFooter'
import { getProxyButtonSettings } from '../../../../proxyNew/getProxyButtonSettings'
import { OpenAaveEvent, OpenAaveStateMachineState } from '../state/openAaveStateMachine.types'

export function GetSidebarTexts(
  state: OpenAaveStateMachineState,
  t: (key: string, options?: any) => string,
  send: (
    event: SingleOrArray<Event<OpenAaveEvent>>,
    payload?: EventData | undefined,
  ) => OpenAaveStateMachineState,
): SidebarSectionFooterButtonSettings {
  const isSuccessStage = state.matches('txSuccess')
  const isLoading = state.matches('txInProgress')

  const url = isSuccessStage ? `/${state.context.vaultNumber}` : undefined

  const steps: [number, number] | undefined = !isSuccessStage
    ? [state.context.currentStep!, state.context.totalSteps!]
    : undefined

  const canCreateProxy = state.can('CREATE_PROXY')

  const baseSettings = {
    steps,
    isLoading,
    url,
    disabled: !state.context.canGoToNext,
  }

  switch (true) {
    case state.matches('editing'):
      return {
        ...baseSettings,
        label: canCreateProxy ? t('create-proxy-btn') : t('open-earn.aave.vault-form.open-btn'),
        action: () => {
          if (canCreateProxy) {
            send('CREATE_PROXY')
          } else {
            send('CONFIRM_DEPOSIT')
          }
        },
      }
    case state.matches('proxyCreating'):
      return getProxyButtonSettings(
        state.context.refProxyMachine!.state,
        state.context.refProxyMachine!.send,
        t,
      )
    default:
      return {
        ...baseSettings,
        label: t('open-earn.aave.vault-form.open-btn'),
      }
  }
}
