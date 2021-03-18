

interface HistoryEventBase {
    hash: string,
    timestamp: string
    id: string,
}

interface VaultOpenedEvent extends HistoryEventBase {
    type: 'OPEN'
    owner: string,
}

interface DepositEvent extends HistoryEventBase {
    type: 'DEPOSIT'
    collateralAmount: string
    depositor: string
}

interface WithdrawEvent extends HistoryEventBase {
    type: 'WITHDRAW'
    collateralAmount: string
}

interface GenerateEvent extends HistoryEventBase {
    type: 'GENERATE'
    daiAmount: string
}

interface PaybackEvent extends HistoryEventBase {
    type: 'PAYBACK'
    daiAmount: string
}

interface WithdrawGenerateEvent extends HistoryEventBase {
    type: 'WITHDRAW-GENERATE',
    daiAmount: string
}

interface WithdrawGenerateEvent extends HistoryEventBase {
    type: 'WITHDRAW-GENERATE',
    daiAmount: string
}

// interface AuctionStartedEvent extends HistoryEventBase {
//     type: 'auctionStarted'
//     auctionId: string
//     amount: string
// }

export type BorrowEvent =
    | VaultOpenedEvent
    | DepositEvent
    | WithdrawEvent
    | GenerateEvent
    | PaybackEvent

export type EventType = BorrowEvent['type']
// | 'vaultOpened'
// | 'deposit'
// | 'withdraw'
// | 'reclaim'
// | 'generate'
// | 'payback'
// | 'auctionStarted'
// | 'cdpMigrated'
// | 'cdpTransferred'

export interface BorrowEvent_ {
    id: string
    kind: EventType
    hash: string
    timestamp: string
    ilk: string
    // collateral: string
    owner?: string
    amount?: string
    collateralAmount: string | null,
    daiAmount: string | null,
    cdpId: string | null,
    depositor?: string // only in deposit event
}