import type { Vault } from '@prisma/client'
import BigNumber from 'bignumber.js'
import { networksById } from 'blockchain/networks'
import { getOmniPositionUrl } from 'features/omni-kit/helpers'
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

export function getMorphoPositionInfo({
  apiVaults,
  dpmList,
  market: { collateralToken, debtToken },
  networkId,
  positionId,
  prices,
  proxyAddress,
  protocolRaw,
}: GetMorphoPositionInfoParams) {
  const primaryToken = getTokenDisplayName(collateralToken.symbol)
  const secondaryToken = getTokenDisplayName(debtToken.symbol)
  const collateralPrice = new BigNumber(prices[collateralToken.symbol.toUpperCase()])
  const quotePrice = new BigNumber(prices[debtToken.symbol.toUpperCase()])
  const networkName = networksById[networkId].name

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
    positionId,
    productType: type,
    protocol: LendingProtocol.MorphoBlue,
    quoteToken: secondaryToken,
  })

  return {
    collateralPrice,
    networkName,
    primaryToken,
    quotePrice,
    secondaryToken,
    type,
    url,
  }
}
