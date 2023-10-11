export type ProtocolProduct = 'borrow' | 'earn' | 'multiply'
export type ProtocolFlow = 'open' | 'manage'
export type ProtocolSidebarStep = 'risk' | 'setup' | 'manage' | 'dpm' | 'transaction' | 'transition'

export type ProtocolSidebarEditingStep = Extract<ProtocolSidebarStep, 'setup' | 'manage'>

export type ProtocolBorrowAction =
  | 'open-borrow'
  | 'deposit-borrow'
  | 'withdraw-borrow'
  | 'generate-borrow'
  | 'payback-borrow'
  | 'switch-borrow'
  | 'close-borrow'
  | 'adjust-borrow'

export type ProtocolEarnAction = 'open-earn' | 'deposit-earn' | 'withdraw-earn' | 'claim-earn'

export type ProtocolMultiplyAction =
  | 'open-multiply'
  | 'adjust'
  | 'deposit-collateral-multiply'
  | 'deposit-quote-multiply'
  | 'generate-multiply'
  | 'payback-multiply'
  | 'withdraw-multiply'
  | 'switch-multiply'
  | 'close-multiply'

export type ProtocolFormAction = ProtocolBorrowAction | ProtocolEarnAction | ProtocolMultiplyAction

export type ProtocolPositionCloseTo = 'collateral' | 'quote'
