import type { Vault } from '@prisma/client'
import BigNumber from 'bignumber.js'
import { networksById } from 'blockchain/networks'
import { getOmniPositionUrl } from 'features/omni-kit/helpers'
import { getMorphoOraclePrices } from 'features/omni-kit/protocols/morpho-blue/helpers'
import { morphoMarkets } from 'features/omni-kit/protocols/morpho-blue/settings'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import type { MorphoDpmPositionsMarket } from 'handlers/portfolio/positions/handlers/morpho-blue/types'
import type { TokensPricesList } from 'handlers/portfolio/positions/helpers'
import {
  getBorrowishPositionType,
  getDefaultBorrowishPositionType,
} from 'handlers/portfolio/positions/helpers'
import type { DpmSubgraphData } from 'handlers/portfolio/positions/helpers/getAllDpmsForWallet'
import { getTokenDisplayName } from 'helpers/getTokenDisplayName'
import { LendingProtocol } from 'lendingProtocols'

interface GetMorphoPositionInfoParams {
  apiVaults: Vault[]
  dpmList: DpmSubgraphData[]
  market: MorphoDpmPositionsMarket
  networkId: OmniSupportedNetworkIds
  positionId: string
  prices: TokensPricesList
  proxyAddress: string
  protocolRaw: string
}

export async function getMorphoPositionInfo({
  apiVaults,
  dpmList,
  market: { collateralToken, debtToken, id: marketId },
  networkId,
  positionId,
  prices,
  proxyAddress,
  protocolRaw,
}: GetMorphoPositionInfoParams) {
  const primaryToken = getTokenDisplayName(collateralToken.symbol)
  const secondaryToken = getTokenDisplayName(debtToken.symbol)

  const oraclePrices = await getMorphoOraclePrices({
    collateralPrecision: Number(collateralToken.decimals),
    collateralToken: primaryToken,
    marketId,
    networkId,
    quotePrecision: Number(debtToken.decimals),
    quoteToken: secondaryToken,
    collateralPrice: new BigNumber(prices[primaryToken]),
    quotePrice: new BigNumber(prices[secondaryToken]),
  })
  const collateralPrice = oraclePrices[primaryToken]
  const quotePrice = oraclePrices[secondaryToken]

  const networkName = networksById[networkId].name
  const networkMarkets = morphoMarkets[networkId] ?? {}
  const pairId = networkMarkets[`${primaryToken}-${secondaryToken}`].indexOf(marketId) + 1

  const defaultType = getDefaultBorrowishPositionType({
    collateralTokenAddress: collateralToken.address,
    dpmList,
    protocolRaw,
    proxyAddress,
    quoteTokenAddress: debtToken.address,
  })

  const type = getBorrowishPositionType({
    apiVaults,
    defaultType,
    networkId,
    positionId: Number(positionId),
    protocol: LendingProtocol.MorphoBlue,
  })
  const url = getOmniPositionUrl({
    collateralToken: primaryToken,
    networkName,
    pairId,
    positionId,
    productType: type,
    protocol: LendingProtocol.MorphoBlue,
    quoteToken: secondaryToken,
  })

  return {
    collateralPrice,
    networkName,
    pairId,
    primaryToken,
    quotePrice,
    secondaryToken,
    type,
    url,
  }
}
