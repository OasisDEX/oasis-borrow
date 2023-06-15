import { AAVETokens, PositionTransition, strategies } from '@oasisdex/dma-library'
import { getTokenAddresses } from 'actions/aave/get-token-addresses'
import { networkIdToLibraryNetwork } from 'actions/aave/helpers'
import { AdjustAaveParameters } from 'actions/aave/types'
import { getRpcProvider } from 'blockchain/networks'
import { ProxyType } from 'features/aave/common'
import { getOneInchCall } from 'helpers/swap'
import { LendingProtocol } from 'lendingProtocols'

export async function getAdjustPositionParameters({
  userAddress,
  proxyAddress,
  slippage,
  riskRatio,
  currentPosition,
  proxyType,
  positionType,
  protocol,
  networkId,
}: AdjustAaveParameters): Promise<PositionTransition> {
  try {
    const provider = getRpcProvider(networkId)

    const collateralToken = {
      symbol: currentPosition.collateral.symbol as AAVETokens,
      precision: currentPosition.collateral.precision,
    }

    const debtToken = {
      symbol: currentPosition.debt.symbol as AAVETokens,
      precision: currentPosition.debt.precision,
    }

    type strategyArguments = Parameters<typeof strategies.aave.v2.adjust>[0] &
      Parameters<typeof strategies.aave.v3.adjust>[0]
    type strategyDependencies = Parameters<typeof strategies.aave.v2.adjust>[1] &
      Parameters<typeof strategies.aave.v3.adjust>[1]

    const addresses = getTokenAddresses(networkId)

    const args: strategyArguments = {
      slippage,
      multiple: riskRatio,
      debtToken: debtToken,
      collateralToken: collateralToken,
      positionType,
    }

    const stratDeps: strategyDependencies = {
      addresses,
      currentPosition,
      provider: provider,
      getSwapData: getOneInchCall(addresses.swapAddress),
      proxy: proxyAddress,
      user: userAddress,
      isDPMProxy: proxyType === ProxyType.DpmProxy,
      network: networkIdToLibraryNetwork(networkId),
    }

    switch (protocol) {
      case LendingProtocol.AaveV2:
        return await strategies.aave.v2.adjust(args, stratDeps)
      case LendingProtocol.AaveV3:
        return await strategies.aave.v3.adjust(args, stratDeps)
    }
  } catch (e) {
    console.error(e)
    throw e
  }
}
