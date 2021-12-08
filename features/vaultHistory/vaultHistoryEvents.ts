import BigNumber from 'bignumber.js'

interface HistoryEventBase {
  hash: string
  timestamp: string
  id: string
  liquidationRatio?: BigNumber
  ethPrice: BigNumber
}

interface VaultOpenedEvent extends HistoryEventBase {
  kind: 'OPEN'
  vaultCreator: string
  cdpId: string
}

interface DepositEvent extends HistoryEventBase {
  kind: 'DEPOSIT'
  collateralAmount: BigNumber
  rate: BigNumber
  oraclePrice: BigNumber
  gasFee?: BigNumber
}

interface WithdrawEvent extends HistoryEventBase {
  kind: 'WITHDRAW'
  collateralAmount: BigNumber
  rate: BigNumber
  oraclePrice: BigNumber
  gasFee?: BigNumber
}

interface GenerateEvent extends HistoryEventBase {
  kind: 'GENERATE'
  daiAmount: BigNumber
  rate: BigNumber
  oraclePrice: BigNumber
  gasFee?: BigNumber
}

interface PaybackEvent extends HistoryEventBase {
  kind: 'PAYBACK'
  daiAmount: BigNumber
  rate: BigNumber
  oraclePrice: BigNumber
  gasFee?: BigNumber
}

interface DepositGenerateEvent extends HistoryEventBase {
  kind: 'DEPOSIT-GENERATE'
  daiAmount: BigNumber
  rate: BigNumber
  collateralAmount: BigNumber
  oraclePrice: BigNumber
  gasFee?: BigNumber
}

interface WithdrawPaybackEvent extends HistoryEventBase {
  kind: 'WITHDRAW-PAYBACK'
  daiAmount: BigNumber
  rate: BigNumber
  collateralAmount: BigNumber
  oraclePrice: BigNumber
  gasFee?: BigNumber
}

interface AuctionStartedEvent extends HistoryEventBase {
  kind: 'AUCTION_STARTED'
  collateralAmount: BigNumber
  daiAmount: BigNumber
  auctionId: string
  oraclePrice?: BigNumber
}

interface AuctionStartedV2Event extends HistoryEventBase {
  kind: 'AUCTION_STARTED_V2'
  auctionId: string
  collateralAmount: BigNumber
  daiAmount: BigNumber
  liqPenalty: BigNumber
  oraclePrice?: BigNumber
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
  oraclePrice: BigNumber
}

interface MoveDestEvent extends HistoryEventBase {
  kind: 'MOVE_DEST'
  transferFrom: string
  transferTo: string
  collateralAmount: BigNumber
  daiAmount: BigNumber
  oraclePrice: BigNumber
}

interface MigrateEvent extends HistoryEventBase {
  kind: 'MIGRATE'
}

export interface MultiplyBaseEvent {
  timestamp: string
  hash: string
  marketPrice: BigNumber
  oraclePrice: BigNumber
  ethPrice: BigNumber
  id: string

  beforeDebt: BigNumber
  debt: BigNumber

  beforeLockedCollateral: BigNumber
  lockedCollateral: BigNumber

  beforeCollateralizationRatio: BigNumber
  collateralizationRatio: BigNumber

  multiple: BigNumber
  beforeMultiple: BigNumber

  urn: string
  logIndex: number

  netValue: BigNumber

  liquidationRatio: BigNumber
  beforeLiquidationPrice: BigNumber
  liquidationPrice: BigNumber

  loanFee: BigNumber
  oazoFee: BigNumber
  totalFee: BigNumber
  gasFee: BigNumber // in wei
  rate: BigNumber
}
interface OpenMultiplyEvent extends MultiplyBaseEvent {
  kind: 'OPEN_MULTIPLY_VAULT'
  depositCollateral: BigNumber
  depositDai: BigNumber
  bought: BigNumber
}

interface IncreaseMultipleEvent extends MultiplyBaseEvent {
  kind: 'INCREASE_MULTIPLE'
  depositCollateral: BigNumber
  depositDai: BigNumber
  bought: BigNumber
}

interface DecreaseMultipleEvent extends MultiplyBaseEvent {
  kind: 'DECREASE_MULTIPLE'
  withdrawnCollateral: BigNumber
  withdrawnDai: BigNumber
  sold: BigNumber
}

interface CloseVaultExitDaiMultipleEvent extends MultiplyBaseEvent {
  kind: 'CLOSE_VAULT_TO_DAI'
  sold: BigNumber
  exitDai: BigNumber
}

interface CloseVaultExitCollateralMultipleEvent extends MultiplyBaseEvent {
  kind: 'CLOSE_VAULT_TO_COLLATERAL'
  sold: BigNumber
  exitCollateral: BigNumber
  exitDai: BigNumber
}

export type MultiplyEvent =
  | OpenMultiplyEvent
  | IncreaseMultipleEvent
  | DecreaseMultipleEvent
  | CloseVaultExitDaiMultipleEvent
  | CloseVaultExitCollateralMultipleEvent

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
  txId: string
  blockId: string
  rate: string
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
  | MultiplyEvent

export type EventType = VaultEvent['kind']
