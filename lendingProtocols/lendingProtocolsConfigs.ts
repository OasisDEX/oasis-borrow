import { LendingProtocol, LendingProtocolLabel } from 'lendingProtocols'
import { keyBy } from 'lodash'
import aaveV2Icon from 'public/static/img/protocol_icons/aave_v2_icon.svg'
import aaveV3Icon from 'public/static/img/protocol_icons/aave_v3_icon.svg'
import ajnaIcon from 'public/static/img/protocol_icons/ajna_icon.svg'
import makerIcon from 'public/static/img/protocol_icons/maker_icon.svg'

export type LendingProtocolConfig = {
  name: LendingProtocol
  label: LendingProtocolLabel
  icon: string
  scale: number
}

const aaveV2Config: LendingProtocolConfig = {
  name: LendingProtocol.AaveV2,
  label: LendingProtocolLabel.AaveV2,
  icon: aaveV2Icon as string,
  scale: 1,
}

const aaveV3Config: LendingProtocolConfig = {
  name: LendingProtocol.AaveV3,
  label: LendingProtocolLabel.AaveV3,
  icon: aaveV3Icon as string,
  scale: 1,
}

const ajnaConfig: LendingProtocolConfig = {
  name: LendingProtocol.Ajna,
  label: LendingProtocolLabel.Ajna,
  icon: ajnaIcon as string,
  scale: 1.4,
}

const makerConfig: LendingProtocolConfig = {
  name: LendingProtocol.Maker,
  label: LendingProtocolLabel.Maker,
  icon: makerIcon as string,
  scale: 1,
}

const lendingProtocols = [aaveV2Config, aaveV3Config, ajnaConfig, makerConfig]
export const lendingProtocolsByName = keyBy(lendingProtocols, 'name')
