import { RiskRatio } from '@oasisdex/dma-library'
import { getAaveV2ReserveConfigurationData, getAaveV2ReserveData } from 'blockchain/aave'
import { NetworkNames } from 'blockchain/networks'
import { ProductHubProductType } from 'features/productHub/types'
import { graphQlProviders } from 'handlers/product-hub/helpers/graphQLProviders'
import { ProductHubHandlerResponse } from 'handlers/product-hub/types'
import { getAaveStEthYield } from 'lendingProtocols/aave-v2/calculations/stEthYield'
import { flatten } from 'lodash'
import moment from 'moment'
import { curry } from 'ramda'

import { aaveV2ProductHubProducts } from './aaveV2Products'

export default async function (): ProductHubHandlerResponse {
  // Multiply: max multiple, liq available, variable fee
  // Earn: 7 day net APY, liq available
  const primaryTokensList = [
    ...new Set(
      flatten(
        aaveV2ProductHubProducts.map((product) =>
          product.depositToken
            ? [product.primaryToken, product.depositToken]
            : [product.primaryToken],
        ),
      ),
    ),
  ]
  const secondaryTokensList = [
    ...new Set(aaveV2ProductHubProducts.map((product) => product.secondaryToken)),
  ]

  const yieldsPromisesMap = {
    // a crude map, but it works for now since we only have one earn product
    'STETH/ETH': curry(getAaveStEthYield)(graphQlProviders[NetworkNames.ethereumMainnet], moment()),
  }

  // reserveData -> liq available and variable fee
  const tokensReserveDataPromises = secondaryTokensList.map(async (token) => {
    const reserveData = await getAaveV2ReserveData({ token })
    return {
      [token]: {
        liquidity: reserveData.availableLiquidity,
        fee: reserveData.variableBorrowRate,
      },
    }
  })

  // reserveData -> max multiple
  const tokensReserveConfigurationDataPromises = primaryTokensList.map(async (token) => {
    const reserveConfigurationData = await getAaveV2ReserveConfigurationData({ token })
    return {
      [token]: {
        maxLtv: reserveConfigurationData.ltv,
        riskRatio: new RiskRatio(reserveConfigurationData.ltv, RiskRatio.TYPE.LTV),
      },
    }
  })

  // getting the APYs
  const earnProducts = aaveV2ProductHubProducts.filter((product) =>
    product.product.includes(ProductHubProductType.Earn),
  )
  const earnProductsPromises = earnProducts.map(async (product) => {
    const tokensReserveData = await Promise.all(tokensReserveConfigurationDataPromises)
    const { riskRatio } = tokensReserveData.find((data) => data[product.primaryToken])![
      product.primaryToken
    ]
    const response = await yieldsPromisesMap[product.label as keyof typeof yieldsPromisesMap](
      riskRatio,
      ['7Days'],
    )
    return {
      [product.label]: response.annualisedYield7days?.div(100), // we do 5 as 5% and FE needs 0.05 as 5%
    }
  })

  return Promise.all([
    Promise.all(tokensReserveDataPromises),
    Promise.all(tokensReserveConfigurationDataPromises),
    Promise.all(earnProductsPromises),
  ]).then(([tokensReserveData, tokensReserveConfigurationData, earnProductsYields]) => {
    return aaveV2ProductHubProducts.map((product) => {
      const { secondaryToken, primaryToken, depositToken, label } = product
      const { liquidity, fee } = tokensReserveData.find((data) => data[secondaryToken])![
        secondaryToken
      ]
      const { maxLtv, riskRatio } = tokensReserveConfigurationData.find(
        (data) => data[depositToken || primaryToken],
      )![depositToken || primaryToken]
      const weeklyNetApy = earnProductsYields.find((data) => data[label]) || {}
      return {
        ...product,
        maxMultiply: riskRatio.multiple.toString(),
        maxLtv: maxLtv.toString(),
        liquidity: liquidity.toString(),
        fee: fee.toString(),
        weeklyNetApy: weeklyNetApy[label] ? weeklyNetApy[label]!.toString() : undefined,
      }
    })
  })
}
