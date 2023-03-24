import BigNumber from 'bignumber.js'
import { allDefined } from 'helpers/allDefined'
import { LiquidationCallEvent as LiquidationCallEventV2 } from 'types/ethers-contracts/AaveV2LendingPool'
import { LiquidationCallEvent as LiquidationCallEventV3 } from 'types/ethers-contracts/AaveV3Pool'

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
  aaveLiquidations?: LiquidationCallEventV3[] | LiquidationCallEventV2[]
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
