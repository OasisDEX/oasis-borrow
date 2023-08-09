import { AAVETokens, PositionTransition, strategies } from '@oasisdex/dma-library'
import { getTokenAddresses } from 'actions/aave/get-token-addresses'
import { networkIdToLibraryNetwork, swapCall } from 'actions/aave/helpers'
import { CloseAaveParameters } from 'actions/aave/types'
import { getRpcProvider } from 'blockchain/networks'
import { ProxyType } from 'features/aave/types'
import { LendingProtocol } from 'lendingProtocols'

export async function getCloseAaveParameters({
  proxyAddress,
  userAddress,
  slippage,
  currentPosition,
  proxyType,
  shouldCloseToCollateral,
  protocol,
  networkId,
  positionType,
}: CloseAaveParameters): Promise<PositionTransition> {
  const collateralToken = {
    symbol: currentPosition.collateral.symbol as AAVETokens,
    precision: currentPosition.collateral.precision,
  }

  const debtToken = {
    symbol: currentPosition.debt.symbol as AAVETokens,
    precision: currentPosition.debt.precision,
  }

  const addresses = getTokenAddresses(networkId)

  type closeParameters =
    | Parameters<typeof strategies.aave.v2.close>
    | Parameters<typeof strategies.aave.v3.close>
  const stratArgs: closeParameters[0] = {
    slippage,
    debtToken,
    collateralToken,
    positionType,
    shouldCloseToCollateral,
  }

  const stratDeps: closeParameters[1] = {
    addresses,
    currentPosition,
    provider: getRpcProvider(networkId),
    getSwapData: swapCall(addresses, networkId),
    proxy: proxyAddress,
    user: userAddress,
    isDPMProxy: proxyType === ProxyType.DpmProxy,
    network: networkIdToLibraryNetwork(networkId),
  }

  switch (protocol) {
    case LendingProtocol.AaveV2:
      return strategies.aave.v2.close(stratArgs, stratDeps)
    case LendingProtocol.AaveV3:
      return strategies.aave.v3.close(stratArgs, stratDeps)
  }
}
