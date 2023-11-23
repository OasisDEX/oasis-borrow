import type BigNumber from 'bignumber.js'

export const areEarnPricesEqual = (positionPrice: BigNumber, newPrice?: BigNumber) =>
  newPrice?.eq(positionPrice)
