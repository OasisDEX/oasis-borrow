import type BigNumber from 'bignumber.js'
import { allDefined } from 'helpers/allDefined'
import type { LiquidationCallEvent as AaveLiquidationCallEventV2 } from 'types/ethers-contracts/AaveV2LendingPool'
import type { LiquidationCallEvent as AaveLiquidationCallEventV3 } from 'types/ethers-contracts/AaveV3Pool'
import type { LiquidationCallEvent as SparkLiquidationCallEventV3 } from 'types/ethers-contracts/SparkV3Pool'

export function getLiquidatedHeaderNotice(isPositionController: boolean) {
  return isPositionController
    ? 'vault-notices.liquidated.header1'
    : 'vault-notices.liquidated.header2'
}

export function getAaveNoticeBanner({
  loanToValue,
  maxLoanToValue,
  liquidationThreshold,

  aaveLiquidations,
  ownerAddress,
  connectedAddress,
}: {
  loanToValue: BigNumber
  maxLoanToValue: BigNumber
  liquidationThreshold: BigNumber
  connectedProxyAddress?: string
  aaveLiquidations?:
    | AaveLiquidationCallEventV3[]
    | AaveLiquidationCallEventV2[]
    | SparkLiquidationCallEventV3[]
  ownerAddress: string
  connectedAddress?: string
}) {
  const isLiquidated = !!aaveLiquidations?.length
  const isAboveMaxLtv = loanToValue.gt(maxLoanToValue) && loanToValue?.lt(liquidationThreshold)
  const isOwnership = !(
    allDefined(connectedAddress, ownerAddress) && connectedAddress === ownerAddress
  )

  switch (true) {
    case isLiquidated:
      return 'liquidated'
    case isAboveMaxLtv:
      return 'aboveMaxLtv'
    case isOwnership:
      return 'ownership'
    default:
      return undefined
  }
}
