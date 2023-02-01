import { AjnaFlow, AjnaProduct, AjnaStatusStep } from 'features/ajna/common/types'

// TODO: add 'earn' and 'multiply' in distant future
export const products = ['borrow']

export const DEFAULT_SELECTED_TOKEN = 'ETH'

export const tokens = {
  borrow: {
    ETH: ['DAI', 'USDC', 'LINK'],
    WBTC: ['ETH', 'DAI', 'USDC', 'LINK'],
    LINK: ['USDC', 'LINK'],
  },
}

export const ajnaPairs: {
  [ProductKey in AjnaProduct]: {
    [key: string]: string[]
  }
} = {
  borrow: {
    DAI: ['ETH', 'RETH', 'WBTC'],
    ETH: ['DAI', 'USDC'],
    RETH: ['DAI', 'ETH'],
    USDC: ['DAI', 'ETH', 'WSTETH', 'WBTC'],
    WBTC: ['DAI', 'USDC'],
    WSTETH: ['USDC', 'ETH'],
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
