//TODO: to be replaced with data from API

import BigNumber from 'bignumber.js'
import { OasisCreateItem, ProductType } from 'features/oasisCreate/types'
import { BaseNetworkNames } from 'helpers/networkNames'
import { LendingProtocol } from 'lendingProtocols'

export const oasisCreateData: OasisCreateItem[] = [
  {
    groupToken: 'ETH',
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'ETH',
    secondaryToken: 'DAI',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Maker,
    label: 'ETH-A/DAI',
    url: '/',
    fee: new BigNumber(0.015),
    liquidity: new BigNumber(183129503),
    maxMultiply: new BigNumber(3.22),
    maxLtv: new BigNumber(0.7692),
    investmentType: 'long',
  },
  {
    groupToken: 'ETH',
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'ETH',
    secondaryToken: 'DAI',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Maker,
    label: 'ETH-B/DAI',
    url: '/',
    fee: new BigNumber(0.03),
    liquidity: new BigNumber(21448395),
    maxMultiply: new BigNumber(4.33),
    maxLtv: new BigNumber(0.6896),
    investmentType: 'long',
  },
  {
    groupToken: 'ETH',
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'ETH',
    secondaryToken: 'DAI',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Maker,
    label: 'ETH-C/DAI',
    url: '/',
    fee: new BigNumber(0.0075),
    liquidity: new BigNumber(101643927),
    maxMultiply: new BigNumber(2.42),
    maxLtv: new BigNumber(0.5882),
    investmentType: 'long',
  },
  {
    groupToken: 'ETH',
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'WSTETH',
    secondaryToken: 'DAI',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Maker,
    label: 'WSTETH-A/DAI',
    url: '/',
    fee: new BigNumber(0.015),
    liquidity: new BigNumber(14749572),
    maxMultiply: new BigNumber(2.66),
    maxLtv: new BigNumber(0.625),
    investmentType: 'long',
  },
  {
    groupToken: 'ETH',
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'WSTETH',
    secondaryToken: 'DAI',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Maker,
    label: 'WSTETH-B/DAI',
    url: '/',
    fee: new BigNumber(0.0075),
    liquidity: new BigNumber(15195920),
    maxMultiply: new BigNumber(2.17),
    maxLtv: new BigNumber(0.5405),
    investmentType: 'long',
  },
  {
    groupToken: 'ETH',
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'RETH',
    secondaryToken: 'DAI',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Maker,
    label: 'RETH-A/DAI',
    url: '/',
    fee: new BigNumber(0.005),
    liquidity: new BigNumber(3000000),
    maxMultiply: new BigNumber(2.42),
    maxLtv: new BigNumber(0.5882),
    investmentType: 'long',
  },
  {
    groupToken: 'ETH',
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'ETH',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'ETH/USDC',
    url: '/',
  },
  {
    groupToken: 'ETH',
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'WSTETH',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'WSTETH/USDC',
    url: '/',
  },
  {
    groupToken: 'ETH',
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'WSTETH',
    secondaryToken: 'ETH',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'WSTETH/ETH',
    url: '/',
  },
  {
    groupToken: 'ETH',
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'RETH',
    secondaryToken: 'ETH',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'RETH/ETH',
    url: '/',
  },
  {
    groupToken: 'ETH',
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'CBETH',
    secondaryToken: 'ETH',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'CBETH/ETH',
    url: '/',
  },
  {
    groupToken: 'ETH',
    product: ProductType.Multiply,
    primaryToken: 'ETH',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.AaveV2,
    label: 'ETH/USDC',
    url: '/',
    fee: new BigNumber(0.0371),
    liquidity: new BigNumber(87146012),
    maxMultiply: new BigNumber(5.71),
    maxLtv: new BigNumber(0.825),
    investmentType: 'short',
  },
  {
    groupToken: 'ETH',
    product: ProductType.Multiply,
    primaryToken: 'ETH',
    secondaryToken: 'USDC',
    network: [BaseNetworkNames.Ethereum, BaseNetworkNames.Arbitrum, BaseNetworkNames.Optimism],
    protocol: LendingProtocol.AaveV3,
    label: 'ETH/USDC',
    url: '/',
    investmentType: ['short', 'long'],
  },
  {
    groupToken: 'ETH',
    product: ProductType.Multiply,
    primaryToken: 'WSTETH',
    secondaryToken: 'USDC',
    network: [BaseNetworkNames.Ethereum, BaseNetworkNames.Arbitrum, BaseNetworkNames.Optimism],
    protocol: LendingProtocol.AaveV3,
    label: 'WSTETH/USDC',
    url: '/',
    investmentType: ['short', 'long'],
  },
  {
    groupToken: 'ETH',
    product: ProductType.Multiply,
    primaryToken: 'CBETH',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.AaveV3,
    label: 'CBETH/USDC',
    url: '/',
    investmentType: ['short', 'long'],
  },
  {
    groupToken: 'ETH',
    product: ProductType.Multiply,
    primaryToken: 'CBETH',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.AaveV3,
    label: 'CBETH/USDC',
    url: '/',
    investmentType: ['short', 'long'],
  },
  {
    groupToken: 'WBTC',
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'WBTC',
    secondaryToken: 'DAI',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Maker,
    label: 'WBTC-A/DAI',
    url: '/',
    fee: new BigNumber(0.049),
    liquidity: new BigNumber(20797593),
    maxMultiply: new BigNumber(3.22),
    maxLtv: new BigNumber(0.6896),
    investmentType: 'long',
  },
  {
    groupToken: 'WBTC',
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'WBTC',
    secondaryToken: 'DAI',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Maker,
    label: 'WBTC-B/DAI',
    url: '/',
    fee: new BigNumber(0.049),
    liquidity: new BigNumber(10090826),
    maxMultiply: new BigNumber(4.33),
    maxLtv: new BigNumber(0.7692),
    investmentType: 'long',
  },
  {
    groupToken: 'WBTC',
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'WBTC',
    secondaryToken: 'DAI',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Maker,
    label: 'WBTC-C/DAI',
    url: '/',
    fee: new BigNumber(0.049),
    liquidity: new BigNumber(29096112),
    maxMultiply: new BigNumber(2.33),
    maxLtv: new BigNumber(0.5714),
    investmentType: 'long',
  },
  {
    groupToken: 'WBTC',
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'WBTC',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'WBTC/USDC',
    url: '/',
  },
  {
    groupToken: 'WBTC',
    product: ProductType.Multiply,
    primaryToken: 'WBTC',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.AaveV2,
    label: 'WBTC/USDC',
    url: '/',
    investmentType: 'long',
  },
  {
    groupToken: 'WBTC',
    product: ProductType.Multiply,
    primaryToken: 'WBTC',
    secondaryToken: 'USDC',
    network: [BaseNetworkNames.Ethereum, BaseNetworkNames.Arbitrum, BaseNetworkNames.Optimism],
    protocol: LendingProtocol.AaveV3,
    label: 'WBTC/USDC',
    url: '/',
  },
  {
    groupToken: 'USDC',
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'USDC',
    secondaryToken: 'ETH',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'USDC/ETH',
    url: '/',
  },
  {
    groupToken: 'USDC',
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'USDC',
    secondaryToken: 'WBTC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'USDC/WBTC',
    url: '/',
  },
  {
    groupToken: 'DAI',
    product: ProductType.Earn,
    primaryToken: 'DAI',
    secondaryToken: 'DAI',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Maker,
    label: 'DSR',
    url: '/',
    managementType: 'passive',
  },
  {
    groupToken: 'ETH',
    product: ProductType.Earn,
    primaryToken: 'ETH',
    secondaryToken: 'WSTETH',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'WSTETH/ETH',
    url: '/',
    managementType: 'active',
  },
  {
    groupToken: 'ETH',
    product: ProductType.Earn,
    primaryToken: 'ETH',
    secondaryToken: 'RETH',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'RETH/ETH',
    url: '/',
    managementType: 'active',
  },
  {
    groupToken: 'ETH',
    product: ProductType.Earn,
    primaryToken: 'ETH',
    secondaryToken: 'CBETH',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'CBETH/ETH',
    url: '/',
    managementType: 'active',
  },
  {
    groupToken: 'ETH',
    product: ProductType.Earn,
    primaryToken: 'ETH',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'USDC/ETH',
    url: '/',
    managementType: 'active',
  },
  {
    groupToken: 'WBTC',
    product: ProductType.Earn,
    primaryToken: 'WBTC',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'USDC/WBTC',
    url: '/',
    managementType: 'active',
  },
  {
    groupToken: 'USDC',
    product: ProductType.Earn,
    primaryToken: 'USDC',
    secondaryToken: 'ETH',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'ETH/USDC',
    url: '/',
    '7DayNetApy': new BigNumber(0.0001),
    '90DayNetApy': new BigNumber(0.0021),
    managementType: 'active',
  },
  {
    groupToken: 'USDC',
    product: ProductType.Earn,
    primaryToken: 'USDC',
    secondaryToken: 'WSTETH',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'WSTETH/USDC',
    url: '/',
    managementType: 'active',
  },
  {
    groupToken: 'USDC',
    product: ProductType.Earn,
    primaryToken: 'USDC',
    secondaryToken: 'WBTC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'WBTC/USDC',
    url: '/',
    '7DayNetApy': new BigNumber(0.0002),
    '90DayNetApy': new BigNumber(0.0027),
    managementType: 'active',
  },
]
