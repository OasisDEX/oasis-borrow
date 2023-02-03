export type AjnaProduct = 'borrow' | 'earn' | 'multiply'
export type AjnaFlow = 'open' | 'manage'

export type AjnaBorrowAction = 'open' | 'deposit' | 'withdraw' | 'generate' | 'payback'
export type AjnaBorrowPanel = 'collateral' | 'quote'

export type AjnaStatusStep =
  | 'risk'
  | 'setup'
  | 'manage'
  | 'proxy'
  | 'allowance-collateral'
  | 'allowance-quote'
  | 'transaction'

export type AjnaPairs = {
  [ProductKey in AjnaProduct]: {
    [key: string]: string[]
  }
}

export type AjnaPoolPairs = 'WETH-USDC' | 'WBTC-USDC'
