import type { NetworkNames } from 'blockchain/networks'
import type { UserDpmAccount } from 'blockchain/userDpmProxies.types'
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

export function mapAaveLikeProtocolVersion(protocol: AaveVersionProps['protocol']) {
  return {
    [LendingProtocol.AaveV2]: 'v2',
    [LendingProtocol.AaveV3]: 'v3',
    [LendingProtocol.SparkV3]: 'v3',
  }[protocol]
}

export function mapAaveLikeProtocolSlug(protocol: AaveVersionProps['protocol']) {
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
  return `/${network}/${aaveLikeProduct}/${mapAaveLikeProtocolVersion(
    protocol,
  )}/${strategyType.toLocaleLowerCase()}/${slug}`
}

export function getAaveLikePositionUrl({
  protocol,
  network,
  userDpmAccount: { vaultId },
}: Pick<AaveVersionProps, 'protocol' | 'network'> & { userDpmAccount: UserDpmAccount }) {
  return `/${network}/${mapAaveLikeProtocolSlug(protocol)}/${mapAaveLikeProtocolVersion(protocol)}/${vaultId}`
}
