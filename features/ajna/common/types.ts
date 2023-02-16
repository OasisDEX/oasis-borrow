import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'

export type AjnaProduct = 'borrow' | 'earn' | 'multiply'
export type AjnaFlow = 'open' | 'manage'

export type AjnaBorrowAction = 'openBorrow' | 'depositBorrow' | 'withdrawBorrow' | 'generateBorrow' | 'paybackBorrow'
export type AjnaBorrowPanel = 'collateral' | 'quote'

export type AjnaEarnAction = 'openEarn' | 'depositEarn' | 'withdrawEarn'

export type AjnaStatusStep = 'risk' | 'setup' | 'manage' | 'dpm' | 'transaction'

export type AjnaEditingStep = Extract<AjnaStatusStep, 'setup' | 'manage'>

export type AjnaPoolPairs = keyof Context['ajnaPoolPairs']

export type AjnaPoolData = {
  [key in keyof Context['ajnaPoolPairs']]: {
    '7DayNetApy': BigNumber
    '90DayNetApy': BigNumber
    annualFee: BigNumber
    liquidityAvaliable: BigNumber
    maxMultiply: BigNumber
    maxLtv: BigNumber
    minLtv: BigNumber
    minPositionSize: BigNumber
    tvl: BigNumber
  }
}
