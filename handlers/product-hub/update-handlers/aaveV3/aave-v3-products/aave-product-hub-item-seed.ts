export interface AaveProductHubItemSeed {
  collateral: string
  debt: string
  deposit?: string
  strategyType: 'long' | 'short'
  group: string
  types: Array<'borrow' | 'earn' | 'multiply'>
}
