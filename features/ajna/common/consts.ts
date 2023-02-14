import { AjnaFlow, AjnaProduct, AjnaStatusStep } from 'features/ajna/common/types'

// TODO: add 'earn' and 'multiply' in distant future
export const ajnaProducts: AjnaProduct[] = ['borrow', 'earn']

export const DEFAULT_SELECTED_TOKEN = 'ETH'

export const ajnaComingSoonPools = [
  'CBETH-ETH',
  'DAI-ETH',
  'DAI-RETH',
  'DAI-WBTC',
  'ETH-DAI',
  'ETH-USDC',
  'RETH-DAI',
  'RETH-ETH',
  'USDC-DAI',
  'USDC-ETH',
  'USDC-WBTC',
  'USDC-WSTETH',
  'WBTC-DAI',
  'WBTC-USDC',
  'WBTC-USDC',
  'WSTETH-ETH',
  'WSTETH-USDC',
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
