import { AjnaFlow, AjnaProduct, AjnaStatusStep } from 'features/ajna/common/types'

// TODO: add 'earn' and 'multiply' in distant future
export const ajnaProducts: AjnaProduct[] = ['borrow', 'earn']

export const DEFAULT_SELECTED_TOKEN = 'ETH'

export const ajnaComingSoonPools = [
  'ETH-USDC',
  'ETH-DAI',
  'DAI-ETH',
  'DAI-RETH',
  'DAI-WBTC',
  'RETH-ETH',
  'RETH-DAI',
  'USDC-ETH',
  'USDC-WBTC',
  'USDC-DAI',
  'USDC-WSTETH',
  'WBTC-USDC',
  'WSTETH-USDC',
  'WSTETH-ETH',
  'WBTC-USDC',
  'WBTC-DAI',
]

export const steps: {
  [ProductKey in AjnaProduct]: {
    [FlowKey in AjnaFlow]: AjnaStatusStep[]
  }
} = {
  borrow: {
    open: ['risk', 'setup', 'dpm', 'transaction'],
    manage: ['manage', 'dpm', 'transaction'],
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

export const ajnaFormExternalSteps: AjnaStatusStep[] = ['dpm']
export const ajnaFormStepsWithTransaction: AjnaStatusStep[] = ['transaction']
