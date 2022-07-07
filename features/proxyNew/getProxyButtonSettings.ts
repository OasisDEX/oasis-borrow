import { Event, EventData } from 'xstate'

import { SidebarSectionFooterButtonSettings } from '../../components/sidebar/SidebarSectionFooter'
import { ProxyEvent, ProxySateMachineState } from './state/proxyStateMachine.types'

export function getProxyButtonSettings(
  state: ProxySateMachineState,
  send: (event: Event<ProxyEvent>, payload?: EventData | undefined) => void,
  t: (key: string, options?: any) => string,
): SidebarSectionFooterButtonSettings {
  const isLoading = state.matches('proxyInProgress')

  const baseSettings = {
    isLoading,
    disabled: false,
  }

  switch (true) {
    case state.matches('proxyIdle'):
      return {
        ...baseSettings,
        label: t('create-proxy-btn'),
        action: () => send('START'),
      }
    case state.matches('proxyInProgress'):
      return {
        ...baseSettings,
        label: t('creating-proxy'),
      }
    case state.matches('proxyFailure'):
      return {
        ...baseSettings,
        label: t('retry-create-proxy'),
        action: () => send('RETRY'),
      }
    default:
      return { ...baseSettings, label: t('create-proxy-btn') }
  }
}
