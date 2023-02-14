import { Context } from 'blockchain/network'

export type AjnaProduct = 'borrow' | 'earn' | 'multiply'
export type AjnaFlow = 'open' | 'manage'

export type AjnaBorrowAction = 'open' | 'deposit' | 'withdraw' | 'generate' | 'payback'
export type AjnaBorrowPanel = 'collateral' | 'quote'

export type AjnaStatusStep = 'risk' | 'setup' | 'manage' | 'dpm' | 'transaction'

export type AjnaEditingStep = Extract<AjnaStatusStep, 'setup' | 'manage'>

export type AjnaPoolPairs = keyof Context['ajnaPoolPairs']
