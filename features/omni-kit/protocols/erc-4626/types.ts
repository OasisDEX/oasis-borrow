import type { OmniSupportedProtocols } from 'features/omni-kit/types'

export interface Erc4626Config {
  name: string
  protocol: OmniSupportedProtocols
  token: string
}
