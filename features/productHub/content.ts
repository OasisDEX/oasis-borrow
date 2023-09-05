const questionMark = {
  icon: 'question_o',
  iconColor: 'neutral80',
}

export const productHubAjnaRewardsTooltip = {
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

export const productHubSparkRewardsTooltip = {
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

export const productHubEmptyPoolMaxLtvTooltip = {
  content: {
    description: {
      key: 'ajna.product-hub-tooltips.no-max-ltv',
    },
  },
  ...questionMark,
}

export const productHubEmptyPoolMaxMultipleTooltip = {
  content: {
    description: {
      key: 'ajna.product-hub-tooltips.no-max-multiple',
    },
  },
  ...questionMark,
}

export const productHubEmptyPoolWeeklyApyTooltip = {
  content: {
    description: {
      key: 'ajna.product-hub-tooltips.no-weekly-apy',
    },
  },
  ...questionMark,
}

export const productHubOraclessLtvTooltip = {
  content: {
    description: {
      key: 'ajna.product-hub-tooltips.oracless-ltv',
    },
  },
  ...questionMark,
}
