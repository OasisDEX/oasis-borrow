import { SidebarSectionFooterButtonSettings } from '../../components/sidebar/SidebarSectionFooter'
import { ProxyStateMachineInstance } from './state'

export function getProxyButtonSettings(
  proxy: ProxyStateMachineInstance | undefined,
  t: (key: string, options?: any) => string,
): SidebarSectionFooterButtonSettings | undefined {
  if (proxy === undefined) {
    return undefined
  }
  const [state, send] = proxy
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
