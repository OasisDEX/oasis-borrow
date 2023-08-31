import { RiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds, NetworkNames } from 'blockchain/networks'
import { getTokenPrice, Tickers } from 'blockchain/prices'
import {
  getSparkV3ReserveConfigurationData,
  getSparkV3ReserveData,
  SparkV3SupportedNetwork,
} from 'blockchain/spark-v3'
import { wstethRiskRatio } from 'features/aave/constants'
import { ProductHubProductType } from 'features/productHub/types'
import { emptyYields } from 'handlers/product-hub/helpers/empty-yields'
import { ProductHubHandlerResponse } from 'handlers/product-hub/types'
import { AaveLikeYieldsResponse, FilterYieldFieldsType } from 'lendingProtocols/aave-like-common'
import { memoize } from 'lodash'

import { sparkV3ProductHubProducts } from './sparkV3Products'

type SparkV3Networks = NetworkNames.ethereumMainnet

const networkNameToIdMap = {
  [NetworkNames.ethereumMainnet]: NetworkIds.MAINNET,
}

const getSparkV3TokensData = memoize(async (networkName: SparkV3Networks, tickers: Tickers) => {
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
  console.log('secondaryTokensList', secondaryTokensList)
  const tokensReserveDataPromises = secondaryTokensList.map(async (token) => {
    const reserveData = await getSparkV3ReserveData({ token, networkId })
    const debtTokenPrice = new BigNumber(getTokenPrice(token, tickers))
    console.log('fee', token, reserveData.variableBorrowRate.toString())
    return {
      [token]: {
        liquidity: reserveData.totalSpToken
          .minus(reserveData.totalStableDebt)
          .minus(reserveData.totalVariableDebt)
          .times(debtTokenPrice),
        fee: reserveData.variableBorrowRate,
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
})

export default async function (tickers: Tickers): ProductHubHandlerResponse {
  // mainnet
  const sparkV3NetworksList = [
    ...new Set(sparkV3ProductHubProducts.map((product) => product.network)),
  ]
  console.log('sparkV3NetworksList', sparkV3NetworksList)
  const getSparkV3TokensDataPromises = sparkV3NetworksList.map((networkName) =>
    getSparkV3TokensData(networkName as SparkV3Networks, tickers),
  )

  const yieldsPromisesMap: Record<
    string,
    (risk: RiskRatio, fields: FilterYieldFieldsType[]) => Promise<AaveLikeYieldsResponse>
  > = {
    'WSTETH/ETH': emptyYields,
    'CBETH/ETH': emptyYields,
    'RETH/ETH': emptyYields,
    'SDAI/GHO': emptyYields,
    'SDAI/USDC': emptyYields,
    'SDAI/LUSD': emptyYields,
    'SDAI/FRAX': emptyYields,
  }
  // getting the APYs
  const earnProducts = sparkV3ProductHubProducts.filter(({ product }) =>
    product.includes(ProductHubProductType.Earn),
  )
  const earnProductsPromises = earnProducts.map(async (product) => {
    const tokensReserveData = await getSparkV3TokensData(
      product.network as SparkV3Networks,
      tickers,
    )

    const riskRatio =
      product.label === 'WSTETH/ETH'
        ? wstethRiskRatio
        : tokensReserveData[product.network as SparkV3Networks].tokensReserveConfigurationData.find(
            (data) => data[product.primaryToken],
          )![product.primaryToken].riskRatio
    const response = await yieldsPromisesMap[product.label as keyof typeof yieldsPromisesMap](
      riskRatio,
      ['7Days'],
    )
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
        const { secondaryToken, primaryToken, label } = product
        const { liquidity, fee } = tokensReserveData.find((data) => data[secondaryToken])![
          secondaryToken
        ]
        const weeklyNetApy = earnProductsYields.find((data) => data[label]) || {}
        const { maxLtv, riskRatio } = tokensReserveConfigurationData.find(
          (data) => data && data[primaryToken],
        )![primaryToken]
        const tokensAddresses = getNetworkContracts(NetworkIds.MAINNET).tokens

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
          weeklyNetApy: weeklyNetApy[label] ? weeklyNetApy[label]!.toString() : undefined,
        }
      }),
      warnings: [],
    }
  })
}
