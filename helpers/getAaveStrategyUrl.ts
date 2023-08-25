import { NetworkNames } from 'blockchain/networks'
import { ProductType } from 'features/aave/types'
import { AaveLendingProtocol, LendingProtocol, SparkLendingProtocol } from 'lendingProtocols'

type AaveVersionProps = {
  network: NetworkNames
  protocol: AaveLendingProtocol | SparkLendingProtocol
  strategyType: ProductType
  slug: string
  aaveLikeProduct: 'aave' | 'spark'
}

export function mapAaveProtocol(protocol: AaveVersionProps['protocol']) {
  return {
    [LendingProtocol.AaveV2]: 'v2',
    [LendingProtocol.AaveV3]: 'v3',
    [LendingProtocol.SparkV3]: 'v3',
  }[protocol]
}

export function getAaveStrategyUrl({
  protocol,
  strategyType,
  slug,
  network,
  aaveLikeProduct,
}: AaveVersionProps) {
  return `/${network}/${aaveLikeProduct}/${mapAaveProtocol(
    protocol,
  )}/${strategyType.toLocaleLowerCase()}/${slug}`
}
