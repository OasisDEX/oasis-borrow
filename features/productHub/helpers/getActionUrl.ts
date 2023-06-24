import { strategies as aaveStrategyList } from 'features/aave'
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
    : `/${network}/aave/${aaveVersion}/${product!.join('') /* should be only one for aave */}/${
        search!.urlSlug
      }`
}

export function getActionUrl({
  bypassFeatureFlag = false,
  earnStrategy,
  label,
  network,
  primaryToken,
  product,
  protocol,
  secondaryToken,
}: ProductHubItem & { bypassFeatureFlag?: boolean }): string {
  switch (protocol) {
    case LendingProtocol.Ajna:
      const productInUrl = earnStrategy?.includes('Yield Loop')
        ? ProductHubProductType.Multiply
        : product

      return `/ajna/${productInUrl}/${label.replace('/', '-')}`
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
  }
}
