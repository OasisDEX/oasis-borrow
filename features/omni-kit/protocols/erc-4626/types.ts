import type { OmniSupportedProtocols } from 'features/omni-kit/types'

export interface Erc4626Config {
  curator: {
    label: string
    url: string
  }
  id: string
  name: string
  protocol: OmniSupportedProtocols
  token: string
}
