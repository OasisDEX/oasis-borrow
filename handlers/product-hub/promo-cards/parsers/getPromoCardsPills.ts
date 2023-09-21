import BigNumber from 'bignumber.js'
import type { PromoCardVariant } from 'components/PromoCard.types'
import { formatDecimalAsPercent } from 'helpers/formatters/format'

export function getActiveManagementPill() {
  return {
    label: { key: 'product-hub.promo-cards.active-management' },
  }
}

export function getAjnaTokensPill() {
  return {
    label: { key: 'product-hub.promo-cards.get-ajna-tokens' },
    variant: 'positive' as PromoCardVariant,
  }
}

export function getAutomationEnabledPill() {
  return {
    label: { key: 'product-hub.promo-cards.automation-enabled' },
    variant: 'positive' as PromoCardVariant,
  }
}

export function getEarnStakingRewardsPill() {
  return {
    label: { key: 'product-hub.promo-cards.earn-staking-rewards' },
  }
}
export function getEnterWithToken(token: string) {
  return {
    label: { key: 'product-hub.promo-cards.enter-with-token', props: { token } },
  }
}

export function getHighestAvailableLtvPill() {
  return {
    label: { key: 'product-hub.promo-cards.highest-available-ltv' },
  }
}

export function getHighestMultiplePill() {
  return {
    label: { key: 'product-hub.promo-cards.highest-multiple' },
  }
}

export function getLongTokenPill(token: string) {
  return {
    label: { key: 'product-hub.promo-cards.long-token', props: { token } },
  }
}

export function getLowestBorrowingCostPill() {
  return {
    label: { key: 'product-hub.promo-cards.lowest-borrowing-cost' },
  }
}

export function getMaxLtvPill(maxLtv: string) {
  return {
    label: {
      key: 'product-hub.promo-cards.max-ltv',
      props: { maxLtv: formatDecimalAsPercent(new BigNumber(maxLtv)) },
    },
  }
}

export function getShortTokenPill(token: string) {
  return {
    label: { key: 'product-hub.promo-cards.short-token', props: { token } },
  }
}

export function getUpToYieldExposurePill(maxMultiple: string) {
  return {
    label: {
      key: 'product-hub.promo-cards.up-to-yield-exposure',
      props: { maxMultiple: `${parseFloat(maxMultiple).toFixed(2)}x` },
    },
  }
}
