import BigNumber from 'bignumber.js'

export const areEarnPricesEqual = (positionPrice: BigNumber, newPrice?: BigNumber) =>
  newPrice?.decimalPlaces(2).eq(positionPrice.decimalPlaces(2))
