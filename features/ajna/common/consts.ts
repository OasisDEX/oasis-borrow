import BigNumber from 'bignumber.js'
import { AjnaFlow, AjnaProduct, AjnaSidebarStep } from 'features/ajna/common/types'

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

export const ajnaLastIndexBucketPrice = new BigNumber(99836282890)

// safe defaults which should ensure reasonable slider range for newly created pools
export const ajnaDefaultPoolRangeMarketPriceOffset = 0.99 // 99%
