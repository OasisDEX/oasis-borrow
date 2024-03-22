import BigNumber from 'bignumber.js'
import type { OmniCloseTo } from 'features/omni-kit/types'
import type { ThemeUIStyleObject } from 'theme-ui'

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
  defaultToggle: true,
}

export const partialTakeProfitConstants = {
  defaultResolveTo: 'collateral' as OmniCloseTo,
  /**
   * Styles for the slider dots
   */
  wrapperSx: {
    '.rc-slider-dot': {
      backgroundColor: 'neutral70',
      borderColor: 'neutral70',
    },
    '.rc-slider-dot.rc-slider-dot-active': {
      borderColor: 'interactive50',
    },
    '.rc-slider-mark-text': {
      opacity: 0,
      bottom: '0px',
      padding: '0px 0px 0px 0px',
      transition: 'opacity 200ms, padding 200ms',
      userSelect: 'none',
      span: {
        backgroundColor: 'white',
        borderRadius: 'medium',
        boxShadow: 'medium',
        padding: '3px 7px',
        display: 'inline-block',
        userSelect: 'none',
      },
      '&:hover': {
        opacity: 1,
        padding: '0px 0px 20px 0px',
      },
    },
  } as ThemeUIStyleObject,
  startingPercentageOptionsLong: [0, 0.1, 0.2, 0.3, 0.4, 0.5] as const,
  startingPercentageOptionsShort: [0, -0.1, -0.2, -0.3, -0.4, -0.5] as const,
  defaultTriggelLtvOffset: new BigNumber(5),
  defaultWithdrawalLtv: new BigNumber(5),
  ltvSliderStep: 0.1,
  ltvSliderMin: new BigNumber(1), // 1% for both Trigger LTV and Withdrawal LTV
  realizedProfitRangeVisible: 3,
}
