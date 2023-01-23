import { AjnaStatusStep } from 'features/ajna/common/types'

// TODO: add 'earn' and 'multiply' in distant future
export const products = ['borrow']

export const tokens = {
  borrow: {
    ETH: ['DAI', 'USDC', 'LINK'],
    WBTC: ['ETH', 'DAI', 'USDC', 'LINK'],
    LINK: ['USDC', 'LINK'],
  },
}

export const externalSteps: AjnaStatusStep[] = [
  'allowance-collateral',
  'allowance-collateral',
  'proxy',
]
