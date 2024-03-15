import { erc4626VaultsByName } from 'features/omni-kit/protocols/erc-4626/settings'
import { Erc4626PseudoProtocol } from 'features/omni-kit/protocols/morpho-blue/constants'
import type { OmniProtocolSettings, OmniSupportedNetworkIds } from 'features/omni-kit/types'

interface GetOmniRawProtocolParams {
  label?: string
  networkId: OmniSupportedNetworkIds
  pseudoProtocol?: string
  settings: OmniProtocolSettings
}

export const getOmniRawProtocol = ({
  label,
  networkId,
  settings,
  pseudoProtocol,
}: GetOmniRawProtocolParams) => {
  // could be changed into switch case if there would be more pseudo protocols
  if (pseudoProtocol === Erc4626PseudoProtocol && label)
    return `${settings.rawName[networkId]}-${erc4626VaultsByName[label].address.toLowerCase()}`
  return settings.rawName[networkId] as string
}
