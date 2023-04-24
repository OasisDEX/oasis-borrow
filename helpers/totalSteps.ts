export function getTotalStepsForOpenVaultFlow({
  token,
  proxyAddress,
  hasAllowance,
  withProxyStep,
  withAllowanceStep,
  withStopLossStep,
  openingEmptyVault,
}: {
  token: string
  proxyAddress?: string
  hasAllowance: boolean
  withProxyStep: boolean
  withAllowanceStep: boolean
  withStopLossStep: boolean
  openingEmptyVault: boolean
}) {
  const isEthToken = token === 'ETH'

  if (openingEmptyVault) {
    return withProxyStep ? 3 : proxyAddress ? 2 : 3
  }

  const stepsWithSlAndWithOtherToken =
    (!proxyAddress && !hasAllowance) || withProxyStep
      ? 5
      : !hasAllowance || withAllowanceStep
      ? 4
      : 3

  const stepsWithoutSlAndWithOtherToken =
    (!proxyAddress && !hasAllowance) || withProxyStep
      ? 4
      : !hasAllowance || withAllowanceStep
      ? 3
      : 2

  const stepsWithSlAndWithETH = !proxyAddress || withProxyStep ? 4 : 3

  const stepsWithoutSlAndWithETH = !proxyAddress || withProxyStep ? 3 : 2

  return withStopLossStep && isEthToken
    ? stepsWithSlAndWithETH
    : !withStopLossStep && isEthToken
    ? stepsWithoutSlAndWithETH
    : withStopLossStep && !isEthToken
    ? stepsWithSlAndWithOtherToken
    : stepsWithoutSlAndWithOtherToken
}
