import BigNumber from 'bignumber.js'
import type { OmniCloseTo } from 'features/omni-kit/types'

export const stopLossConstants = {
  sliderStep: 0.1 / 100, // thats 0.1% step - because we're handling ltv in percents as 50% = 0.5
  defaultResolveTo: 'collateral' as OmniCloseTo,
  offsets: {
    min: new BigNumber(0.01),
    max: new BigNumber(0.025),
  },
}

export const trailingStopLossConstants = {
  defaultResolveTo: 'collateral' as OmniCloseTo,
}

export const autoBuySellConstants = {
  defaultGasFee: 300,
}
