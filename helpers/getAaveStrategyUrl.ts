import { NetworkNames } from 'blockchain/networks'
import { ProductType } from 'features/aave/common'
import { AaveLendingProtocol, LendingProtocol } from 'lendingProtocols'

type AaveVersionProps = {
  network: NetworkNames
  protocol: AaveLendingProtocol
  strategyType: ProductType
  slug: string
}

export function mapAaveProtocol(protocol: AaveVersionProps['protocol']) {
  return {
    [LendingProtocol.AaveV2]: 'v2',
    [LendingProtocol.AaveV3]: 'v3',
  }[protocol]
}

export function getAaveStrategyUrl({ protocol, strategyType, slug, network }: AaveVersionProps) {
  return `/${network}/aave/${mapAaveProtocol(protocol)}/${strategyType.toLocaleLowerCase()}/${slug}`
}
