import BigNumber from 'bignumber.js'
import { Web3ContractEvent } from 'blockchain/aaveV2Liquidations'
import { allDefined } from 'helpers/allDefined'

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
  aaveLiquidations?: Web3ContractEvent[]
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
