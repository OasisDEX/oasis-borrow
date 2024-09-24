import { EarnStrategies } from '@prisma/client'
import type { NetworkIds } from 'blockchain/networks'
import { strategies as aaveStrategyList } from 'features/aave'
import { ProductType } from 'features/aave/types'
import { isYieldLoopPair } from 'features/omni-kit/helpers/isYieldLoopPair'
import { isPoolOracless } from 'features/omni-kit/protocols/ajna/helpers'
import { erc4626VaultsByName } from 'features/omni-kit/protocols/erc-4626/settings'
import { Erc4626PseudoProtocol } from 'features/omni-kit/protocols/morpho-blue/constants'
import { OmniProductType } from 'features/omni-kit/types'
import type { ProductHubItem } from 'features/productHub/types'
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
        ?.includes(strategy.type.toLocaleLowerCase() as OmniProductType) &&
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
    const {
      network: aaveLikeNetwork,
      protocol: aaveLikeProtocol,
      type,
      tokens: { collateral, debt },
    } = search
    const resolvedType =
      [ProductType.Earn, ProductType.Multiply].includes(type) &&
      isYieldLoopPair({
        collateralToken: collateral,
        debtToken: debt,
      })
        ? 'multiply'
        : type
    return `/${aaveLikeNetwork.toLocaleLowerCase()}/${
      {
        [LendingProtocol.AaveV3]: 'aave/v3',
        [LendingProtocol.AaveV2]: 'aave/v2',
        [LendingProtocol.SparkV3]: 'spark',
      }[aaveLikeProtocol as LendingProtocol.SparkV3 | LendingProtocol.AaveV3]
    }/${resolvedType.toLocaleLowerCase()}/${collateral.toLocaleUpperCase()}-${debt.toLocaleUpperCase()}`
  }

  return !search?.urlSlug ||
    (!bypassFeatureFlag && search?.featureToggle && !featureToggles[search?.featureToggle])
    ? '/'
    : `/${network}/old/${aaveLikeProduct}/${version}/${search.type.toLocaleLowerCase()}/${
        search!.urlSlug
      }`
}

export function getGenericPositionUrl({
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
  if (earnStrategy === EarnStrategies.erc_4626) {
    const { id } = erc4626VaultsByName[label]

    return `/${network}/${Erc4626PseudoProtocol}/${product[0]}/${id}`
  }

  const isEarnProduct = product[0] === OmniProductType.Earn
  const isYieldLoop = earnStrategy === EarnStrategies.yield_loop
  const collateralToken = isEarnProduct && !isYieldLoop ? secondaryToken : primaryToken
  const collateralAddress =
    isEarnProduct && !isYieldLoop ? secondaryTokenAddress : primaryTokenAddress
  const quoteToken = isEarnProduct && !isYieldLoop ? primaryToken : secondaryToken
  const quoteAddress = isEarnProduct && !isYieldLoop ? primaryTokenAddress : secondaryTokenAddress

  switch (protocol) {
    case LendingProtocol.Ajna:
      const isOracless = isPoolOracless({
        collateralToken,
        quoteToken,
        networkId,
      })
      const ajnaProductInUrl = isEarnProduct && isYieldLoop ? OmniProductType.Multiply : product[0]
      const tokensInUrl = isOracless
        ? `${collateralAddress}-${quoteAddress}`
        : `${collateralToken}-${quoteToken}`

      return `/${network}/ajna/${ajnaProductInUrl}/${tokensInUrl}`
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
    case LendingProtocol.Sky:
      if (label === 'SRR') return '/earn/srr/'
      return '/'
    case LendingProtocol.Maker:
      if (label === 'DSR') return '/earn/dsr/'

      const openUrl = product.includes(OmniProductType.Multiply) ? 'open-multiply' : 'open'
      const ilkInUrl = label.split('/').length ? label.split('/')[0] : label

      return `/vaults/${openUrl}/${ilkInUrl}`
    case LendingProtocol.MorphoBlue:
      const morphoBlueProductInUrl =
        isEarnProduct && earnStrategy === EarnStrategies.yield_loop
          ? OmniProductType.Multiply
          : product[0]
      return `/${network}/${LendingProtocol.MorphoBlue}/${morphoBlueProductInUrl}/${label.replace('/', '-')}`
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
