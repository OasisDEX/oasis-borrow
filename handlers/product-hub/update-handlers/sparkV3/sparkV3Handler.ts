import { RiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds, NetworkNames, networksByName } from 'blockchain/networks'
import { getTokenPrice } from 'blockchain/prices'
import type { Tickers } from 'blockchain/prices.types'
import type { SparkV3SupportedNetwork } from 'blockchain/spark-v3'
import {
  getSparkV3EModeCategoryForAsset,
  getSparkV3ReserveConfigurationData,
  getSparkV3ReserveData,
} from 'blockchain/spark-v3'
import { wstethRiskRatio } from 'features/aave/constants'
import { settings } from 'features/omni-kit/protocols/spark/settings'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'
import { productHubSparkRewardsTooltip } from 'features/productHub/content'
import { aaveLikeAprToApy, mapOmniToProductHubAutomations } from 'handlers/product-hub/helpers'
import { emptyYields } from 'handlers/product-hub/helpers/empty-yields'
import type { ProductHubHandlerResponse } from 'handlers/product-hub/types'
import { ensureFind } from 'helpers/ensure-find'
import type {
  AaveLikeYieldsResponse,
  FilterYieldFieldsType,
} from 'lendingProtocols/aave-like-common'
import { memoize } from 'lodash'

import { sparkV3ProductHubProducts } from './sparkV3Products'

type SparkV3Networks = NetworkNames.ethereumMainnet

const networkNameToIdMap = {
  [NetworkNames.ethereumMainnet]: NetworkIds.MAINNET,
}

const getSparkV3TokensData = async (networkName: SparkV3Networks, tickers: Tickers) => {
  const currentNetworkProducts = sparkV3ProductHubProducts.filter(
    (product) => product.network === networkName,
  )
  const networkId = networkNameToIdMap[networkName] as SparkV3SupportedNetwork
  const primaryTokensList = [
    ...new Set(
      currentNetworkProducts
        .map((product) =>
          product.depositToken
            ? [product.primaryToken, product.depositToken]
            : [product.primaryToken],
        )
        .flatMap((tokens) => tokens),
    ),
  ]
  const secondaryTokensList = [
    ...new Set(currentNetworkProducts.map((product) => product.secondaryToken)),
  ]
  // reserveData -> liq available and variable fee
  const tokensReserveDataPromises = secondaryTokensList.map(async (token) => {
    const reserveData = await getSparkV3ReserveData({ token, networkId })
    const debtTokenPrice = new BigNumber(getTokenPrice(token, tickers))
    return {
      [token]: {
        liquidity: reserveData.totalSpToken
          .minus(reserveData.totalStableDebt)
          .minus(reserveData.totalVariableDebt)
          .times(debtTokenPrice),
        fee: aaveLikeAprToApy(reserveData.variableBorrowRate),
      },
    }
  })

  // reserveData -> max multiple
  const tokensReserveConfigurationDataPromises = primaryTokensList.map(async (token) => {
    const reserveConfigurationData = await getSparkV3ReserveConfigurationData({ token, networkId })
    return {
      [token]: {
        maxLtv: reserveConfigurationData.ltv,
        riskRatio: new RiskRatio(reserveConfigurationData.ltv, RiskRatio.TYPE.LTV),
      },
    }
  })
  const [tokensReserveData, tokensReserveConfigurationData] = await Promise.all([
    Promise.all(tokensReserveDataPromises),
    Promise.all(tokensReserveConfigurationDataPromises),
  ])
  return {
    [networkName]: {
      tokensReserveData,
      tokensReserveConfigurationData,
    },
  }
}

