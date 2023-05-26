//TODO: to be replaced with data from API

import BigNumber from 'bignumber.js'
import { BaseNetworkNames } from 'blockchain/networks'
import { getToken } from 'blockchain/tokensMetadata'
import { PromoCardPropsWithContent, PromoCardVariant } from 'components/PromoCard'
import {
  ProductHubData,
  ProductHubItem,
  ProductHubPromoCards,
  ProductType,
} from 'features/productHub/types'
import { LendingProtocol } from 'lendingProtocols'
import React from 'react'
import { Text } from 'theme-ui'

const protocol = {
  aavev2: { network: BaseNetworkNames.Ethereum, protocol: LendingProtocol.AaveV2 },
  aavev3: { network: BaseNetworkNames.Ethereum, protocol: LendingProtocol.AaveV3 },
  aavev3Arbitrum: { network: BaseNetworkNames.Arbitrum, protocol: LendingProtocol.AaveV3 },
  aavev3Optimism: { network: BaseNetworkNames.Optimism, protocol: LendingProtocol.AaveV3 },
  ajna: { network: BaseNetworkNames.Ethereum, protocol: LendingProtocol.Ajna },
  maker: { network: BaseNetworkNames.Ethereum, protocol: LendingProtocol.Maker },
}
const pill = {
  negative: { label: 'Negative label', variant: 'negative' as PromoCardVariant },
  neutral: { label: 'Neutral label' },
  positive: { label: 'Positive label', variant: 'positive' as PromoCardVariant },
}
const data = {
  negative: (v: string) => ({
    label: 'Negative value',
    value: v,
    variant: 'negative' as PromoCardVariant,
  }),
  neutral: (v: string) => ({ label: 'Neutral value', value: v }),
  positive: (v: string) => ({
    label: 'Positive value',
    value: v,
    variant: 'positive' as PromoCardVariant,
  }),
}

const oasisCreatePromoCardBorrowEth: PromoCardPropsWithContent = {
  icon: getToken('ETH').iconCircle,
  title: 'Main borrow ETH promo card',
  protocol: protocol.maker,
  pills: [pill.neutral, pill.positive],
  data: [data.positive('11.9%')],
}
const oasisCreatePromoCardBorrowWbtc: PromoCardPropsWithContent = {
  icon: getToken('WBTC').iconCircle,
  title: 'Main borrow WBTC promo card',
  protocol: protocol.maker,
  pills: [pill.neutral, pill.negative],
  data: [data.negative('-0.40%')],
}
const oasisCreatePromoCardBorrowUsdc: PromoCardPropsWithContent = {
  icon: getToken('USDC').iconCircle,
  title: 'Main borrow USDC promo card',
  protocol: protocol.ajna,
  pills: [pill.neutral, pill.positive],
  data: [data.positive('6.13%')],
}
const oasisCreatePromoCardMultiplyEth: PromoCardPropsWithContent = {
  icon: getToken('ETH').iconCircle,
  title: 'Main multiply ETH promo card',
  protocol: protocol.maker,
  pills: [pill.neutral, pill.negative],
  data: [data.negative('-2.71%')],
}
const oasisCreatePromoCardMultiplyWbtc: PromoCardPropsWithContent = {
  icon: getToken('WBTC').iconCircle,
  title: 'Main multiply WBTC promo card',
  protocol: protocol.aavev2,
  pills: [pill.neutral, pill.positive],
  data: [data.positive('1.46%')],
}
const oasisCreatePromoCardMultiplyUsdc: PromoCardPropsWithContent = {
  icon: getToken('USDC').iconCircle,
  title: 'Main multiply USDC promo card',
  protocol: protocol.aavev3Optimism,
  pills: [pill.neutral, pill.positive],
  data: [data.positive('48.62%')],
}
const oasisCreatePromoCardEarnDai: PromoCardPropsWithContent = {
  icon: getToken('DAI').iconCircle,
  title: 'Earn DAI promo card',
  protocol: protocol.maker,
  pills: [pill.neutral, pill.positive],
  description: 'Lorem ipsum dolor sit amet.',
}
const oasisCreatePromoCardEarnWsteth: PromoCardPropsWithContent = {
  icon: getToken('WSTETH').iconCircle,
  title: 'Main earn wstETH promo card',
  protocol: protocol.ajna,
  pills: [pill.neutral, pill.positive],
  data: [data.positive('$1,235.56')],
}
const oasisCreatePromoCardGeneric: PromoCardPropsWithContent = {
  icon: 'selectEarn',
  title: 'Generic promo card',
  description: 'Lorem ipsum dolor sit amet, consectetur.',
  link: { href: '/', label: 'Learn more' },
}

