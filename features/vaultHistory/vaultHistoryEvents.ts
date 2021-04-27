import BigNumber from 'bignumber.js'

interface HistoryEventBase {
  hash: string
  timestamp: string
  id: string
}

interface VaultOpenedEvent extends HistoryEventBase {
  kind: 'OPEN'
  vaultCreator: string
  cdpId: string
}

interface DepositEvent extends HistoryEventBase {
  kind: 'DEPOSIT'
  collateralAmount: BigNumber
}

interface WithdrawEvent extends HistoryEventBase {
  kind: 'WITHDRAW'
  collateralAmount: BigNumber
}

interface GenerateEvent extends HistoryEventBase {
  kind: 'GENERATE'
  daiAmount: BigNumber
}

interface PaybackEvent extends HistoryEventBase {
  kind: 'PAYBACK'
  daiAmount: BigNumber
}

interface DepositGenerateEvent extends HistoryEventBase {
  kind: 'DEPOSIT-GENERATE'
  daiAmount: BigNumber
  collateralAmount: BigNumber
}

interface WithdrawPaybackEvent extends HistoryEventBase {
  kind: 'WITHDRAW-PAYBACK'
  daiAmount: BigNumber
  collateralAmount: BigNumber
}

interface AuctionStartedEvent extends HistoryEventBase {
  kind: 'AUCTION_STARTED'
  collateralAmount: BigNumber
  daiAmount: BigNumber
  auctionId: string
}

interface AuctionStartedV2Event extends HistoryEventBase {
  kind: 'AUCTION_STARTED_V2'
  auctionId: string
  collateralAmount: BigNumber
  daiAmount: BigNumber
  liqPenalty: BigNumber
}

interface AuctionFinishedV2Event extends HistoryEventBase {
  kind: 'AUCTION_FINISHED_V2'
  auctionId: string
  remainingDebt: BigNumber
  remainingCollateral: BigNumber
}

interface TakeEvent extends HistoryEventBase {
  kind: 'TAKE'
  auctionId: string
  remainingDebt: BigNumber
  remainingCollateral: BigNumber
  collateralPrice: BigNumber
  coveredDebt: BigNumber
  collateralTaken: BigNumber
}

interface VaultTransferredEvent extends HistoryEventBase {
  kind: 'TRANSFER'
  transferFrom: string
  transferTo: string
}

interface MoveSrcEvent extends HistoryEventBase {
  kind: 'MOVE_SRC'
  transferFrom: string
  transferTo: string
  collateralAmount: BigNumber
  daiAmount: BigNumber
}

interface MoveDestEvent extends HistoryEventBase {
  kind: 'MOVE_DESC'
  transferFrom: string
  transferTo: string
  collateralAmount: BigNumber
  daiAmount: BigNumber
}

interface MigrateEvent extends HistoryEventBase {
  kind: 'MIGRATE'
}

export interface ReturnedEvent {
  kind: string
  hash: string
  timestamp: string
  id: string
  transferFrom: string | null
  transferTo: string | null
  collateralAmount: string | null
  daiAmount: string | null
  vaultCreator: string | null
  cdpId: string | null
}

export type VaultEvent =
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
  | AuctionStartedV2Event
  | TakeEvent
  | AuctionFinishedV2Event
  | MoveSrcEvent
  | MoveDestEvent

export type EventType = VaultEvent['kind']
