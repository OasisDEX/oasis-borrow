import { RiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import type { AaveV3SupportedNetwork } from 'blockchain/aave-v3'
import { getAaveV3ReserveConfigurationData, getAaveV3ReserveData } from 'blockchain/aave-v3'
import { ensureGivenTokensExist, getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds, NetworkNames } from 'blockchain/networks'
import { getTokenPrice } from 'blockchain/prices'
import type { Tickers } from 'blockchain/prices.types'
import dayjs from 'dayjs'
import { wstethRiskRatio } from 'features/aave/constants'
import { OmniProductType } from 'features/omni-kit/types'
import { GraphQLClient } from 'graphql-request'
import { aaveLikeAprToApy } from 'handlers/product-hub/helpers'
import { emptyYields } from 'handlers/product-hub/helpers/empty-yields'
import type { ProductHubHandlerResponse } from 'handlers/product-hub/types'
import { ensureFind } from 'helpers/ensure-find'
import { getAaveWstEthYield } from 'lendingProtocols/aave-v3/calculations/wstEthYield'
import { memoize } from 'lodash'
import { curry } from 'ramda'
import { match } from 'ts-pattern'

import { aaveV3ProductHubProducts } from './aave-v3-products'

type AaveV3Networks =
  | NetworkNames.ethereumMainnet
  | NetworkNames.arbitrumMainnet
  | NetworkNames.optimismMainnet
  | NetworkNames.baseMainnet

const networkNameToIdMap = {
  [NetworkNames.ethereumMainnet]: NetworkIds.MAINNET,
  [NetworkNames.arbitrumMainnet]: NetworkIds.ARBITRUMMAINNET,
  [NetworkNames.optimismMainnet]: NetworkIds.OPTIMISMMAINNET,
  [NetworkNames.baseMainnet]: NetworkIds.BASEMAINNET,
}

const getAaveV3TokensData = async (networkName: AaveV3Networks, tickers: Tickers) => {
  const currentNetworkProducts = aaveV3ProductHubProducts.filter(
    (product) => product.network === networkName,
  )
  const networkId = networkNameToIdMap[networkName] as AaveV3SupportedNetwork
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
    const reserveData = await getAaveV3ReserveData({ token, networkId })
    const debtTokenPrice = new BigNumber(getTokenPrice(token, tickers, 'aaveV3Handler'))
    return {
      [token]: {
        liquidity: reserveData.totalAToken
          .minus(reserveData.totalStableDebt)
          .minus(reserveData.totalVariableDebt)
          .times(debtTokenPrice),
        fee: aaveLikeAprToApy(reserveData.variableBorrowRate),
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

export default async function (tickers: Tickers): ProductHubHandlerResponse {
  // mainnet
  const memoizedTokensData = memoize(getAaveV3TokensData)
  const aaveV3NetworksList = [
    ...new Set(aaveV3ProductHubProducts.map((product) => product.network)),
  ]
  const getAaveV3TokensDataPromises = aaveV3NetworksList.map((networkName) =>
    memoizedTokensData(networkName as AaveV3Networks, tickers),
  )
  const graphQlProvider = new GraphQLClient(
    getNetworkContracts(NetworkIds.MAINNET, NetworkIds.MAINNET).cacheApi,
  )

  const resolveYields = (label: string, network: NetworkNames) => {
    return match({ label, network })
      .with({ label: 'WSTETH/ETH', network: NetworkNames.ethereumMainnet }, () =>
        curry(getAaveWstEthYield)(graphQlProvider, dayjs()),
      )
      .otherwise(() => emptyYields)
  }

  // getting the APYs
  const earnProducts = aaveV3ProductHubProducts.filter(({ product }) =>
    product.includes(OmniProductType.Earn),
  )
  const earnProductsPromises = earnProducts.map(async (product) => {
    const tokensReserveData = await memoizedTokensData(product.network as AaveV3Networks, tickers)

    const riskRatio =
      product.label === 'WSTETH/ETH'
        ? wstethRiskRatio
        : ensureFind(
            tokensReserveData[
              product.network as AaveV3Networks
            ].tokensReserveConfigurationData.find((data) => data[product.primaryToken]),
          )[product.primaryToken].riskRatio
    const response = await resolveYields(product.label, product.network)(riskRatio, ['7Days'])
    return {
      [`${product.label}-${product.network}`]: response.annualisedYield7days?.div(100), // we do 5 as 5% and FE needs 0.05 as 5%
    } as Record<string, BigNumber>
  })
  return Promise.all([
    Promise.all(getAaveV3TokensDataPromises),
    Promise.all(earnProductsPromises),
  ]).then(([aaveV3TokensDataList, earnProductsYields]) => {
    const aaveV3TokensData = aaveV3TokensDataList.reduce((acc, curr) => {
      return { ...acc, ...curr }
    }, {})
    const flattenYields = earnProductsYields.reduce((acc, curr) => {
      return { ...acc, ...curr }
    })
    return {
      table: aaveV3ProductHubProducts.map((product) => {
        const { secondaryToken, primaryToken, label, network } = product

        const { tokensReserveData, tokensReserveConfigurationData } = aaveV3TokensData[network]

        const { liquidity, fee } = ensureFind(
          tokensReserveData.find((data) => data[secondaryToken]),
        )[secondaryToken]
        const { maxLtv, riskRatio } = ensureFind(
          tokensReserveConfigurationData.find((data) => data[primaryToken]),
        )[primaryToken]

        const networkId = networkNameToIdMap[network as AaveV3Networks]
        const contracts = getNetworkContracts(networkId)

        ensureGivenTokensExist(networkId, contracts, [primaryToken, secondaryToken])

        const { tokens } = contracts

        return {
          ...product,
          primaryTokenAddress: tokens[primaryToken].address,
          secondaryTokenAddress: tokens[secondaryToken].address,
          maxMultiply:
            product.label === 'WSTETH/ETH' && product.network === NetworkNames.ethereumMainnet
              ? wstethRiskRatio.multiple.toString()
              : riskRatio.multiple.toString(),
          maxLtv: maxLtv.toString(),
          liquidity: liquidity.toString(),
          fee: fee.toString(),
          weeklyNetApy: flattenYields[`${label}-${network}`]?.toString(),
          hasRewards: product.hasRewards ?? false,
        }
      }),
      warnings: [],
    }
  })
}
