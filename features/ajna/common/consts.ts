import { getToken } from 'blockchain/tokensMetadata'
import { AjnaFlow, AjnaProduct, AjnaStatusStep } from 'features/ajna/common/types'

// TODO: add 'earn' and 'multiply' in distant future
export const products = ['borrow']

export const tokens = {
  borrow: {
    ETH: ['DAI', 'USDC', 'LINK'],
    WBTC: ['ETH', 'DAI', 'USDC', 'LINK'],
    LINK: ['USDC', 'LINK'],
  },
}

export const ajnaTokens = {
  aave: { value: 'AAVE', label: 'AAVE', icon: getToken('AAVE').iconCircle },
  eth: { value: 'ETH', label: 'ETH', icon: getToken('ETH').iconCircle },
  link: { value: 'LINK', label: 'LINK', icon: getToken('LINK').iconCircle },
  mana: { value: 'MANA', label: 'MANA', icon: getToken('MANA').iconCircle },
  matic: { value: 'MATIC', label: 'MATIC', icon: getToken('MATIC').iconCircle },
  renbtc: { value: 'renBTC', label: 'renBTC', icon: getToken('RENBTC').iconCircle },
  wbtc: { value: 'WBTC', label: 'WBTC', icon: getToken('WBTC').iconCircle },
  yfi: { value: 'YFI', label: 'YFI', icon: getToken('YFI').iconCircle },
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
