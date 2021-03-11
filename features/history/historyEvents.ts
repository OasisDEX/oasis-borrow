

interface HistoryEventBase {
    tx: string,
    timestamp: string
    ilk: string
    collateral: string
    id: string,
}

interface VaultOpenedEvent extends HistoryEventBase {
    type: 'vault-opened'
    owner: string,
}

interface DepositEvent extends HistoryEventBase {
    type: 'deposit'
    collateralAmount: string
    depositor: string
}

interface WithdrawEvent extends HistoryEventBase {
    type: 'withdraw'
    collateralAmount: string
}

interface ReclaimEvent extends HistoryEventBase {
    type: 'reclaim'
    collateralAmount: string
}

interface GenerateEvent extends HistoryEventBase {
    type: 'generate'
    daiAmount: string
}

interface PaybackEvent extends HistoryEventBase {
    type: 'payback'
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
    | ReclaimEvent
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
    depositor?: string // only in deposit event
}