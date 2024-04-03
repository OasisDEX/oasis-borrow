import { getMarketRate } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { getRpcProvider, NetworkIds, networksById } from 'blockchain/networks'
import { getTokenPrice } from 'blockchain/prices'
import type { Tickers } from 'blockchain/prices.types'
import { getToken } from 'blockchain/tokensMetadata'
import { amountFromWei } from 'blockchain/utils'
import { NEGATIVE_WAD_PRECISION } from 'components/constants'
import { isShortPosition } from 'features/omni-kit/helpers'
import { isPoolSupportingMultiply } from 'features/omni-kit/protocols/ajna/helpers'
import { morphoMarkets, settings } from 'features/omni-kit/protocols/morpho-blue/settings'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import { ProductHubProductType, type ProductHubSupportedNetworks } from 'features/productHub/types'
import { getTokenGroup } from 'handlers/product-hub/helpers'
import type {
  ProductHubHandlerResponse,
  ProductHubHandlerResponseData,
} from 'handlers/product-hub/types'
import { one, zero } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'
import { uniq } from 'lodash'
import {
  AdaptiveCurveIrm__factory as AdaptiveCurveIrmFactory,
  MorphoBlue__factory as MorphoBlueFactory,
} from 'types/ethers-contracts'

async function getMorphoMarketData(
  networkId: OmniSupportedNetworkIds,
  tickers: Tickers,
): Promise<ProductHubHandlerResponseData> {
  const rpcProvider = getRpcProvider(networkId)

  const AdaptiveCurveIrmContract = AdaptiveCurveIrmFactory.connect(
    getNetworkContracts(networkId).adaptiveCurveIrm.address,
    rpcProvider,
  )
  const MorphoBlueContract = MorphoBlueFactory.connect(
    getNetworkContracts(networkId).morphoBlue.address,
    rpcProvider,
  )

  const markets = morphoMarkets[networkId] ?? {}
  const prices = uniq(
    Object.keys(markets)
      .map((pair) => pair.split('-'))
      .flat(),
  ).reduce<Tickers>(
    (v, token) => ({ ...v, [token]: new BigNumber(getTokenPrice(token, tickers)) }),
    {},
  )

  try {
    return await Object.keys(markets).reduce<Promise<ProductHubHandlerResponseData>>(
      async (v, pair) => {
        const [collateralToken, quoteToken] = pair.split('-')
        // TODO - look via market address
        const marketId = markets[pair][0]

        const market = await MorphoBlueContract.market(marketId)
        const marketParams = await MorphoBlueContract.idToMarketParams(marketId)
        const rate = await AdaptiveCurveIrmContract.borrowRateView(marketParams, market)

        const totalSupplyAssets = amountFromWei(
          new BigNumber(market.totalSupplyAssets.toString()),
          getToken(quoteToken).precision,
        )
        const totalBorrowAssets = amountFromWei(
          new BigNumber(market.totalBorrowAssets.toString()),
          getToken(quoteToken).precision,
        )

        const quotePrice = prices[quoteToken]

        const label = `${collateralToken}/${quoteToken}`
        const network = networksById[networkId].name as ProductHubSupportedNetworks
        const protocol = LendingProtocol.MorphoBlue
        const maxLtv = new BigNumber(marketParams.lltv.toString())
          .shiftedBy(NEGATIVE_WAD_PRECISION)
          .toString()
        const liquidity = totalSupplyAssets.minus(totalBorrowAssets).times(quotePrice).toString()
        const fee = getMarketRate(rate.toString()).toString()
        const primaryTokenAddress = marketParams.collateralToken.toLowerCase()
        const secondaryTokenAddress = marketParams.loanToken.toLowerCase()

        const primaryTokenGroup = getTokenGroup(collateralToken)
        const secondaryTokenGroup = getTokenGroup(quoteToken)

        const isWithMultiply = isPoolSupportingMultiply({
          collateralToken,
          quoteToken,
          supportedTokens: settings.supportedMultiplyTokens[networkId],
        })

        const isShort = isShortPosition({ collateralToken })
        const multiplyStrategy = isShort ? `Short ${quoteToken}` : `Long ${collateralToken}`
        const multiplyStrategyType = isShort ? 'short' : 'long'
        const maxMultiply = BigNumber.max(
          one.plus(one.div(one.div(maxLtv).minus(one))),
          zero,
        ).toString()
        return {
          table: [
            ...(await v).table,
            {
              label,
              network,
              primaryToken: collateralToken,
              ...(primaryTokenGroup !== collateralToken && { primaryTokenGroup }),
              product: [
                ProductHubProductType.Borrow,
                ...(isWithMultiply ? [ProductHubProductType.Multiply] : []),
              ],
              protocol,
              secondaryToken: quoteToken,
              ...(secondaryTokenGroup !== quoteToken && { secondaryTokenGroup }),
              fee,
              liquidity,
              maxLtv,
              maxMultiply,
              primaryTokenAddress,
              secondaryTokenAddress,
              multiplyStrategy,
              multiplyStrategyType,
            },
          ],
          warnings: [],
        }
      },
      Promise.resolve({ table: [], warnings: [] }),
    )
  } catch (e) {
    // @ts-ignore
    return { table: [], warnings: [e.toString()] }
  }
}

export default async function (tickers: Tickers): ProductHubHandlerResponse {
  return Promise.all([getMorphoMarketData(NetworkIds.MAINNET, tickers)]).then((responses) => {
    return responses.reduce<ProductHubHandlerResponseData>(
      (v, response) => {
        return {
          table: [...v.table, ...response.table],
          warnings: [...v.warnings, ...response.warnings],
        }
      },
      { table: [], warnings: [] },
    )
  })
}
