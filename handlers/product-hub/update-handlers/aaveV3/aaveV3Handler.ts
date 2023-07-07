import { RiskRatio } from '@oasisdex/dma-library'
import {
  AaveV3SupportedNetwork,
  getAaveV3ReserveConfigurationData,
  getAaveV3ReserveData,
} from 'blockchain/aave-v3'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds, NetworkNames } from 'blockchain/networks'
import dayjs from 'dayjs'
import { wstethRiskRatio } from 'features/aave/common/constants'
import { ProductHubProductType } from 'features/productHub/types'
import { GraphQLClient } from 'graphql-request'
// import { ProductHubProductType } from 'features/productHub/types'
import { ProductHubHandlerResponse } from 'handlers/product-hub/types'
import { getAaveWstEthYield } from 'lendingProtocols/aave-v3/calculations/wstEthYield'
import { flatten } from 'lodash'
import { curry } from 'ramda'

import { aaveV3ProductHubProducts } from './aaveV3Products'

type AaveV3Networks =
  | NetworkNames.ethereumMainnet
  | NetworkNames.arbitrumMainnet
  | NetworkNames.optimismMainnet

const networkNameToIdMap = {
  [NetworkNames.ethereumMainnet]: NetworkIds.MAINNET,
  [NetworkNames.arbitrumMainnet]: NetworkIds.ARBITRUMMAINNET,
  [NetworkNames.optimismMainnet]: NetworkIds.OPTIMISMMAINNET,
}

const getAaveV3TokensData = async ({ networkName }: { networkName: AaveV3Networks }) => {
  const currentNetworkProducts = aaveV3ProductHubProducts.filter(
    (product) => product.network === networkName,
  )
  const networkId = networkNameToIdMap[networkName] as AaveV3SupportedNetwork
  const primaryTokensList = [
    ...new Set(
      flatten(
        currentNetworkProducts.map((product) =>
          product.depositToken
            ? [product.primaryToken, product.depositToken]
            : [product.primaryToken],
        ),
      ),
    ),
  ]
  const secondaryTokensList = [
    ...new Set(currentNetworkProducts.map((product) => product.secondaryToken)),
  ]
  // reserveData -> liq available and variable fee
  const tokensReserveDataPromises = secondaryTokensList.map(async (token) => {
    const reserveData = await getAaveV3ReserveData({ token, networkId })
    return {
      [token]: {
        liquidity: reserveData.totalAToken
          .minus(reserveData.totalStableDebt)
          .minus(reserveData.totalVariableDebt),
        fee: reserveData.variableBorrowRate,
      },
    }
  })

  // reserveData -> max multiple
  const tokensReserveConfigurationDataPromises = primaryTokensList.map(async (token) => {
    const reserveConfigurationData = await getAaveV3ReserveConfigurationData({ token, networkId })
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

export default async function (): ProductHubHandlerResponse {
  // mainnet
  const aaveV3NetworksList = [
    ...new Set(aaveV3ProductHubProducts.map((product) => product.network)),
  ]
  const getAaveV3TokensDataPromises = aaveV3NetworksList.map((networkName) =>
    getAaveV3TokensData({ networkName: networkName as AaveV3Networks }),
  )
  const graphQlProvider = new GraphQLClient(
    getNetworkContracts(NetworkIds.MAINNET, NetworkIds.MAINNET).cacheApi,
  )
  const yieldsPromisesMap = {
    // a crude map, but it works for now since we only have one earn product
    'WSTETH/ETH': curry(getAaveWstEthYield)(graphQlProvider, dayjs()),
  }
  // getting the APYs
  const earnProducts = aaveV3ProductHubProducts.filter(({ product }) =>
    product.includes(ProductHubProductType.Earn),
  )
  const earnProductsPromises = earnProducts.map(async (product) => {
    const tokensReserveData = await getAaveV3TokensData({
      networkName: product.network as AaveV3Networks,
    })

    const riskRatio =
      product.label === 'WSTETH/ETH'
        ? wstethRiskRatio
        : tokensReserveData[product.network as AaveV3Networks].tokensReserveConfigurationData.find(
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
    Promise.all(getAaveV3TokensDataPromises),
    Promise.all(earnProductsPromises),
  ]).then(([aaveV3TokensDataList, earnProductsYields]) => {
    const aaveV3TokensData = aaveV3TokensDataList.reduce((acc, curr) => {
      return { ...acc, ...curr }
    }, {})
    return {
      table: aaveV3ProductHubProducts.map((product) => {
        const { tokensReserveData, tokensReserveConfigurationData } =
          aaveV3TokensData[product.network]
        const { secondaryToken, primaryToken, depositToken, label } = product
        const { liquidity, fee } = tokensReserveData.find(
          (data) => data[depositToken || secondaryToken],
        )![depositToken || secondaryToken]
        const weeklyNetApy = earnProductsYields.find((data) => data[label]) || {}
        const { maxLtv, riskRatio } = tokensReserveConfigurationData.find(
          (data) => data[primaryToken],
        )![primaryToken]
        return {
          ...product,
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
