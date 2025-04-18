import { RiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import type { AaveV3SupportedNetwork } from 'blockchain/aave-v3'
import {
  aaveV3SupportedNetworkList,
  getAaveV3BorrowCap,
  getAaveV3EModeCategoryForAssets,
  getAaveV3ReserveConfigurationData,
  getAaveV3ReserveData,
  getEModeCategoryData,
} from 'blockchain/aave-v3'
import { ensureGivenTokensExist, getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds, NetworkNames, networksByName } from 'blockchain/networks'
import { getTokenPrice } from 'blockchain/prices'
import type { Tickers } from 'blockchain/prices.types'
import { lambdaPercentageDenomination } from 'features/aave/constants'
import { isYieldLoopPair } from 'features/omni-kit/helpers/isYieldLoopPair'
import { settingsV3 } from 'features/omni-kit/protocols/aave/settings'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'
import { aaveLikeAprToApy } from 'handlers/product-hub/helpers'
import type { ProductHubHandlerResponse } from 'handlers/product-hub/types'
import { ensureFind } from 'helpers/ensure-find'
import { getYieldsRequest } from 'helpers/lambda/yields'
import { one, zero } from 'helpers/zero'
import { memoize } from 'lodash'

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

const tokensWithoutAssociatedToken = ['GHO']

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

    const fee = aaveLikeAprToApy(reserveData.variableBorrowRate)

    if (tokensWithoutAssociatedToken.includes(token.toUpperCase())) {
      const borrowCap = await getAaveV3BorrowCap({ token, networkId })

      return {
        [token]: {
          liquidity: borrowCap
            .minus(reserveData.totalStableDebt)
            .minus(reserveData.totalVariableDebt)
            .times(debtTokenPrice),
          fee,
        },
      }
    }

    return {
      [token]: {
        liquidity: reserveData.totalAToken
          .minus(reserveData.totalStableDebt)
          .minus(reserveData.totalVariableDebt)
          .times(debtTokenPrice),
        fee,
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
  const memoizedTokensData = memoize(getAaveV3TokensData)
  const memoizedEModeCategoryData = memoize(getAaveV3EModeCategoryForAssets)
  const aaveV3NetworksList = [
    ...new Set(aaveV3ProductHubProducts.map((product) => product.network)),
  ]
  const getAaveV3TokensDataPromises = aaveV3NetworksList.map((networkName) =>
    memoizedTokensData(networkName as AaveV3Networks, tickers),
  )
  const earnProducts = aaveV3ProductHubProducts.filter(
    ({ primaryToken, secondaryToken, product }) =>
      isYieldLoopPair({
        collateralToken: primaryToken,
        debtToken: secondaryToken,
      }) && [OmniProductType.Multiply, OmniProductType.Earn].includes(product[0]),
  )
  const earnProductsEmodeLtvPromises = await Promise.all(
    aaveV3SupportedNetworkList.map(async (networkId) => {
      // currently theres only one category - eth correlated
      const [cat1] = await Promise.all([
        getEModeCategoryData({
          categoryId: new BigNumber(1),
          networkId: networkId as AaveV3SupportedNetwork,
        }),
      ])
      return {
        [networkId]: {
          1: cat1.ltv,
        },
      }
    }),
  )
  const earnProductsEmodeLtv = earnProductsEmodeLtvPromises.reduce((acc, curr) => {
    return { ...acc, ...curr }
  }, {})
  const earnProductsPromises = earnProducts.map(async (product) => {
    const networkId = networkNameToIdMap[product.network as AaveV3Networks]
    const [strategyEmodeCategory, tokensReserveData] = await Promise.all([
      memoizedEModeCategoryData({
        collateralToken: product.primaryToken,
        debtToken: product.secondaryToken,
        networkId: networkId as AaveV3SupportedNetwork,
      }),
      memoizedTokensData(product.network as AaveV3Networks, tickers),
    ])
    const isEmodeStrategy = strategyEmodeCategory.eq(one)
    const aaveLikeEmodeRiskRatio =
      (isEmodeStrategy && earnProductsEmodeLtv[networkId][strategyEmodeCategory.toNumber() as 1]) ||
      zero

    const ltv = isEmodeStrategy
      ? aaveLikeEmodeRiskRatio
      : ensureFind(
          tokensReserveData[product.network as AaveV3Networks].tokensReserveConfigurationData.find(
            (data) => data[product.primaryToken],
          ),
        )[product.primaryToken].riskRatio.loanToValue

    const contracts = getNetworkContracts(networkId)
    ensureGivenTokensExist(networkId, contracts, [product.primaryToken, product.secondaryToken])

    const response = await getYieldsRequest(
      {
        actionSource: `product-hub handler aaveV3 EMODE:${isEmodeStrategy} ${product.primaryToken}/${product.secondaryToken} ${product.network}`,
        collateralTokenAddress: contracts.tokens[product.primaryToken].address,
        quoteTokenAddress: contracts.tokens[product.secondaryToken].address,
        collateralToken: product.primaryToken,
        quoteToken: product.secondaryToken,
        ltv,
        networkId: networkId,
        protocol: product.protocol,
      },
      process.env.FUNCTIONS_API_URL,
    )
    if (!response?.results) {
      console.warn('No AAVE v3 APY data for', product.label, product.network, response)
    }
    return {
      [`${product.label}-${product.network}`]: {
        apy:
          new BigNumber(response?.results?.apy7d || zero).div(lambdaPercentageDenomination) || {}, // we do 5 as 5% and FE needs 0.05 as 5%
        ltv,
      },
    } as Record<
      string,
      {
        apy: BigNumber
        ltv: BigNumber
      }
    >
  })
  return Promise.all([
    Promise.all(getAaveV3TokensDataPromises),
    Promise.all(earnProductsPromises),
  ]).then(([aaveV3TokensDataList, earnProductsDataArr]) => {
    const aaveV3TokensData = aaveV3TokensDataList.reduce((acc, curr) => {
      return { ...acc, ...curr }
    }, {})
    const earnProductsData = earnProductsDataArr.reduce((acc, curr) => {
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
        const isYieldLoop = isYieldLoopPair({
          collateralToken: primaryToken,
          debtToken: secondaryToken,
        })
        const isMultiply = product.product[0] === OmniProductType.Multiply
        const isYieldLoopMultiply = isMultiply && isYieldLoop

        ensureGivenTokensExist(networkId, contracts, [primaryToken, secondaryToken])

        const { tokens } = contracts

        return {
          ...product,
          product: [isYieldLoopMultiply ? OmniProductType.Earn : product.product[0]],
          ...(isYieldLoopMultiply && {
            earnStrategy: 'yield_loop',
            earnStrategyDescription: `${primaryToken}/${secondaryToken} Yield Loop`,
            managementType: 'active',
          }),
          primaryTokenAddress: tokens[primaryToken].address,
          secondaryTokenAddress: tokens[secondaryToken].address,
          maxMultiply: riskRatio.multiple.toString(),
          maxLtv: isYieldLoopMultiply
            ? earnProductsData[`${label}-${network}`].ltv.toString()
            : maxLtv.toString(),
          liquidity: liquidity.toString(),
          fee: fee.toString(),
          weeklyNetApy: earnProductsData[`${label}-${network}`]?.apy.toString(),
          hasRewards: product.hasRewards ?? false,
          automationFeatures: !product.product.includes(OmniProductType.Earn)
            ? settingsV3.availableAutomations[
                networksByName[product.network].id as OmniSupportedNetworkIds
              ]
            : [],
        }
      }),
      warnings: [],
    }
  })
}
