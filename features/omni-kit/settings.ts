import { omniKitAaveSettings } from 'features/omni-kit/protocols/aave-like/settings'
import { settings as ajnaSettings } from 'features/omni-kit/protocols/ajna/settings'
import { settings as morphoSettings } from 'features/omni-kit/protocols/morpho-blue/settings'
import { omniKitSparkSettings } from 'features/omni-kit/protocols/spark/settings'
import type { OmniProtocolsSettings } from 'features/omni-kit/types'
import { LendingProtocol } from 'lendingProtocols'

export const omniProtocolSettings: OmniProtocolsSettings = {
  [LendingProtocol.Ajna]: ajnaSettings,
  [LendingProtocol.MorphoBlue]: morphoSettings,
  [LendingProtocol.AaveV3]: omniKitAaveSettings,
  [LendingProtocol.SparkV3]: omniKitSparkSettings,
}
