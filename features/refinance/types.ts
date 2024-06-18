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
  Import = 'import',
  Changes = 'changes',
  Transaction = 'transaction',
}
