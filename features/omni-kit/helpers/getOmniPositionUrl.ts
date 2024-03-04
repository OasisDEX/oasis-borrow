import type { NetworkNames } from 'blockchain/networks'
import type { OmniProductType } from 'features/omni-kit/types'
import { LendingProtocol } from 'lendingProtocols'

interface GetOmniPositionUrlParams {
  collateralAddress?: string
  collateralToken: string
  isPoolOracless?: boolean
  networkName: NetworkNames
  positionId?: string
  productType: OmniProductType
  protocol: LendingProtocol
  quoteAddress?: string
  quoteToken: string
}

export function getOmniPositionUrl({
  collateralAddress,
  collateralToken,
  isPoolOracless,
  networkName,
  positionId,
  productType,
  protocol,
  quoteAddress,
  quoteToken,
}: GetOmniPositionUrlParams) {
  const protocolUrlMap = {
    [LendingProtocol.AaveV2]: 'aave/v2',
    [LendingProtocol.AaveV3]: 'aave/v3',
    [LendingProtocol.SparkV3]: 'spark',
    [LendingProtocol.Ajna]: protocol,
    [LendingProtocol.MorphoBlue]: protocol,
    [LendingProtocol.Maker]: protocol,
  }

  const productUrl = isPoolOracless
    ? `/${networkName}/${protocolUrlMap[protocol]}/${productType}/${collateralAddress}-${quoteAddress}`
    : `/${networkName}/${protocolUrlMap[protocol]}/${productType}/${collateralToken}-${quoteToken}`

  return `${productUrl}${positionId ? `/${positionId}` : ''}`
}
