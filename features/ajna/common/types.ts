import { AjnaSimulationData } from 'actions/ajna'
import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import { ValidationMessagesInput } from 'components/ValidationMessages'
import { Dispatch, SetStateAction } from 'react'

export type AjnaProduct = 'borrow' | 'earn' | 'multiply'
export type AjnaFlow = 'open' | 'manage'

export type AjnaBorrowAction = 'open' | 'deposit' | 'withdraw' | 'generate' | 'payback'
export type AjnaBorrowPanel = 'collateral' | 'quote'

export type AjnaEarnAction = 'openEarn' | 'depositEarn' | 'withdrawEarn'

export type AjnaSidebarStep = 'risk' | 'setup' | 'manage' | 'dpm' | 'transaction'
export type AjnaSidebarEditingStep = Extract<AjnaSidebarStep, 'setup' | 'manage'>

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

export interface AjnaPositionSet<P> {
  position: P
  simulation?: P
}

export interface AjnaProductPosition<P> {
  cachedPosition?: AjnaPositionSet<P>
  currentPosition: AjnaPositionSet<P>
  isSimulationLoading?: boolean
  resolvedId?: string
  setCachedPosition: Dispatch<SetStateAction<AjnaPositionSet<P> | undefined>>
  setIsLoadingSimulation: Dispatch<SetStateAction<boolean>>
  setSimulation: Dispatch<SetStateAction<AjnaSimulationData<P> | undefined>>
}

export interface AjnaProductValidation {
  validation: {
    errors: ValidationMessagesInput
    isFormValid: boolean
    warnings: ValidationMessagesInput
  }
}
