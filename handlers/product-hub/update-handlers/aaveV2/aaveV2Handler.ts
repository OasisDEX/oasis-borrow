import { RiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { getAaveV2ReserveConfigurationData, getAaveV2ReserveData } from 'blockchain/aave'
import { ensureGivenTokensExist, getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { getTokenPrice } from 'blockchain/prices'
import type { Tickers } from 'blockchain/prices.types'
import { ProductHubProductType } from 'features/productHub/types'
import type { ProductHubHandlerResponse } from 'handlers/product-hub/types'
import { getYieldsRequest } from 'helpers/lambda/yields'
import { zero } from 'helpers/zero'
import { flatten } from 'lodash'

import { aaveV2ProductHubProducts } from './aaveV2Products'

export default async function (tickers: Tickers): ProductHubHandlerResponse {
  // Multiply: max multiple, liq available, variable fee
  // Earn: 7 day net APY, liq available
  const usdcPrice = new BigNumber(getTokenPrice('USDC', tickers, 'aaveV2Handler'))
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
        liquidity: reserveData.availableLiquidity.times(usdcPrice),
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
  const earnProducts = aaveV2ProductHubProducts.filter(({ product }) =>
    product.includes(ProductHubProductType.Earn),
  )
  const earnProductsPromises = earnProducts.map(async (product) => {
    const tokensReserveData = await Promise.all(tokensReserveConfigurationDataPromises)
    const { riskRatio } = tokensReserveData.find((data) => data[product.primaryToken])![
      product.primaryToken
    ]
    const contracts = getNetworkContracts(NetworkIds.MAINNET)
    ensureGivenTokensExist(NetworkIds.MAINNET, contracts, [
      product.primaryToken,
      product.secondaryToken,
    ])

    const response = await getYieldsRequest(
      {
        actionSource: 'product-hub aave-v2 handler',
        collateralTokenAddress: contracts.tokens[product.primaryToken].address,
        quoteTokenAddress: contracts.tokens[product.secondaryToken].address,
        collateralToken: product.primaryToken,
        quoteToken: product.secondaryToken,
        ltv: riskRatio.loanToValue,
        referenceDate: new Date(),
        networkId: NetworkIds.MAINNET,
        protocol: product.protocol,
      },
      process.env.FUNCTIONS_API_URL,
    )
    if (!response?.results) {
      console.warn('No AAVE v2 APY data for', product.label, product.network, response)
    }
    return {
      [product.label]: new BigNumber(response?.results.apy7d || zero) || {}, // we do 5 as 5% and FE needs 0.05 as 5%
    }
  })

  return Promise.all([
    Promise.all(tokensReserveDataPromises),
    Promise.all(tokensReserveConfigurationDataPromises),
    Promise.all(earnProductsPromises),
  ]).then(([tokensReserveData, tokensReserveConfigurationData, earnProductsYields]) => {
    return {
      table: aaveV2ProductHubProducts.map((product) => {
        const { secondaryToken, primaryToken, label } = product
        const { liquidity, fee } = tokensReserveData.find((data) => data[secondaryToken])![
          secondaryToken
        ]
        const { maxLtv, riskRatio } = tokensReserveConfigurationData.find(
          (data) => data[primaryToken],
        )![primaryToken]
        const weeklyNetApy = earnProductsYields.find((data) => data[label]) || {}
        const tokensAddresses = getNetworkContracts(NetworkIds.MAINNET).tokens

        return {
          ...product,
          primaryTokenAddress: tokensAddresses[primaryToken].address,
          secondaryTokenAddress: tokensAddresses[secondaryToken].address,
          maxMultiply: riskRatio.multiple.toString(),
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
