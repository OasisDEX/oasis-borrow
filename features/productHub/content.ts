import { question_o, sparks } from 'theme/icons'

export const productHubIcons = {
  question_o,
  sparks,
}

export type ProductHubTooltipType = {
  content: {
    title?: {
      key: string
      props?: {
        [key: string]: string
      }
    }
    description: {
      key: string
      props?: {
        [key: string]: string
      }
    }
  }
  icon: keyof typeof productHubIcons
  iconColor?: string
}

const questionMark: {
  icon: ProductHubTooltipType['icon']
  iconColor?: ProductHubTooltipType['iconColor']
} = {
  icon: 'question_o',
  iconColor: 'neutral80',
}

export const productHubAjnaRewardsTooltip: ProductHubTooltipType = {
  content: {
    title: {
      key: 'ajna.product-hub-tooltips.this-pool-is-earning-ajna-tokens',
    },
    description: {
      key: 'ajna.product-hub-tooltips.rewards-available-soon',
    },
  },
  icon: 'sparks',
}

export const productHubSparkRewardsTooltip: ProductHubTooltipType = {
  content: {
    title: {
      key: 'spark.product-hub-tooltips.elligible-for-spk-airdrop',
    },
    description: {
      key: 'spark.product-hub-tooltips.elligible-for-spk-airdrop-description',
    },
  },
  icon: 'sparks',
}

export const productHubWeETHRewardsTooltip: ProductHubTooltipType = {
  content: {
    description: {
      key: 'aave-like.product-hub-tooltips.double-etherfi-points',
    },
  },
  icon: 'sparks',
}

export const productHubAjnaEmptyPoolMaxLtvTooltip: ProductHubTooltipType = {
  content: {
    description: {
      key: 'ajna.product-hub-tooltips.no-max-ltv',
    },
  },
  ...questionMark,
}

export const productHubAjnaEmptyPoolMaxMultipleTooltip: ProductHubTooltipType = {
  content: {
    description: {
      key: 'ajna.product-hub-tooltips.no-max-multiple',
    },
  },
  ...questionMark,
}

export const productHubAjnaEmptyPoolWeeklyApyTooltip: ProductHubTooltipType = {
  content: {
    description: {
      key: 'ajna.product-hub-tooltips.no-weekly-apy',
    },
  },
  ...questionMark,
}

export const productHubAjnaOraclessLtvTooltip: ProductHubTooltipType = {
  content: {
    description: {
      key: 'ajna.product-hub-tooltips.oracless-ltv',
    },
  },
  ...questionMark,
}
