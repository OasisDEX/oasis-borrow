import { RiskRatio } from '@oasisdex/oasis-actions'
import { getAaveV2ReserveConfigurationData, getAaveV2ReserveData } from 'blockchain/aave'
import { ProductHubHandlerResponse } from 'handlers/product-hub/types'
import { flatten } from 'lodash'

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

  return Promise.all([
    Promise.all(tokensReserveDataPromises),
    Promise.all(tokensReserveConfigurationDataPromises),
  ]).then(([tokensReserveData, tokensReserveConfigurationData]) => {
    return aaveV2ProductHubProducts.map((product) => {
      const { secondaryToken, primaryToken, depositToken } = product
      const { liquidity, fee } = tokensReserveData.find((data) => data[secondaryToken])![
        secondaryToken
      ]
      const { maxLtv, riskRatio } = tokensReserveConfigurationData.find(
        (data) => data[depositToken || primaryToken],
      )![depositToken || primaryToken]
      return {
        ...product,
        maxMultiply: riskRatio.multiple.toString(),
        maxLtv: maxLtv.toString(),
        liquidity: liquidity.toString(),
        fee: fee.toString(),
      }
    })
  })
}
