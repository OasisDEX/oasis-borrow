import { INTERNAL_LINKS } from 'helpers/applicationLinks'

export const productCardsAjna = {
  borrow: [
    {
      token: 'ETH',
      headerKey: 'ajna.product-cards.borrow-against-your',
      icon: 'ether_circle_color',
      background: 'linear-gradient(160.47deg, #F0F3FD 0.35%, #FCF0FD 99.18%), #FFFFFF',
      banner: {
        titleKey: 'ajna.product-cards.collaterals-you-can-borrow',
      },
      button: {
        link: INTERNAL_LINKS.ajnaBorrow,
        hash: 'ETH',
        labelKey: 'get-started',
      },
      labels: [
        {
          titleKey: 'ajna.product-cards.annual-variable-rates',
          value: '0.25% ↑',
        },
      ],
    },
    {
      token: 'RETH',
      headerKey: 'ajna.product-cards.borrow-against-your',
      icon: 'reth_circle_color',
      background: 'linear-gradient(160.26deg, #FFEAEA 5.25%, #FFF5EA 100%)',
      banner: {
        titleKey: 'ajna.product-cards.collaterals-you-can-borrow',
      },
      button: {
        link: INTERNAL_LINKS.ajnaBorrow,
        hash: 'RETH',
        labelKey: 'get-started',
      },
      labels: [
        {
          titleKey: 'ajna.product-cards.annual-variable-rates',
          value: '0.25% ↑',
        },
      ],
    },
    {
      token: 'WBTC',
      headerKey: 'ajna.product-cards.borrow-against-your',
      icon: 'btc_circle_color',
      background: 'linear-gradient(147.66deg, #FEF1E1 0%, #FDF2CA 88.25%)',
      banner: {
        titleKey: 'ajna.product-cards.collaterals-you-can-borrow',
      },
      button: {
        link: INTERNAL_LINKS.ajnaBorrow,
        hash: 'WBTC',
        labelKey: 'get-started',
      },
      labels: [
        {
          titleKey: 'ajna.product-cards.annual-variable-rates',
          value: '0.25% ↑',
        },
      ],
    },
  ],
  earn: [
    {
      token: 'USDC',
      headerKey: 'ajna.product-cards.lend-against-your',
      icon: 'ether_circle_color',
      background: 'linear-gradient(160.47deg, #F0F3FD 0.35%, #FCF0FD 99.18%), #FFFFFF',
      banner: {
        titleKey: 'ajna.product-cards.collaterals-to-earn-on',
      },
      button: {
        link: INTERNAL_LINKS.ajnaEarn,
        hash: 'USDC',
        labelKey: 'get-started',
      },
      labels: [
        {
          titleKey: 'ajna.product-cards.annual-variable-rates',
          value: '0.25% ↑',
        },
      ],
    },
  ],
  multiply: [],
}
