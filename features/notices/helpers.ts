import BigNumber from 'bignumber.js'
import { Web3ContractEvent } from 'blockchain/aaveLiquidations'
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
  connectedProxyAddress,
  proxyAddress,
  aaveLiquidations,
}: {
  loanToValue: BigNumber
  maxLoanToValue: BigNumber
  liquidationThreshold: BigNumber
  connectedProxyAddress?: string
  proxyAddress?: string
  aaveLiquidations?: Web3ContractEvent[]
}) {
  const isLiquidated = !!aaveLiquidations?.length
  const isAboveMaxLtv = loanToValue.gt(maxLoanToValue) && loanToValue?.lt(liquidationThreshold)
  const isOwnership = !(
    allDefined([connectedProxyAddress, proxyAddress]) && connectedProxyAddress === proxyAddress
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
