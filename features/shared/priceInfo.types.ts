import type { BigNumber } from 'bignumber.js'

export interface PriceInfo {
  currentCollateralPrice: BigNumber
  currentEthPrice: BigNumber
  nextCollateralPrice: BigNumber
  nextEthPrice: BigNumber

  dateLastCollateralPrice?: Date
  dateNextCollateralPrice?: Date
  dateLastEthPrice?: Date
  dateNextEthPrice?: Date

  isStaticCollateralPrice: boolean
  isStaticEthPrice: boolean

  collateralPricePercentageChange: BigNumber
  ethPricePercentageChange: BigNumber
}

export interface PriceInfoChange {
  kind: 'priceInfo'
  priceInfo: PriceInfo
}
