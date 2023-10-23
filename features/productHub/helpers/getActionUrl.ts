import { EarnStrategies } from '@prisma/client'
import type { NetworkIds } from 'blockchain/networks'
import { strategies as aaveStrategyList } from 'features/aave'
import { isPoolOracless } from 'features/ajna/common/helpers/isOracless'
import type { ProductHubItem } from 'features/productHub/types'
import { ProductHubProductType } from 'features/productHub/types'
import { getLocalAppConfig } from 'helpers/config'
import { LendingProtocol } from 'lendingProtocols'

export const getAaveLikeViewStrategyUrl = ({
  aaveLikeProduct,
  bypassFeatureFlag,
  version,
  product,
  protocol,
  primaryToken,
  secondaryToken,
  network,
}: Partial<ProductHubItem> & {
  version: 'v2' | 'v3'
  bypassFeatureFlag: boolean
  aaveLikeProduct: 'aave' | 'spark'
}) => {
  const search = aaveStrategyList.find(
    (strategy) =>
      product
        ?.map((prod) => prod.toLocaleLowerCase())
        ?.includes(strategy.type.toLocaleLowerCase() as ProductHubProductType) &&
      strategy.protocol === protocol &&
      strategy.tokens.collateral.toLocaleLowerCase() === primaryToken?.toLocaleLowerCase() &&
      strategy.tokens.debt.toLocaleLowerCase() === secondaryToken?.toLocaleLowerCase() &&
      strategy.network === network,
  )

  return !search?.urlSlug ||
    (!bypassFeatureFlag &&
      search?.featureToggle &&
      !getLocalAppConfig('features')[search?.featureToggle])
    ? '/'
    : `/${network}/${aaveLikeProduct}/${version}/${search.type.toLocaleLowerCase()}/${
        search!.urlSlug
      }`
}

export function getActionUrl({
  bypassFeatureFlag = false,
  chainId,
  earnStrategy,
  label,
  network,
  primaryToken,
  primaryTokenAddress,
  product,
  protocol,
  secondaryToken,
  secondaryTokenAddress,
}: ProductHubItem & { bypassFeatureFlag?: boolean; chainId?: NetworkIds }): string {
  switch (protocol) {
    case LendingProtocol.Ajna:
      const isEarnProduct = product[0] === ProductHubProductType.Earn
      const collateralToken = isEarnProduct ? secondaryToken : primaryToken
      const collateralAddress = isEarnProduct ? secondaryTokenAddress : primaryTokenAddress
      const quoteToken = isEarnProduct ? primaryToken : secondaryToken
      const quoteAddress = isEarnProduct ? primaryTokenAddress : secondaryTokenAddress
      const isOracless = isPoolOracless({
        collateralToken,
        quoteToken,
        chainId,
      })
      const productInUrl =
        isEarnProduct && earnStrategy === EarnStrategies.yield_loop
          ? ProductHubProductType.Multiply
          : product
      const tokensInUrl = isOracless
        ? `${collateralAddress}-${quoteAddress}`
        : `${collateralToken}-${quoteToken}`

      return `/ethereum/ajna/${productInUrl}/${tokensInUrl}`
    case LendingProtocol.AaveV2:
      return getAaveLikeViewStrategyUrl({
        version: 'v2',
        bypassFeatureFlag,
        network,
        primaryToken,
        product,
        protocol,
        secondaryToken,
        aaveLikeProduct: 'aave',
      })
    case LendingProtocol.AaveV3:
      return getAaveLikeViewStrategyUrl({
        version: 'v3',
        bypassFeatureFlag,
        network,
        primaryToken,
        product,
        protocol,
        secondaryToken,
        aaveLikeProduct: 'aave',
      })
    case LendingProtocol.Maker:
      if (label === 'DSR') return '/earn/dsr/'

      const openUrl = product.includes(ProductHubProductType.Multiply) ? 'open-multiply' : 'open'
      const ilkInUrl = label.split('/').length ? label.split('/')[0] : label

      return `/vaults/${openUrl}/${ilkInUrl}`
    case LendingProtocol.MorphoBlue:
      // TODO: add Morpho Blue handler
      return '/'
    case LendingProtocol.SparkV3:
      return getAaveLikeViewStrategyUrl({
        version: 'v3',
        bypassFeatureFlag,
        network,
        primaryToken,
        product,
        protocol,
        secondaryToken,
        aaveLikeProduct: 'spark',
      })
  }
}
