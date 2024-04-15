import { BaseNetworkNames, NetworkNames, networksByName } from 'blockchain/networks'
import type { GenericMultiselectOption } from 'components/GenericMultiselect'
import type { HeaderSelectorOption } from 'components/HeaderSelector'
import { OmniProductType } from 'features/omni-kit/types'
import type { ProductHubCategories, ProductHubTags } from 'features/productHub/types'
import { ProductHubCategory, ProductHubTag } from 'features/productHub/types'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { LendingProtocol } from 'lendingProtocols'
import { lendingProtocolsByName } from 'lendingProtocols/lendingProtocolsConfigs'
import {
  selectBorrow,
  selectBorrowActive,
  selectEarn,
  selectEarnActive,
  selectMultiply,
  selectMultiplyActive,
} from 'theme/icons'
import { FeaturesEnum } from 'types/config'

export const MIN_LIQUIDITY = 3000

export const productHubLinksMap: { [key in OmniProductType]: string } = {
  borrow: EXTERNAL_LINKS.KB.WHAT_IS_BORROW,
  multiply: EXTERNAL_LINKS.KB.WHAT_IS_MULTIPLY,
  earn: EXTERNAL_LINKS.KB.EARN_DAI_GUNI_MULTIPLY,
}

export const productHubProductOptions: { [key in OmniProductType]: HeaderSelectorOption } = {
  borrow: {
    title: 'Borrow',
    description: 'Borrow against your favorite crypto assets',
    value: 'borrow',
    icon: [selectBorrow, selectBorrowActive],
  },
  multiply: {
    title: 'Multiply',
    description: 'Increase your exposure to any crypto asset',
    value: 'multiply',
    icon: [selectMultiply, selectMultiplyActive],
  },
  earn: {
    title: 'Earn',
    description: 'Earn long term yields to compound your crypto capital',
    value: 'earn',
    icon: [selectEarn, selectEarnActive],
  },
}

export const productHubNetworkFilter: GenericMultiselectOption[] = [
  {
    label: networksByName[BaseNetworkNames.Ethereum].label,
    value: networksByName[BaseNetworkNames.Ethereum].name,
    image: networksByName[BaseNetworkNames.Ethereum].icon,
  },
  {
    label: networksByName[BaseNetworkNames.Arbitrum].label,
    value: networksByName[BaseNetworkNames.Arbitrum].name,
    image: networksByName[BaseNetworkNames.Arbitrum].icon,
  },
  {
    label: networksByName[BaseNetworkNames.Optimism].label,
    value: networksByName[BaseNetworkNames.Optimism].name,
    image: networksByName[BaseNetworkNames.Optimism].icon,
  },
  {
    label: networksByName[BaseNetworkNames.Base].label,
    value: networksByName[BaseNetworkNames.Base].name,
    image: networksByName[BaseNetworkNames.Base].icon,
    featureFlag: FeaturesEnum.BaseNetworkEnabled,
  },
]

export const productHubTestNetworkFilter: GenericMultiselectOption[] = [
  {
    label: networksByName[BaseNetworkNames.Ethereum].label,
    value: networksByName[NetworkNames.ethereumGoerli].name,
    image: networksByName[NetworkNames.ethereumGoerli].icon,
  },
  {
    label: networksByName[BaseNetworkNames.Arbitrum].label,
    value: networksByName[NetworkNames.arbitrumGoerli].name,
    image: networksByName[NetworkNames.arbitrumGoerli].icon,
  },
  {
    label: networksByName[BaseNetworkNames.Optimism].label,
    value: networksByName[NetworkNames.optimismGoerli].name,
    image: networksByName[NetworkNames.optimismGoerli].icon,
  },
]

export const productHubProtocolFilter: GenericMultiselectOption[] = [
  {
    label: lendingProtocolsByName[LendingProtocol.AaveV2].label,
    value: lendingProtocolsByName[LendingProtocol.AaveV2].name,
    image: lendingProtocolsByName[LendingProtocol.AaveV2].icon,
  },
  {
    label: lendingProtocolsByName[LendingProtocol.AaveV3].label,
    value: lendingProtocolsByName[LendingProtocol.AaveV3].name,
    image: lendingProtocolsByName[LendingProtocol.AaveV3].icon,
  },
  {
    label: lendingProtocolsByName[LendingProtocol.Ajna].label,
    value: lendingProtocolsByName[LendingProtocol.Ajna].name,
    image: lendingProtocolsByName[LendingProtocol.Ajna].icon,
  },
  {
    label: lendingProtocolsByName[LendingProtocol.Maker].label,
    value: lendingProtocolsByName[LendingProtocol.Maker].name,
    image: lendingProtocolsByName[LendingProtocol.Maker].icon,
  },
  {
    label: lendingProtocolsByName[LendingProtocol.MorphoBlue].label,
    value: lendingProtocolsByName[LendingProtocol.MorphoBlue].name,
    image: lendingProtocolsByName[LendingProtocol.MorphoBlue].icon,
    featureFlag: FeaturesEnum.MorphoBlue,
  },
  {
    label: lendingProtocolsByName[LendingProtocol.SparkV3].label,
    value: lendingProtocolsByName[LendingProtocol.SparkV3].name,
    image: lendingProtocolsByName[LendingProtocol.SparkV3].icon,
  },
]

export const productHubCategoryAll = {
  icon: 'doc',
  id: ProductHubCategory.All,
}
const productHubCategoryTokenFarming = {
  icon: 'plant',
  id: ProductHubCategory.TokenFarming,
}
const productHubCategoryStakingRewards = {
  icon: 'sparks_empty',
  id: ProductHubCategory.StakingRewards,
}
const productHubCategoryRestaking = {
  icon: 'relock',
  id: ProductHubCategory.Restaking,
}
const productHubCategoryYieldLoops = {
  icon: 'yield_loop',
  id: ProductHubCategory.YieldLoops,
}

export const productHubCategories: ProductHubCategories = {
  [OmniProductType.Borrow]: [
    productHubCategoryTokenFarming,
    productHubCategoryStakingRewards,
    productHubCategoryRestaking,
  ],
  [OmniProductType.Multiply]: [
    productHubCategoryTokenFarming,
    productHubCategoryStakingRewards,
    productHubCategoryRestaking,
  ],
  [OmniProductType.Earn]: [
    productHubCategoryTokenFarming,
    productHubCategoryYieldLoops,
    productHubCategoryRestaking,
  ],
}

export const productHubTags: ProductHubTags = {
  [OmniProductType.Borrow]: [
    ProductHubTag.NonStablecoinCollateral,
    ProductHubTag.Longevity,
    ProductHubTag.Gt1BTvl,
    ProductHubTag.IsolatedPairs,
    ProductHubTag.BluechipAssets,
    ProductHubTag.Memecoins,
  ],
  [OmniProductType.Multiply]: [
    ProductHubTag.Stablecoins,
    ProductHubTag.EthDerivativeYieldLoops,
    ProductHubTag.Longevity,
    ProductHubTag.Gt1BTvl,
    ProductHubTag.IsolatedPairs,
    ProductHubTag.BluechipAssets,
    ProductHubTag.Memecoins,
  ],
  [OmniProductType.Earn]: [
    ProductHubTag.Stablecoins,
    ProductHubTag.EthDerivativeYieldLoops,
    ProductHubTag.EasiestToManage,
    ProductHubTag.Longevity,
    ProductHubTag.Gt1BTvl,
    ProductHubTag.BluechipAssets,
  ],
}