const oasisCreatePromoCards: ProductHubPromoCards = {
  [ProductType.Borrow]: {
    default: [
      oasisCreatePromoCardBorrowEth,
      oasisCreatePromoCardBorrowWbtc,
      oasisCreatePromoCardBorrowUsdc,
    ],
    tokens: {
      ETH: [
        oasisCreatePromoCardBorrowEth,
        {
          icon: getToken('WSTETH').iconCircle,
          title: 'Secondary borrow wstETH promo card',
          protocol: protocol.maker,
          pills: [pill.neutral, pill.neutral],
          data: [data.neutral('10.03%')],
        },
        {
          icon: getToken('RETH').iconCircle,
          title: 'Secondary borrow rETH promo card',
          protocol: protocol.ajna,
          pills: [pill.neutral, pill.positive],
          data: [data.positive('$724.12')],
        },
      ],
      WBTC: [
        oasisCreatePromoCardBorrowWbtc,
        {
          icon: getToken('WBTC').iconCircle,
          title: 'Secondary borrow WBTC promo card',
          protocol: protocol.maker,
          pills: [pill.neutral, pill.neutral],
          data: [data.neutral('$2.55M')],
        },
        {
          icon: getToken('WBTC').iconCircle,
          title: 'Secondary borrow WBTC promo card',
          protocol: protocol.ajna,
          pills: [pill.neutral, pill.positive],
          data: [data.positive('13.52%')],
        },
      ],
      USDC: [
        oasisCreatePromoCardBorrowUsdc,
        {
          icon: getToken('USDC').iconCircle,
          title: 'Secondary borrow USDC promo card',
          protocol: protocol.ajna,
          pills: [pill.neutral, pill.negative],
          data: [data.negative('-2.65%')],
        },
        oasisCreatePromoCardGeneric,
      ],
    },
  },
  [ProductType.Multiply]: {
    default: [
      oasisCreatePromoCardMultiplyEth,
      oasisCreatePromoCardMultiplyWbtc,
      oasisCreatePromoCardMultiplyUsdc,
    ],
    tokens: {
      ETH: [
        oasisCreatePromoCardMultiplyEth,
        {
          icon: getToken('RETH').iconCircle,
          title: 'Secondary multiply rETH promo card',
          protocol: protocol.ajna,
          pills: [pill.neutral, pill.neutral],
          data: [data.neutral('2.27% - 8.81%')],
        },
        {
          icon: getToken('CBETH').iconCircle,
          title: 'Secondary multiply cbETH promo card',
          protocol: protocol.aavev2,
          pills: [pill.neutral, pill.negative],
          data: [data.neutral('$3.01')],
        },
      ],
      WBTC: [
        oasisCreatePromoCardMultiplyWbtc,
        {
          icon: getToken('WBTC').iconCircle,
          title: 'Secondary multiply WBTC promo card',
          protocol: protocol.aavev3Optimism,
          pills: [pill.neutral, pill.neutral],
          data: [data.neutral('4.33x')],
        },
        oasisCreatePromoCardGeneric,
      ],
      USDC: [
        oasisCreatePromoCardMultiplyUsdc,
        {
          icon: getToken('USDC').iconCircle,
          title: 'Secondary multiply USDC promo card',
          protocol: protocol.aavev3Arbitrum,
          pills: [pill.neutral, pill.positive],
          data: [data.positive('101.96%')],
        },
        {
          icon: getToken('USDC').iconCircle,
          title: 'Secondary multiply USDC promo card',
          protocol: protocol.aavev3,
          pills: [pill.neutral, pill.positive],
          data: [data.positive('12.68%')],
        },
      ],
    },
  },
  [ProductType.Earn]: {
    default: [
      oasisCreatePromoCardEarnDai,
      oasisCreatePromoCardEarnWsteth,
      oasisCreatePromoCardGeneric,
    ],
    tokens: {
      ETH: [
        oasisCreatePromoCardEarnWsteth,
        {
          icon: getToken('CBETH').iconCircle,
          title: 'Secondary earn cbETH promo card',
          protocol: protocol.aavev2,
          pills: [pill.neutral, pill.negative],
          data: [data.negative('$133.78')],
        },
        {
          icon: getToken('RETH').iconCircle,
          title: 'Secondary earn rETH promo card',
          protocol: protocol.ajna,
          pills: [pill.neutral, pill.neutral],
          data: [data.neutral('n/a')],
        },
      ],
      WBTC: [
        {
          icon: getToken('WBTC').iconCircle,
          title: 'Secondary earn WBTC promo card',
          protocol: protocol.ajna,
          pills: [pill.neutral, pill.positive],
          data: [data.positive('5.33%')],
        },
        oasisCreatePromoCardGeneric,
        oasisCreatePromoCardGeneric,
      ],
      DAI: [oasisCreatePromoCardEarnDai, oasisCreatePromoCardGeneric, oasisCreatePromoCardGeneric],
      USDC: [
        {
          icon: getToken('USDC').iconCircle,
          title: 'Secondary earn USDC promo card',
          protocol: protocol.ajna,
          pills: [pill.neutral, pill.neutral],
          data: [data.neutral('0.00% - 0.21%')],
        },
        {
          icon: getToken('USDC').iconCircle,
          title: 'Secondary earn USDC promo card',
          protocol: protocol.ajna,
          pills: [pill.neutral, pill.negative],
          data: [data.negative('-14.54')],
        },
        {
          icon: getToken('USDC').iconCircle,
          title: 'Secondary earn USDC promo card',
          protocol: protocol.ajna,
          pills: [pill.neutral, pill.negative],
          data: [data.negative('$0.98')],
        },
      ],
    },
  },
}

