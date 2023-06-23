import { strategies as aaveStrategyList } from 'features/aave'
import { ProductHubItem, ProductHubProductType } from 'features/productHub/types'
import { getFeatureToggle } from 'helpers/useFeatureToggle'
import { LendingProtocol } from 'lendingProtocols'

const getAaveStrategyUrl = ({
  aaveVersion,
  product,
  protocol,
  primaryToken,
  secondaryToken,
  network,
}: Partial<ProductHubItem> & { aaveVersion: 'v2' | 'v3' }) => {
  const search = aaveStrategyList.find((strategy) => {
    return (
      product
        ?.map((prod) => prod.toLocaleLowerCase())
        ?.includes(strategy.type.toLocaleLowerCase() as ProductHubProductType) &&
      strategy.protocol === protocol &&
      strategy.tokens.collateral.toLocaleLowerCase() === primaryToken?.toLocaleLowerCase() &&
      strategy.tokens.debt.toLocaleLowerCase() === secondaryToken?.toLocaleLowerCase() &&
      strategy.network === network
    )
  })
  if (!search?.urlSlug || (search?.featureToggle && !getFeatureToggle(search?.featureToggle))) {
    return '/'
  }
  return `/${network}/aave/${aaveVersion}/${product!.join('') /* should be only one for aave */}/${
    search!.urlSlug
  }`
}

export function getActionUrl({
  earnStrategy,
  label,
  product,
  protocol,
  primaryToken,
  secondaryToken,
  network,
}: ProductHubItem): string {
  switch (protocol) {
    case LendingProtocol.Ajna:
      const productInUrl = earnStrategy?.includes('Yield Loop')
        ? ProductHubProductType.Multiply
        : product

      return `/ajna/${productInUrl}/${label.replace('/', '-')}`
    case LendingProtocol.AaveV2:
      return getAaveStrategyUrl({
        aaveVersion: 'v2',
        product,
        protocol,
        primaryToken,
        secondaryToken,
        network,
      })
    case LendingProtocol.AaveV3:
      return getAaveStrategyUrl({
        aaveVersion: 'v3',
        product,
        protocol,
        primaryToken,
        secondaryToken,
        network,
      })
    case LendingProtocol.Maker:
      if (label === 'DSR') {
        return '/earn/dsr/'
      }
      return `/vaults/open/${label.split('/').length ? label.split('/')[0] : label}`
  }
}
