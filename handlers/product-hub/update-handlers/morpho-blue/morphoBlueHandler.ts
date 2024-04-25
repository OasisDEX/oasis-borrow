import { getMarketRate } from '@oasisdex/dma-library'
import { EarnStrategies } from '@prisma/client'
import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { getRpcProvider, NetworkIds, networksById } from 'blockchain/networks'
import { getTokenPrice } from 'blockchain/prices'
import type { Tickers } from 'blockchain/prices.types'
import { getToken } from 'blockchain/tokensMetadata'
import { amountFromWei } from 'blockchain/utils'
import { NEGATIVE_WAD_PRECISION } from 'components/constants'
import { lambdaPercentageDenomination } from 'features/aave/constants'
import { isShortPosition } from 'features/omni-kit/helpers'
import { isYieldLoopPair } from 'features/omni-kit/helpers/isYieldLoopPair'
import { isPoolSupportingMultiply } from 'features/omni-kit/protocols/ajna/helpers'
import { morphoMarkets, settings } from 'features/omni-kit/protocols/morpho-blue/settings'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'
import { type ProductHubSupportedNetworks } from 'features/productHub/types'
import { getTokenGroup } from 'handlers/product-hub/helpers'
import type {
  ProductHubHandlerResponse,
  ProductHubHandlerResponseData,
} from 'handlers/product-hub/types'
import { getYieldsRequest } from 'helpers/lambda/yields'
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

  const networkMarkets = morphoMarkets[networkId] ?? {}
  const markets = Object.keys(networkMarkets).flatMap((pair) =>
    networkMarkets[pair].map((marketId) => ({ pair, marketId })),
  )
  const prices = uniq(markets.flatMap(({ pair }) => pair.split('-'))).reduce<Tickers>(
    (v, token) => ({ ...v, [token]: new BigNumber(getTokenPrice(token, tickers)) }),
    {},
  )

  try {
    return await markets.reduce<Promise<ProductHubHandlerResponseData>>(
      async (v, { marketId, pair }) => {
        const [collateralToken, quoteToken] = pair.split('-')
        const pairId =
          networkMarkets[pair].length > 1 ? `-${networkMarkets[pair].indexOf(marketId) + 1}` : ''

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

        const label = `${collateralToken}/${quoteToken}${pairId}`
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

        const isYieldLoop = isYieldLoopPair({
          collateralToken,
          debtToken: quoteToken,
        })

        const weeklyNetApyCall = await (isYieldLoop
          ? getYieldsRequest(
              {
                actionSource: 'product-hub handler morpho-blue',
                quoteToken,
                collateralToken,
                networkId,
                protocol: LendingProtocol.MorphoBlue,
                ltv: new BigNumber(maxLtv),
              },
              process.env.FUNCTIONS_API_URL,
            )
          : Promise.resolve(null))
        const weeklyNetApy = new BigNumber(weeklyNetApyCall?.results?.apy7d || zero)
          .div(lambdaPercentageDenomination)
          .toString()

        const isShort = isShortPosition({ collateralToken })
        const multiplyStrategy = isShort ? `Short ${quoteToken}` : `Long ${collateralToken}`
        const earnStrategyDescription = `${collateralToken}/${quoteToken} Yield Loop`
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
                OmniProductType.Borrow,
                ...(isWithMultiply && !isYieldLoop ? [OmniProductType.Multiply] : []),
                ...(isYieldLoop ? [OmniProductType.Earn] : []),
              ],
              protocol,
              secondaryToken: quoteToken,
              ...(secondaryTokenGroup !== quoteToken && { secondaryTokenGroup }),
              fee,
              liquidity,
              maxLtv,
              maxMultiply,
              weeklyNetApy,
              primaryTokenAddress,
              secondaryTokenAddress,
              multiplyStrategy,
              multiplyStrategyType,
              ...(isYieldLoop && {
                earnStrategy: EarnStrategies.yield_loop,
                earnStrategyDescription,
                managementType: 'active',
              }),
              automationFeatures: settings.availableAutomations[networkId],
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
