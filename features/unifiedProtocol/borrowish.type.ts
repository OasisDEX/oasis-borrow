import type { Address, IRiskRatio } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'

// TODO to be moved to dma-library eventually
export interface BorrowishPosition {
  owner: Address
  collateralAmount: BigNumber
  debtAmount: BigNumber

  marketPrice: BigNumber
  liquidationPrice: BigNumber
  liquidationToMarketPrice: BigNumber
  thresholdPrice: BigNumber

  collateralAvailable: BigNumber
  riskRatio: IRiskRatio
  maxRiskRatio: IRiskRatio
  minRiskRatio: IRiskRatio

  borrowRate: BigNumber
  netValue: BigNumber
  buyingPower: BigNumber

  debtAvailable(collateralAmount: BigNumber): BigNumber

  deposit(amount: BigNumber): BorrowishPosition

  withdraw(amount: BigNumber): BorrowishPosition

  borrow(amount: BigNumber): BorrowishPosition

  payback(amount: BigNumber): BorrowishPosition
}
