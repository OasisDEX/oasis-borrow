import type { ChainInfo, IPoolId, ProtocolName } from 'summerfi-sdk-common'

export enum RefinancePositionViewType {
  CURRENT = 'current',
  SIMULATION = 'simulation',
  CLOSED = 'closed',
  EMPTY = 'empty',
}

export enum RefinanceOptions {
  HIGHER_LTV = 'higherLtv',
  LOWER_COST = 'lowerCost',
  CHANGE_DIRECTION = 'changeDirection',
  SWITCH_TO_EARN = 'switchToEarn',
}

export enum RefinanceSidebarStep {
  Option = 'option',
  Strategy = 'strategy',
  Dpm = 'dpm',
  Give = 'give',
  Changes = 'changes',
  Transaction = 'transaction',
}

// Workaround for missing types in sdk-common
export enum EmodeType {
  None = 'None',
  Stablecoins = 'Stablecoins',
  ETHCorrelated = 'ETHCorrelated',
}

// Workaround for missing types in sdk-common
export interface SparkPoolId extends IPoolId {
  protocol: {
    name: ProtocolName.Spark
    chainInfo: ChainInfo
  }
  emodeType: EmodeType
}

// Workaround for missing types in sdk-common
export interface MakerPoolId extends IPoolId {
  protocol: {
    name: ProtocolName.Maker
    chainInfo: ChainInfo
  }
  ilkType: string
  vaultId: string
}
