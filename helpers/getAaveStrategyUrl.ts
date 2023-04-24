import { ProductType } from 'features/aave/common'
import { AaveLendingProtocol, LendingProtocol } from 'lendingProtocols'

type AaveVersionProps = {
  protocol: AaveLendingProtocol
  action?: 'open' // others?
  strategyType: ProductType
  slug: string
}

export function mapAaveProtocol(protocol: AaveVersionProps['protocol']) {
  return {
    [LendingProtocol.AaveV2]: 'v2',
    [LendingProtocol.AaveV3]: 'v3',
  }[protocol]
}

export function getAaveStrategyUrl({
  protocol,
  action = 'open',
  strategyType,
  slug,
}: AaveVersionProps) {
  return `/${strategyType.toLocaleLowerCase()}/aave/${mapAaveProtocol(protocol)}/${action}/${slug}`
}
