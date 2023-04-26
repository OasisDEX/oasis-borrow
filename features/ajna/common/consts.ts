import BigNumber from 'bignumber.js'
import { AjnaFlow, AjnaProduct, AjnaSidebarStep } from 'features/ajna/common/types'

export const ajnaProducts: AjnaProduct[] = ['borrow', 'earn', 'multiply']

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
