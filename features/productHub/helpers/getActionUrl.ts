import { NetworkIds } from 'blockchain/networks'
import { strategies as aaveStrategyList } from 'features/aave'
import { isPoolOracless } from 'features/ajna/common/helpers/isOracless'
import { ProductHubItem, ProductHubProductType } from 'features/productHub/types'
import { getFeatureToggle } from 'helpers/useFeatureToggle'
import { LendingProtocol } from 'lendingProtocols'

const getAaveStrategyUrl = ({
  bypassFeatureFlag,
  aaveVersion,
  product,
  protocol,
  primaryToken,
  secondaryToken,
  network,
}: Partial<ProductHubItem> & { aaveVersion: 'v2' | 'v3'; bypassFeatureFlag: boolean }) => {
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
    (!bypassFeatureFlag && search?.featureToggle && !getFeatureToggle(search?.featureToggle))
    ? '/'
    : `/${network}/aave/${aaveVersion}/${search.type.toLocaleLowerCase()}/${search!.urlSlug}`
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
        isEarnProduct && earnStrategy?.includes('Yield Loop')
          ? ProductHubProductType.Multiply
          : product
      const tokensInUrl = isOracless
        ? `${collateralAddress}-${quoteAddress}`
        : `${collateralToken}-${quoteToken}`

      return `/ethereum/ajna/${productInUrl}/${tokensInUrl}`
    case LendingProtocol.AaveV2:
      return getAaveStrategyUrl({
        aaveVersion: 'v2',
        bypassFeatureFlag,
        network,
        primaryToken,
        product,
        protocol,
        secondaryToken,
      })
    case LendingProtocol.AaveV3:
      return getAaveStrategyUrl({
        aaveVersion: 'v3',
        bypassFeatureFlag,
        network,
        primaryToken,
        product,
        protocol,
        secondaryToken,
      })
    case LendingProtocol.Maker:
      if (label === 'DSR') return '/earn/dsr/'

      const openUrl = product.includes(ProductHubProductType.Multiply) ? 'open-multiply' : 'open'
      const ilkInUrl = label.split('/').length ? label.split('/')[0] : label

      return `/vaults/${openUrl}/${ilkInUrl}`
    case LendingProtocol.Spark:
      // TODO: add spark urls
      return `/not-implemented`
  }
}