const oasisCreateAjnaYieldTokenTooltip = (
  <>
    <Text as="span" sx={{ display: 'block', mb: 1, fontWeight: 'semiBold' }}>
      This position earns AJNA tokens
    </Text>
    Opening this Ajna position on Oasis.app makes you eligible for AJNA token rewards. You will earn
    automatically with weekly claim periods.
  </>
)

const oasisCreateTable: ProductHubItem[] = [
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
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long ETH',
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
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long ETH',
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
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long ETH',
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
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WSTETH',
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
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WSTETH',
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
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long RETH',
    tooltips: {
      fee: {
        content: (
          <>
            <Text as="span" sx={{ display: 'block', mb: 1, fontWeight: 'semiBold' }}>
              I am a random tooltip
            </Text>
            I can be assigned to any content row with any icon or value. Neat, isn't it?
          </>
        ),
        icon: 'arrow_decrease',
      },
    },
  },
  {
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'ETH',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'ETH/USDC',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long ETH',
  },
  {
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'WSTETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'DAI',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'WSTETH/DAI',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WSTETH',
  },
  {
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'WSTETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'WSTETH/USDC',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WSTETH',
  },
  {
    product: [ProductType.Borrow, ProductType.Multiply, ProductType.Earn],
    primaryToken: 'WSTETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'ETH',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'WSTETH/ETH',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WSTETH',
    earnStrategy: 'WSTETH/ETH Yield',
    managementType: 'active-with-liq-risk',
    '7DayNetApy': new BigNumber(0.0145),
    liquidity: new BigNumber(4134874),
    tooltips: {
      '7DayNetApy': {
        content: oasisCreateAjnaYieldTokenTooltip,
        icon: 'sparks',
      },
    },
  },
  {
    product: [ProductType.Borrow, ProductType.Multiply, ProductType.Earn],
    primaryToken: 'RETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'ETH',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'RETH/ETH',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long RETH',
    earnStrategy: 'RETH/ETH Yield',
    managementType: 'active-with-liq-risk',
    '7DayNetApy': new BigNumber(0.0209),
    liquidity: new BigNumber(3852147),
    tooltips: {
      '7DayNetApy': {
        content: oasisCreateAjnaYieldTokenTooltip,
        icon: 'sparks',
      },
    },
  },
  {
    product: [ProductType.Borrow, ProductType.Multiply, ProductType.Earn],
    primaryToken: 'CBETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'ETH',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'CBETH/ETH',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long CBETH',
    earnStrategy: 'CBETH/ETH Yield',
    managementType: 'active-with-liq-risk',
    '7DayNetApy': new BigNumber(0.0083),
    liquidity: new BigNumber(943284),
    tooltips: {
      '7DayNetApy': {
        content: oasisCreateAjnaYieldTokenTooltip,
        icon: 'sparks',
      },
    },
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
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long ETH',
  },
  {
    product: ProductType.Multiply,
    primaryToken: 'ETH',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.AaveV3,
    label: 'ETH/USDC',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long ETH',
  },
  {
    product: ProductType.Multiply,
    primaryToken: 'ETH',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Arbitrum,
    protocol: LendingProtocol.AaveV3,
    label: 'ETH/USDC',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long ETH',
  },
  {
    product: ProductType.Multiply,
    primaryToken: 'ETH',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Optimism,
    protocol: LendingProtocol.AaveV3,
    label: 'ETH/USDC',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long ETH',
  },
  {
    product: ProductType.Multiply,
    primaryToken: 'WSTETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.AaveV3,
    label: 'WSTETH/USDC',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WSTETH',
  },
  {
    product: ProductType.Multiply,
    primaryToken: 'WSTETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Arbitrum,
    protocol: LendingProtocol.AaveV3,
    label: 'WSTETH/USDC',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WSTETH',
  },
  {
    product: ProductType.Multiply,
    primaryToken: 'WSTETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Optimism,
    protocol: LendingProtocol.AaveV3,
    label: 'WSTETH/USDC',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WSTETH',
  },
  {
    product: ProductType.Multiply,
    primaryToken: 'CBETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.AaveV2,
    label: 'CBETH/USDC',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long CBETH',
  },
  {
    product: ProductType.Multiply,
    primaryToken: 'CBETH',
    primaryTokenGroup: 'ETH',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.AaveV3,
    label: 'CBETH/USDC',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long CBETH',
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
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WBTC',
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
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WBTC',
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
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WBTC',
  },
  {
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'WBTC',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'WBTC/USDC',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WBTC',
  },
  {
    product: ProductType.Multiply,
    primaryToken: 'WBTC',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.AaveV2,
    label: 'WBTC/USDC',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WBTC',
  },
  {
    product: ProductType.Multiply,
    primaryToken: 'WBTC',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.AaveV3,
    label: 'WBTC/USDC',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WBTC',
  },
  {
    product: ProductType.Multiply,
    primaryToken: 'WBTC',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Arbitrum,
    protocol: LendingProtocol.AaveV3,
    label: 'WBTC/USDC',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WBTC',
  },
  {
    product: ProductType.Multiply,
    primaryToken: 'WBTC',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Optimism,
    protocol: LendingProtocol.AaveV3,
    label: 'WBTC/USDC',
    multiplyStrategyType: 'long',
    multiplyStrategy: 'Long WBTC',
  },
  {
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'USDC',
    secondaryToken: 'ETH',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'USDC/ETH',
    multiplyStrategyType: 'short',
    multiplyStrategy: 'Short ETH',
  },
  {
    product: [ProductType.Borrow, ProductType.Multiply],
    primaryToken: 'USDC',
    secondaryToken: 'WBTC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'USDC/WBTC',
    multiplyStrategyType: 'short',
    multiplyStrategy: 'Short WBTC',
  },
  {
    product: ProductType.Earn,
    primaryToken: 'USDC',
    secondaryToken: 'ETH',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'ETH/USDC',
    '7DayNetApy': new BigNumber(0.0001),
    earnStrategy: 'ETH/USDC LP',
    managementType: 'active',
    reverseTokens: true,
  },
  {
    product: ProductType.Earn,
    primaryToken: 'USDC',
    secondaryToken: 'WSTETH',
    secondaryTokenGroup: 'ETH',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'WSTETH/USDC',
    earnStrategy: 'WSTETH/USDC LP',
    managementType: 'active',
    reverseTokens: true,
  },
  {
    product: ProductType.Earn,
    primaryToken: 'USDC',
    secondaryToken: 'WBTC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'WBTC/USDC',
    '7DayNetApy': new BigNumber(0.0002),
    earnStrategy: 'WBTC/USDC LP',
    managementType: 'active',
    reverseTokens: true,
  },
  {
    product: ProductType.Earn,
    primaryToken: 'ETH',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'USDC/ETH',
    earnStrategy: 'USDC/ETH LP',
    managementType: 'active',
    reverseTokens: true,
  },
  {
    product: ProductType.Earn,
    primaryToken: 'WBTC',
    secondaryToken: 'USDC',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'USDC/WBTC',
    earnStrategy: 'USDC/WBTC LP',
    managementType: 'active',
    reverseTokens: true,
  },
  {
    product: ProductType.Earn,
    primaryToken: 'ETH',
    secondaryToken: 'WSTETH',
    secondaryTokenGroup: 'ETH',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'WSTETH/ETH',
    earnStrategy: 'WSTETH/ETH LP',
    managementType: 'active',
    reverseTokens: true,
  },
  {
    product: ProductType.Earn,
    primaryToken: 'ETH',
    secondaryToken: 'RETH',
    secondaryTokenGroup: 'ETH',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'RETH/ETH',
    earnStrategy: 'RETH/ETH LP',
    managementType: 'active',
    reverseTokens: true,
  },
  {
    product: ProductType.Earn,
    primaryToken: 'ETH',
    secondaryToken: 'CBETH',
    secondaryTokenGroup: 'ETH',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Ajna,
    label: 'CBETH/ETH',
    earnStrategy: 'CBETH/ETH LP',
    managementType: 'active',
    reverseTokens: true,
  },
  {
    product: ProductType.Earn,
    primaryTokenGroup: 'ETH',
    primaryToken: 'STETH',
    secondaryToken: 'ETH',
    depositToken: 'ETH',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.AaveV2,
    label: 'STETH/ETH',
    earnStrategy: 'STETH/ETH Yield',
    managementType: 'active-with-liq-risk',
  },
  {
    product: ProductType.Earn,
    primaryTokenGroup: 'ETH',
    primaryToken: 'WSTETH',
    secondaryToken: 'ETH',
    depositToken: 'ETH',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.AaveV3,
    label: 'WSTETH/ETH',
    earnStrategy: 'WSTETH/ETH Yield',
    managementType: 'active-with-liq-risk',
  },
  {
    product: ProductType.Earn,
    primaryToken: 'DAI',
    secondaryToken: 'DAI',
    network: BaseNetworkNames.Ethereum,
    protocol: LendingProtocol.Maker,
    label: 'DSR',
    managementType: 'passive',
    earnStrategy: 'DSR',
    '7DayNetApy': new BigNumber(0.022),
  },
]

export const productHubData: ProductHubData = {
  promoCards: oasisCreatePromoCards,
  table: oasisCreateTable,
}
