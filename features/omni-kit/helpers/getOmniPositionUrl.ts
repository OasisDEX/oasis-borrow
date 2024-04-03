import type { NetworkNames } from 'blockchain/networks'
import { getOmniProtocolUrlMap } from 'features/omni-kit/helpers'
import { erc4626VaultsByName } from 'features/omni-kit/protocols/erc-4626/settings'
import { Erc4626PseudoProtocol } from 'features/omni-kit/protocols/morpho-blue/constants'
import type { OmniProductType } from 'features/omni-kit/types'
import { LendingProtocol } from 'lendingProtocols'

interface GetOmniPositionUrlParams {
  collateralAddress?: string
  collateralToken: string
  isPoolOracless?: boolean
  label?: string
  networkName: NetworkNames
  positionId?: string
  productType: OmniProductType
  protocol: LendingProtocol
  pseudoProtocol?: string
  quoteAddress?: string
  quoteToken: string
}

export function getOmniPositionUrl({
  collateralAddress,
  collateralToken,
  isPoolOracless,
  label,
  networkName,
  positionId,
  productType,
  protocol,
  pseudoProtocol,
  quoteAddress,
  quoteToken,
}: GetOmniPositionUrlParams) {
  const resolvedPositionId = positionId ? `/${positionId}` : ''

  if ([LendingProtocol.AaveV3, LendingProtocol.SparkV3].includes(protocol)) {
    return `/${networkName}/${
      {
        [LendingProtocol.AaveV3]: 'aave/v3',
        [LendingProtocol.SparkV3]: 'spark',
      }[protocol as LendingProtocol.SparkV3 | LendingProtocol.AaveV3]
    }/${productType}/${collateralToken}-${quoteToken}`
  }

  if (pseudoProtocol === Erc4626PseudoProtocol && label) {
    const { id } = erc4626VaultsByName[label]

    return `/${networkName}/${Erc4626PseudoProtocol}/${productType}/${id}${resolvedPositionId}`
  }

  const productUrl = isPoolOracless
    ? `/${networkName}/${getOmniProtocolUrlMap(
        protocol,
      )}/${productType}/${collateralAddress}-${quoteAddress}`
    : `/${networkName}/${getOmniProtocolUrlMap(
        protocol,
      )}/${productType}/${collateralToken}-${quoteToken}`

  return `${productUrl}${resolvedPositionId}`
}
