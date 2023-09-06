import { LendingProtocol, LendingProtocolLabel } from 'lendingProtocols'
import { keyBy } from 'lodash'
import aaveIcon from 'public/static/img/protocol_icons/aave_icon.svg'
import aaveV2Logo from 'public/static/img/protocol_icons/aave_v2_logo.svg'
import aaveV3Logo from 'public/static/img/protocol_icons/aave_v3_logo.svg'
import ajnaIcon from 'public/static/img/protocol_icons/ajna_icon.svg'
import ajnaLogo from 'public/static/img/protocol_icons/ajna_logo.svg'
import makerIcon from 'public/static/img/protocol_icons/maker_icon.svg'
import makerLogo from 'public/static/img/protocol_icons/maker_logo.svg'
import sparkIcon from 'public/static/img/protocol_icons/spark_icon.svg'
import sparkLogo from 'public/static/img/protocol_icons/spark_logo.svg'

export type LendingProtocolConfig = {
  name: LendingProtocol
  label: LendingProtocolLabel
  icon: string
  logo: string
  logoScale: number
}

const aaveV2Config: LendingProtocolConfig = {
  name: LendingProtocol.AaveV2,
  label: LendingProtocolLabel.aavev2,
  icon: aaveIcon as string,
  logo: aaveV2Logo as string,
  logoScale: 1,
}

const aaveV3Config: LendingProtocolConfig = {
  name: LendingProtocol.AaveV3,
  label: LendingProtocolLabel.aavev3,
  icon: aaveIcon as string,
  logo: aaveV3Logo as string,
  logoScale: 1,
}

const ajnaConfig: LendingProtocolConfig = {
  name: LendingProtocol.Ajna,
  label: LendingProtocolLabel.ajna,
  icon: ajnaIcon as string,
  logo: ajnaLogo as string,
  logoScale: 1.4,
}

const makerConfig: LendingProtocolConfig = {
  name: LendingProtocol.Maker,
  label: LendingProtocolLabel.maker,
  icon: makerIcon as string,
  logo: makerLogo as string,
  logoScale: 1,
}

const sparkConfig: LendingProtocolConfig = {
  name: LendingProtocol.SparkV3,
  label: LendingProtocolLabel.sparkv3,
  icon: sparkIcon as string,
  logo: sparkLogo as string,
  logoScale: 1.6,
}

const lendingProtocols = [aaveV2Config, aaveV3Config, ajnaConfig, makerConfig, sparkConfig]

export const lendingProtocolsByName = keyBy(lendingProtocols, 'name')
