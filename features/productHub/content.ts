import { ajnaSparks, question_o, sparkSparks } from 'theme/icons'

export const productHubIcons = {
  question_o,
  ajnaSparks,
  sparkSparks,
}

export type ProductHubTooltipType = {
  content: {
    title?: {
      key: string
    }
    description: {
      key: string
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
  icon: 'ajnaSparks',
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
  icon: 'sparkSparks',
}

export const productHubEmptyPoolMaxLtvTooltip: ProductHubTooltipType = {
  content: {
    description: {
      key: 'ajna.product-hub-tooltips.no-max-ltv',
    },
  },
  ...questionMark,
}

export const productHubEmptyPoolMaxMultipleTooltip: ProductHubTooltipType = {
  content: {
    description: {
      key: 'ajna.product-hub-tooltips.no-max-multiple',
    },
  },
  ...questionMark,
}

export const productHubEmptyPoolWeeklyApyTooltip: ProductHubTooltipType = {
  content: {
    description: {
      key: 'ajna.product-hub-tooltips.no-weekly-apy',
    },
  },
  ...questionMark,
}

export const productHubOraclessLtvTooltip: ProductHubTooltipType = {
  content: {
    description: {
      key: 'ajna.product-hub-tooltips.oracless-ltv',
    },
  },
  ...questionMark,
}
