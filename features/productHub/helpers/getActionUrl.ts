import { EarnStrategies } from '@prisma/client'
import type { NetworkIds } from 'blockchain/networks'
import dayjs from 'dayjs'
import { strategies as aaveStrategyList } from 'features/aave'
import { isPoolOracless } from 'features/omni-kit/protocols/ajna/helpers'
import { erc4626VaultsByName } from 'features/omni-kit/protocols/erc-4626/settings'
import { Erc4626PseudoProtocol } from 'features/omni-kit/protocols/morpho-blue/constants'
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
  const featureToggles = getLocalAppConfig('features')

  if (
    search &&
    [LendingProtocol.AaveV3, LendingProtocol.SparkV3, LendingProtocol.AaveV2].includes(
      search.protocol,
    )
  ) {
    return `/${search.network.toLocaleLowerCase()}/${
      {
        [LendingProtocol.AaveV3]: 'aave/v3',
        [LendingProtocol.AaveV2]: 'aave/v2',
        [LendingProtocol.SparkV3]: 'spark',
      }[search.protocol as LendingProtocol.SparkV3 | LendingProtocol.AaveV3]
    }/${search.type.toLocaleLowerCase()}/${search.tokens.collateral.toLocaleUpperCase()}-${search.tokens.debt.toLocaleUpperCase()}`
  }

  return !search?.urlSlug ||
    (!bypassFeatureFlag && search?.featureToggle && !featureToggles[search?.featureToggle])
    ? '/'
    : `/${network}/old/${aaveLikeProduct}/${version}/${search.type.toLocaleLowerCase()}/${
        search!.urlSlug
      }`
}

export function getActionUrl({
  bypassFeatureFlag = false,
  networkId,
  earnStrategy,
  label,
  network,
  primaryToken,
  primaryTokenAddress,
  product,
  protocol,
  secondaryToken,
  secondaryTokenAddress,
}: ProductHubItem & { bypassFeatureFlag?: boolean; networkId?: NetworkIds }): string {
  if (
    primaryToken === 'WEETH' &&
    protocol === LendingProtocol.AaveV3 &&
    !dayjs().isAfter(dayjs.unix(1713099600)) // time when WEETH gets live, whole check to be removed some time after
  ) {
    return '/'
  }
  if (earnStrategy === EarnStrategies.erc_4626) {
    const { id } = erc4626VaultsByName[label]

    return `/${network}/${Erc4626PseudoProtocol}/${product[0]}/${id}`
  }

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
        networkId,
      })
      const productInUrl =
        isEarnProduct && earnStrategy === EarnStrategies.yield_loop
          ? ProductHubProductType.Multiply
          : product
      const tokensInUrl = isOracless
        ? `${collateralAddress}-${quoteAddress}`
        : `${collateralToken}-${quoteToken}`

      return `/${network}/ajna/${productInUrl}/${tokensInUrl}`
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
      return `/${network}/${LendingProtocol.MorphoBlue}/${product[0]}/${label.replace('/', '-')}`
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