export default async function (tickers: Tickers): ProductHubHandlerResponse {
  // mainnet
  const memoizedTokensData = memoize(getSparkV3TokensData)
  const memoizedEModeCategoryData = memoize(getSparkV3EModeCategoryForAsset)
  const sparkV3NetworksList = [
    ...new Set(sparkV3ProductHubProducts.map((product) => product.network)),
  ]
  const getSparkV3TokensDataPromises = sparkV3NetworksList.map((networkName) =>
    memoizedTokensData(networkName as SparkV3Networks, tickers),
  )

  const yieldsPromisesMap: Record<
    string,
    (risk: RiskRatio, fields: FilterYieldFieldsType[]) => Promise<AaveLikeYieldsResponse>
  > = {
    'WSTETH/ETH': emptyYields,
    'RETH/ETH': emptyYields,
    'SDAI/USDC': emptyYields,
    'SDAI/USDT': emptyYields,
  }
  // getting the APYs
  const earnProducts = sparkV3ProductHubProducts.filter(({ product }) =>
    product.includes(OmniProductType.Earn),
  )
  const earnProductsPromises = earnProducts.map(async (product) => {
    const networkId = networkNameToIdMap[product.network as SparkV3Networks]
    const [primaryTokenEModeCategory, secondaryTokenEModeCategory, tokensReserveData] =
      await Promise.all([
        memoizedEModeCategoryData({
          token: product.primaryToken,
          networkId: networkId as SparkV3SupportedNetwork,
        }),
        memoizedEModeCategoryData({
          token: product.secondaryToken,
          networkId: networkId as SparkV3SupportedNetwork,
        }),
        memoizedTokensData(product.network as SparkV3Networks, tickers),
      ])
    const isEModeTokenPair =
      !primaryTokenEModeCategory.isZero() &&
      primaryTokenEModeCategory.eq(secondaryTokenEModeCategory)
    const riskRatio = isEModeTokenPair
      ? wstethRiskRatio
      : ensureFind(
          tokensReserveData[product.network as SparkV3Networks].tokensReserveConfigurationData.find(
            (data) => data[product.primaryToken],
          ),
        )[product.primaryToken].riskRatio
    const response = await yieldsPromisesMap[product.label](riskRatio, ['7Days'])
    return {
      [product.label]: response.annualisedYield7days?.div(100), // we do 5 as 5% and FE needs 0.05 as 5%
    }
  })
  return Promise.all([
    Promise.all(getSparkV3TokensDataPromises),
    Promise.all(earnProductsPromises),
  ]).then(([sparkV3TokensDataList, earnProductsYields]) => {
    const sparkV3TokensData = sparkV3TokensDataList[0] // only one (ethereum) now
    return {
      table: sparkV3ProductHubProducts.map((product) => {
        const { tokensReserveData, tokensReserveConfigurationData } =
          sparkV3TokensData[product.network as SparkV3Networks]
        const { secondaryToken, primaryToken, label, primaryTokenGroup } = product
        const { liquidity, fee } = ensureFind(
          tokensReserveData.find((data) => data[secondaryToken]),
        )[secondaryToken]
        const weeklyNetApy = earnProductsYields.find((data) => data[label])
        const { maxLtv, riskRatio } = ensureFind(
          tokensReserveConfigurationData.find((data) => data[primaryToken]),
        )[primaryToken]
        const tokensAddresses = getNetworkContracts(NetworkIds.MAINNET).tokens
        // rewards are available for the ETH-like+ BTC-like/DAI pairs
        const hasRewards =
          !!primaryTokenGroup &&
          !!secondaryToken &&
          ['ETH', 'BTC'].includes(primaryTokenGroup) &&
          secondaryToken === 'DAI'

        return {
          ...product,
          primaryTokenAddress: tokensAddresses[primaryToken].address,
          secondaryTokenAddress: tokensAddresses[secondaryToken].address,
          maxMultiply:
            product.label === 'WSTETH/ETH'
              ? wstethRiskRatio.multiple.toString()
              : riskRatio.multiple.toString(),
          maxLtv: maxLtv.toString(),
          liquidity: liquidity.toString(),
          fee: fee.toString(),
          tooltips: {
            fee: hasRewards ? productHubSparkRewardsTooltip : undefined,
          },
          weeklyNetApy: weeklyNetApy?.[label] ? weeklyNetApy[label]?.toString() : undefined,
          hasRewards,
          automationFeatures: mapOmniToProductHubAutomations({
            networkId: networksByName[product.network].id as OmniSupportedNetworkIds,
            omniAutomations: settings.availableAutomations,
          }),
        }
      }),
      warnings: [],
    }
  })
}
