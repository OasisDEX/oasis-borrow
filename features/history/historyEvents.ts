interface HistoryEventBase {
  hash: string
  timestamp: string
  id: string
  vaultCreator: null
  collateralAmount: null
  daiAmount: null
  transferFrom: null
  transferTo: null
  cdpId: null
}

interface VaultOpenedEvent extends Omit<HistoryEventBase, 'vaultCreator' | 'cdpId'> {
  kind: 'OPEN'
  vaultCreator: string
  cdpId: string
}

interface DepositEvent extends Omit<HistoryEventBase, 'collateralAmount'> {
  kind: 'DEPOSIT'
  collateralAmount: string
}

interface WithdrawEvent extends Omit<HistoryEventBase, 'collateralAmount'> {
  kind: 'WITHDRAW'
  collateralAmount: string
}

interface GenerateEvent extends Omit<HistoryEventBase, 'daiAmount'> {
  kind: 'GENERATE'
  daiAmount: string
}

interface PaybackEvent extends Omit<HistoryEventBase, 'daiAmount'> {
  kind: 'PAYBACK'
  daiAmount: string
}

interface DepositGenerateEvent extends Omit<HistoryEventBase, 'daiAmount' | 'collateralAmount'> {
  kind: 'DEPOSIT-GENERATE'
  daiAmount: string
  collateralAmount: string
}

interface WithdrawPaybackEvent extends Omit<HistoryEventBase, 'daiAmount' | 'collateralAmount'> {
  kind: 'WITHDRAW-PAYBACK'
  daiAmount: string
  collateralAmount: string
}

interface AuctionStartedEvent extends Omit<HistoryEventBase, 'daiAmount' | 'collateralAmount'> {
  kind: 'AUCTION_STARTED'
  collateralAmount: string
  daiAmount: string
  // auctionId: string,
}

interface VaultTransferredEvent extends Omit<HistoryEventBase, 'transferFrom' | 'transferTo'> {
  kind: 'TRANSFER'
  transferFrom: string
  transferTo: string
}

interface MigrateEvent extends HistoryEventBase {
  kind: 'MIGRATE'
}
export type BorrowEvent =
  | VaultOpenedEvent
  | DepositEvent
  | WithdrawEvent
  | GenerateEvent
  | PaybackEvent
  | DepositGenerateEvent
  | WithdrawPaybackEvent
  | AuctionStartedEvent
  | VaultTransferredEvent
  | MigrateEvent

export type EventType = BorrowEvent['kind']
