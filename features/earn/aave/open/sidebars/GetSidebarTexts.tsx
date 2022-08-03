import { getProxyButtonSettings } from '@oasis-borrow/proxy'
import { ProxyStateMachineInstance } from '@oasis-borrow/proxy/state'

import { SidebarSectionFooterButtonSettings } from '../../../../../components/sidebar/SidebarSectionFooter'
import { OpenAaveStateMachineInstance } from '../state/types'

export function GetSidebarTexts(
  [state, send]: OpenAaveStateMachineInstance,
  proxy: ProxyStateMachineInstance,
  t: (key: string, options?: any) => string,
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
    disabled: false,
    label: t('open-earn.aave.vault-form.open-btn'),
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
      return getProxyButtonSettings(proxy, t) || { ...baseSettings }
    default:
      return {
        ...baseSettings,
      }
  }
}
