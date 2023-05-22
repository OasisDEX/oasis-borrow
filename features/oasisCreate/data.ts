//TODO: to be replaced with data from API

import BigNumber from 'bignumber.js'
import { OasisCreateItem, ProductType } from 'features/oasisCreate/types'
import { BaseNetworkNames } from 'helpers/networkNames'
import { LendingProtocol } from 'lendingProtocols'

export const oasisCreateData: OasisCreateItem[] = [
  {
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'ETH',
    secondaryToken: 'DAI',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Maker,
    label: 'ETH-A/DAI',
    fee: new BigNumber(0.015),
    liquidity: new BigNumber(183129503),
    maxMultiply: new BigNumber(3.22),
    maxLtv: new BigNumber(0.7692),
    strategy: 'long',
    strategyLabel: 'Long ETH',
  },
  {
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'ETH',
    secondaryToken: 'DAI',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Maker,
    label: 'ETH-B/DAI',
    fee: new BigNumber(0.03),
    liquidity: new BigNumber(21448395),
    maxMultiply: new BigNumber(4.33),
    maxLtv: new BigNumber(0.6896),
    strategy: 'long',
    strategyLabel: 'Long ETH',
  },
  {
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'ETH',
    secondaryToken: 'DAI',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Maker,
    label: 'ETH-C/DAI',
    fee: new BigNumber(0.0075),
    liquidity: new BigNumber(101643927),
    maxMultiply: new BigNumber(2.42),
    maxLtv: new BigNumber(0.5882),
    strategy: 'long',
    strategyLabel: 'Long ETH',
  },
  {
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'WSTETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'DAI',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Maker,
    label: 'WSTETH-A/DAI',
    fee: new BigNumber(0.015),
    liquidity: new BigNumber(14749572),
    maxMultiply: new BigNumber(2.66),
    maxLtv: new BigNumber(0.625),
    strategy: 'long',
    strategyLabel: 'Long WSTETH',
  },
  {
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'WSTETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'DAI',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Maker,
    label: 'WSTETH-B/DAI',
    fee: new BigNumber(0.0075),
    liquidity: new BigNumber(15195920),
    maxMultiply: new BigNumber(2.17),
    maxLtv: new BigNumber(0.5405),
    strategy: 'long',
    strategyLabel: 'Long WSTETH',
  },
  {
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'RETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'DAI',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Maker,
    label: 'RETH-A/DAI',
    fee: new BigNumber(0.005),
    liquidity: new BigNumber(3000000),
    maxMultiply: new BigNumber(2.42),
    maxLtv: new BigNumber(0.5882),
    strategy: 'long',
    strategyLabel: 'Long RETH',
  },
  {
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'ETH',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'ETH/USDC',
    strategy: 'long',
    strategyLabel: 'Long ETH',
  },
  {
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'WSTETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'WSTETH/USDC',
    strategy: 'long',
    strategyLabel: 'Long WSTETH',
  },
  {
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'WSTETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'ETH',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'WSTETH/ETH',
    strategy: 'long',
    strategyLabel: 'Long WSTETH',
  },
  {
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'RETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'ETH',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'RETH/ETH',
    strategy: 'long',
    strategyLabel: 'Long RETH',
  },
  {
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'CBETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'ETH',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'CBETH/ETH',
    strategy: 'long',
    strategyLabel: 'Long CBETH',
  },
  {
    product: ProductType.Multiply,
    primaryToken: 'ETH',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.AaveV2,
    label: 'ETH/USDC',
    fee: new BigNumber(0.0371),
    liquidity: new BigNumber(87146012),
    maxMultiply: new BigNumber(5.71),
    maxLtv: new BigNumber(0.825),
    strategy: 'long',
    strategyLabel: 'Long ETH',
  },
  {
    product: ProductType.Multiply,
    primaryToken: 'ETH',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Arbitrum,
    protocol: LendingProtocol.AaveV3,
    label: 'ETH/USDC',
    strategy: 'long',
    strategyLabel: 'Long ETH',
  },
  {
    product: ProductType.Multiply,
    primaryToken: 'ETH',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.AaveV3,
    label: 'ETH/USDC',
    strategy: 'long',
    strategyLabel: 'Long ETH',
  },
  {
    product: ProductType.Multiply,
    primaryToken: 'ETH',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Optimism,
    protocol: LendingProtocol.AaveV3,
    label: 'ETH/USDC',
    strategy: 'long',
    strategyLabel: 'Long ETH',
  },
  {
    product: ProductType.Multiply,
    primaryToken: 'WSTETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Arbitrum,
    protocol: LendingProtocol.AaveV3,
    label: 'WSTETH/USDC',
    strategy: 'long',
    strategyLabel: 'Long WSTETH',
  },
  {
    product: ProductType.Multiply,
    primaryToken: 'WSTETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.AaveV3,
    label: 'WSTETH/USDC',
    strategy: 'long',
    strategyLabel: 'Long WSTETH',
  },
  {
    product: ProductType.Multiply,
    primaryToken: 'WSTETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Optimism,
    protocol: LendingProtocol.AaveV3,
    label: 'WSTETH/USDC',
    strategy: 'long',
    strategyLabel: 'Long WSTETH',
  },
  {
    product: ProductType.Multiply,
    primaryToken: 'CBETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.AaveV3,
    label: 'CBETH/USDC',
    strategy: 'long',
    strategyLabel: 'Long CBETH',
  },
  {
    product: ProductType.Multiply,
    primaryToken: 'CBETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.AaveV3,
    label: 'CBETH/USDC',
    strategy: 'long',
    strategyLabel: 'Long CBETH',
  },
  {
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'WBTC',
    secondaryToken: 'DAI',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Maker,
    label: 'WBTC-A/DAI',
    fee: new BigNumber(0.049),
    liquidity: new BigNumber(20797593),
    maxMultiply: new BigNumber(3.22),
    maxLtv: new BigNumber(0.6896),
    strategy: 'long',
    strategyLabel: 'Long WBTC',
  },
  {
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'WBTC',
    secondaryToken: 'DAI',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Maker,
    label: 'WBTC-B/DAI',
    fee: new BigNumber(0.049),
    liquidity: new BigNumber(10090826),
    maxMultiply: new BigNumber(4.33),
    maxLtv: new BigNumber(0.7692),
    strategy: 'long',
    strategyLabel: 'Long WBTC',
  },
  {
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'WBTC',
    secondaryToken: 'DAI',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Maker,
    label: 'WBTC-C/DAI',
    fee: new BigNumber(0.049),
    liquidity: new BigNumber(29096112),
    maxMultiply: new BigNumber(2.33),
    maxLtv: new BigNumber(0.5714),
    strategy: 'long',
    strategyLabel: 'Long WBTC',
  },
  {
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'WBTC',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'WBTC/USDC',
    strategy: 'long',
    strategyLabel: 'Long WBTC',
  },
  {
    product: ProductType.Multiply,
    primaryToken: 'WBTC',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.AaveV2,
    label: 'WBTC/USDC',
    strategy: 'long',
    strategyLabel: 'Long WBTC',
  },
  {
    product: ProductType.Multiply,
    primaryToken: 'WBTC',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Arbitrum,
    protocol: LendingProtocol.AaveV3,
    label: 'WBTC/USDC',
    strategy: 'long',
    strategyLabel: 'Long WBTC',
  },
  {
    product: ProductType.Multiply,
    primaryToken: 'WBTC',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.AaveV3,
    label: 'WBTC/USDC',
    strategy: 'long',
    strategyLabel: 'Long WBTC',
  },
  {
    product: ProductType.Multiply,
    primaryToken: 'WBTC',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Optimism,
    protocol: LendingProtocol.AaveV3,
    label: 'WBTC/USDC',
    strategy: 'long',
    strategyLabel: 'Long WBTC',
  },
  {
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'USDC',
    secondaryToken: 'ETH',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'USDC/ETH',
    strategy: 'short',
    strategyLabel: 'Short ETH',
  },
  {
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'USDC',
    secondaryToken: 'WBTC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'USDC/WBTC',
    strategy: 'short',
    strategyLabel: 'Short WBTC',
  },
  {
    product: ProductType.Earn,
    primaryToken: 'DAI',
    secondaryToken: 'DAI',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Maker,
    label: 'DSR',
    managementType: 'passive',
  },
  {
    product: ProductType.Earn,
    primaryToken: 'ETH',
    secondaryToken: 'WSTETH',
    secondaryTokenGroup: 'ETH',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'WSTETH/ETH',
    managementType: 'active',
  },
  {
    product: ProductType.Earn,
    primaryToken: 'ETH',
    secondaryToken: 'RETH',
    secondaryTokenGroup: 'ETH',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'RETH/ETH',
    managementType: 'active',
  },
  {
    product: ProductType.Earn,
    primaryToken: 'ETH',
    secondaryToken: 'CBETH',
    secondaryTokenGroup: 'ETH',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'CBETH/ETH',
    managementType: 'active',
  },
  {
    product: ProductType.Earn,
    primaryToken: 'ETH',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'USDC/ETH',
    managementType: 'active',
  },
  {
    product: ProductType.Earn,
    primaryToken: 'WBTC',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'USDC/WBTC',
    managementType: 'active',
  },
  {
    product: ProductType.Earn,
    primaryToken: 'USDC',
    secondaryToken: 'ETH',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'ETH/USDC',
    '7DayNetApy': new BigNumber(0.0001),
    '90DayNetApy': new BigNumber(0.0021),
    managementType: 'active',
  },
  {
    product: ProductType.Earn,
    primaryToken: 'USDC',
    secondaryToken: 'WSTETH',
    secondaryTokenGroup: 'ETH',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'WSTETH/USDC',
    managementType: 'active',
  },
  {
    product: ProductType.Earn,
    primaryToken: 'USDC',
    secondaryToken: 'WBTC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'WBTC/USDC',
    '7DayNetApy': new BigNumber(0.0002),
    '90DayNetApy': new BigNumber(0.0027),
    managementType: 'active',
  },
]
