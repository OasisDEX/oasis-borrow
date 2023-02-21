import { AjnaSimulationData, AjnaTxData } from 'actions/ajna/types'
import BigNumber from 'bignumber.js'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { Context } from 'blockchain/network'
import { Dispatch, SetStateAction } from 'react'

export type AjnaProduct = 'borrow' | 'earn' | 'multiply'
export type AjnaFlow = 'open' | 'manage'

export type AjnaBorrowAction = 'open' | 'deposit' | 'withdraw' | 'generate' | 'payback'
export type AjnaBorrowPanel = 'collateral' | 'quote'

export type AjnaEarnAction = 'open' | 'deposit' | 'withdraw'
export type AjnaEarnPanel = 'adjust' | 'deposit' | 'withdraw'

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

export type AjnaPositionSet<P> = {
  position: P
  simulation?: P
}

export type AjnaProductPosition<P> = {
  cachedPosition?: AjnaPositionSet<P>
  currentPosition: AjnaPositionSet<P>
  isSimulationLoading?: boolean
  resolvedId?: string
  setCachedPosition: Dispatch<SetStateAction<AjnaPositionSet<P> | undefined>>
  setIsLoadingSimulation: Dispatch<SetStateAction<boolean>>
  setSimulation: Dispatch<SetStateAction<AjnaSimulationData<P> | undefined>>
}

export interface OasisActionCallData extends AjnaTxData {
  kind: TxMetaKind.libraryCall
  proxyAddress: string
}

export type AjnaTxHandler = () => void

export interface AjnaFormActionsUpdateDeposit {
  type: 'update-deposit'
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
}

export interface AjnaFormActionsReset {
  type: 'reset'
}
