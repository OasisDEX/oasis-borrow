import { LendingProtocol, LendingProtocolLabelType } from 'lendingProtocols'
import { keyBy } from 'lodash'
import aaveV2Icon from 'public/static/img/protocol_icons/aave_v2_icon.svg'
import aaveV3Icon from 'public/static/img/protocol_icons/aave_v3_icon.svg'
import ajnaIcon from 'public/static/img/protocol_icons/ajna_icon.svg'
import makerIcon from 'public/static/img/protocol_icons/maker_icon.svg'

export type ProtocolConfig = {
  name: LendingProtocol
  label: LendingProtocolLabelType
  icon: string
  scale: number
}

const aaveV2Config: ProtocolConfig = {
  name: LendingProtocol.AaveV2,
  label: 'Aave V2',
  icon: aaveV2Icon as string,
  scale: 1,
}

const aaveV3Config: ProtocolConfig = {
  name: LendingProtocol.AaveV3,
  label: 'Aave V3',
  icon: aaveV3Icon as string,
  scale: 1,
}

const ajnaConfig: ProtocolConfig = {
  name: LendingProtocol.Ajna,
  label: 'Ajna',
  icon: ajnaIcon as string,
  scale: 1.4,
}

const makerConfig: ProtocolConfig = {
  name: LendingProtocol.Maker,
  label: 'Maker',
  icon: makerIcon as string,
  scale: 1,
}

const protocols = [aaveV2Config, aaveV3Config, ajnaConfig, makerConfig]
export const protocolsByName = keyBy(protocols, 'name')
