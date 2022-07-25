import BigNumber from 'bignumber.js'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import { StopLossTriggerData } from 'features/automation/protection/common/stopLossTriggerData'

interface HistoryEventBase {
  hash: string
  timestamp: string
  id: string
  liquidationRatio?: BigNumber
  ethPrice: BigNumber
  token: string
  reclaim?: boolean
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
  token: string
}
interface OpenMultiplyEvent extends MultiplyBaseEvent {
  kind: 'OPEN_MULTIPLY_VAULT'
  depositCollateral: BigNumber
  depositDai: BigNumber
  bought: BigNumber
}

interface OpenMultiplyGuniEvent extends MultiplyBaseEvent {
  kind: 'OPEN_MULTIPLY_GUNI_VAULT'
  depositDai: BigNumber
  depositCollateral: BigNumber
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

export interface CloseVaultExitDaiMultipleEvent extends MultiplyBaseEvent {
  kind: 'CLOSE_VAULT_TO_DAI'
  sold: BigNumber
  exitDai: BigNumber
}

interface CloseGuniVaultExitDaiMultipleEvent extends MultiplyBaseEvent {
  kind: 'CLOSE_GUNI_VAULT_TO_DAI'
  sold: BigNumber
  exitDai: BigNumber
}

export interface CloseVaultExitCollateralMultipleEvent extends MultiplyBaseEvent {
  kind: 'CLOSE_VAULT_TO_COLLATERAL'
  sold: BigNumber
  exitCollateral: BigNumber
  exitDai: BigNumber
}

interface AutomationBaseEvent {
  id: string
  triggerId: string
  hash: string
  timestamp: string
  triggerData: string
  commandAddress: string
  addTriggerData: BasicBSTriggerData | StopLossTriggerData
  removeTriggerData: BasicBSTriggerData | StopLossTriggerData
  kind: 'basic-sell' | 'basic-buy' | 'stop-loss'
  eventType: 'added' | 'updated' | 'removed'
  token: string
}

type StopLossCloseEvent = CloseVaultExitDaiMultipleEvent | CloseVaultExitCollateralMultipleEvent

type StopLossExecutedEvent = StopLossCloseEvent & {
  eventType: 'executed'
  triggerId: string
  triggerData: string
  addTriggerData: BasicBSTriggerData | StopLossTriggerData
  removeTriggerData: BasicBSTriggerData | StopLossTriggerData
}

export interface BasicBuyExecutedEvent extends IncreaseMultipleEvent {
  eventType: 'executed'
  triggerId: string
  triggerData: string
  addTriggerData: BasicBSTriggerData | StopLossTriggerData
  removeTriggerData: BasicBSTriggerData | StopLossTriggerData
}

export interface BasicSellExecutedEvent extends DecreaseMultipleEvent {
  eventType: 'executed'
  triggerId: string
  triggerData: string
  addTriggerData: BasicBSTriggerData | StopLossTriggerData
  removeTriggerData: BasicBSTriggerData | StopLossTriggerData
}

export type MultiplyEvent =
  | OpenMultiplyEvent
  | OpenMultiplyGuniEvent
  | IncreaseMultipleEvent
  | DecreaseMultipleEvent
  | CloseVaultExitDaiMultipleEvent
  | CloseGuniVaultExitDaiMultipleEvent
  | CloseVaultExitCollateralMultipleEvent

export type AutomationEvent =
  | StopLossExecutedEvent
  | BasicBuyExecutedEvent
  | BasicSellExecutedEvent
  | AutomationBaseEvent

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
  urn: string
}

export interface ReturnedAutomationEvent {
  id: string
  triggerId: string
  cdpId: string | null
  hash: string
  number: string
  timestamp: string
  eventType: string
  commandAddress: string | null
  kind: string
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
  | AutomationEvent

export type EventType = VaultEvent['kind']
