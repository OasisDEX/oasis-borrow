export interface MakerDiscoverPositionsIlk {
  id: string
  ilk: string
  liquidationRatio: string
  pip: {
    value: string
  }
  rate: string
  stabilityFee: string
  tokenSymbol: string
}

export interface MakerDiscoverPositionsTrigger {
  commandAddress: string
  executedBlock: string
  removedBlock: string
  triggerData: string
  triggerType: string
}

export interface MakerDiscoverPositionsResponse {
  cdps: {
    cdp: string
    collateral: string
    cumulativeDepositUSD: string
    cumulativeFeesUSD: string
    cumulativeWithdrawnUSD: string
    ilk: MakerDiscoverPositionsIlk
    liquidationPrice: string
    normalizedDebt: string
    openedAt: string
    triggers: MakerDiscoverPositionsTrigger[]
    type: string
    creator: string // dsProxy
  }[]
}

export interface MakerOsmResponse {
  osm: {
    value: string
  }
}

export interface MakerHistoryOldItem {
  kind: string
  collateralBefore: string
  collateralAfter: string
  collateralDiff: string
  debtBefore: string
  debtAfter: string
  debtDiff: string
  normalizedDebtBefore: string
  normalizedDebtAfter: string
  normalizedDebtDiff: string
  beforeMultiple: string
  afterMultiple: string
  liquidationPriceBefore: string
  liquidationPriceAfter: string
  collRatioBefore: string
  collRatioAfter: string
  rate: string
  oraclePrice: string
  multipleDiff: string
  collRatioDiff: string
  oazoFee: string
  loadFee: string
  gasFee: string
  totalFee: string
  netValue: string
  marketPrice: string
  collateralMarketPrice: string
  logIndex: string
  tab: string
  flip: string
  bought: string
  sold: string
  depositCollateral: string
  depositDai: string
  withdrawnCollateral: string
  withdrawnDai: string
  exitCollateral: string
  exitDai: string
  debt: string
  lockedCollateral: string
  block: string
  timestamp: string
  transaction: string
}

export interface MakerHistoryOldResponse {
  cdps: {
    stateLogs: MakerHistoryOldItem[]
  }[]
}

export interface MakerTriggersOldResponse {
  cdps: {
    triggers: {
      id: number
      commandAddress: string
      triggerData: string
    }[]
  }[]
}
