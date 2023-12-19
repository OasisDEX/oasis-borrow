export interface AaveProductHubItemSeed {
  collateral: string
  debt: string
  deposit?: string
  strategyType: 'long' | 'short'
  types: Array<'borrow' | 'earn' | 'multiply'>
}
