import { AjnaFlow, AjnaPairs, AjnaProduct, AjnaStatusStep } from 'features/ajna/common/types'

// TODO: add 'earn' and 'multiply' in distant future
export const ajnaProducts: AjnaProduct[] = ['borrow']

export const DEFAULT_SELECTED_TOKEN = 'ETH'

export const ajnaPairs: AjnaPairs = {
  borrow: {
    ETH: ['USDC'],
    RETH: ['ETH'],
    USDC: ['ETH', 'WBTC'],
    WBTC: ['USDC'],
    WSTETH: ['USDC', 'ETH'],
  },
  multiply: {},
  earn: {},
}
export const ajnaComingSoonPairs: AjnaPairs = {
  borrow: {
    DAI: ['ETH', 'RETH', 'WBTC'],
    ETH: ['DAI'],
    RETH: ['DAI'],
    USDC: ['DAI', 'WSTETH'],
    WBTC: ['DAI'],
  },
  multiply: {},
  earn: {},
}

export const steps: {
  [ProductKey in AjnaProduct]: {
    [FlowKey in AjnaFlow]: AjnaStatusStep[]
  }
} = {
  borrow: {
    open: ['risk', 'setup', 'transaction'],
    manage: ['manage', 'transaction'],
  },
  multiply: {
    open: [],
    manage: [],
  },
  earn: {
    open: [],
    manage: [],
  },
}

export const ajnaFormExternalSteps: AjnaStatusStep[] = [
  'allowance-collateral',
  'allowance-quote',
  'proxy',
]

export const ajnaFormStepsWithBack: AjnaStatusStep[] = ['transaction']
export const ajnaFormStepsWithTransaction: AjnaStatusStep[] = ['transaction']
