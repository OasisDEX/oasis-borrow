import BigNumber from 'bignumber.js'

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
}: {
  loanToValue: BigNumber
  maxLoanToValue: BigNumber
  liquidationThreshold: BigNumber
  connectedProxyAddress?: string
  proxyAddress?: string
}) {
  const isLiquidated = false as boolean // TODO to be implemented
  const isAboveMaxLtv = loanToValue.gt(maxLoanToValue) && loanToValue?.lt(liquidationThreshold)
  const isOwnership = !(
    connectedProxyAddress !== undefined &&
    proxyAddress !== undefined &&
    connectedProxyAddress === proxyAddress
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
