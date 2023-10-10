import BigNumber from 'bignumber.js'
import type { AjnaFlow, AjnaProduct, AjnaSidebarStep } from 'features/ajna/common/types'

export const ajnaProducts: AjnaProduct[] = ['borrow', 'earn', 'multiply']

export const steps: {
  [ProductKey in AjnaProduct]: {
    [FlowKey in AjnaFlow]: AjnaSidebarStep[]
  }
} = {
  borrow: {
    open: ['risk', 'setup', 'dpm', 'transaction'],
    manage: ['manage', 'dpm', 'transaction', 'transition'],
  },
  earn: {
    open: ['risk', 'setup', 'dpm', 'transaction'],
    manage: ['manage', 'dpm', 'transaction', 'transition'],
  },
  multiply: {
    open: ['risk', 'setup', 'dpm', 'transaction'],
    manage: ['manage', 'dpm', 'transaction'],
  },
}

export const ajnaFormExternalSteps: AjnaSidebarStep[] = ['dpm']
export const ajnaFormStepsWithTransaction: AjnaSidebarStep[] = ['transaction']

export const LTVWarningThreshold = new BigNumber(0.05)
export const LUPPercentageOffset = new BigNumber(0.05)

export const ajnaLastIndexBucketPrice = new BigNumber(99836282890)

// safe defaults which should ensure reasonable slider range for newly created pools
export const ajnaDefaultPoolRangeMarketPriceOffset = 0.99 // 99%

export const AJNA_POOLS_WITH_YIELD_LOOP = ['CBETH-ETH', 'RETH-ETH', 'WSTETH-ETH']
export const AJNA_POOLS_WITH_REWARDS = [
  'CBETH-ETH',
  'ETH-USDC',
  'RETH-DAI',
  'RETH-ETH',
  'SDAI-USDC',
  'USDC-ETH',
  'USDC-WBTC',
  'WBTC-DAI',
  'WBTC-USDC',
  'WSTETH-DAI',
  'WSTETH-ETH',
  'WSTETH-USDC',
  'YFI-DAI',
  'YIELDBTC-WBTC',
  'YIELDETH-ETH',
]
export const AJNA_SHORT_POSITION_COLLATERALS = ['DAI', 'USDC']
export const AJNA_TOKENS_WITH_MULTIPLY = [
  'CBETH',
  'DAI',
  'ETH',
  'ETH',
  'GHO',
  'RETH',
  'SDAI',
  'USDC',
  'WBTC',
  'WSTETH',
  'YFI',
]

export const AJNA_BORROWISH_PRODUCTS: AjnaProduct[] = ['borrow', 'multiply']
