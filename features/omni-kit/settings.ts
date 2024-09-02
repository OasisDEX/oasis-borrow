import {
  settingsV2 as aaveSettingsV2,
  settingsV3 as aaveSettingsV3,
} from 'features/omni-kit/protocols/aave/settings'
import { settings as ajnaSettings } from 'features/omni-kit/protocols/ajna/settings'
import { settings as makerSettings } from 'features/omni-kit/protocols/maker/settings'
import { settings as morphoSettings } from 'features/omni-kit/protocols/morpho-blue/settings'
import { settings as sparkSettings } from 'features/omni-kit/protocols/spark/settings'
import type { OmniProtocolsSettings } from 'features/omni-kit/types'
import { LendingProtocol } from 'lendingProtocols'

export const omniProtocolSettings: OmniProtocolsSettings = {
  [LendingProtocol.Ajna]: ajnaSettings,
  [LendingProtocol.MorphoBlue]: morphoSettings,
  [LendingProtocol.AaveV2]: aaveSettingsV2,
  [LendingProtocol.AaveV3]: aaveSettingsV3,
  [LendingProtocol.SparkV3]: sparkSettings,
  [LendingProtocol.Maker]: makerSettings,
}
