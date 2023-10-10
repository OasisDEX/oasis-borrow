import type { NetworkNames } from 'blockchain/networks'
import type { ProductType } from 'features/aave/types'
import type { AaveLendingProtocol, SparkLendingProtocol } from 'lendingProtocols'
import { LendingProtocol } from 'lendingProtocols'

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

export function mapAaveLikeUrlSlug(protocol: AaveVersionProps['protocol']) {
  return {
    [LendingProtocol.AaveV2]: 'aave',
    [LendingProtocol.AaveV3]: 'aave',
    [LendingProtocol.SparkV3]: 'spark',
  }[protocol]
}

export function getAaveLikeOpenStrategyUrl({
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
