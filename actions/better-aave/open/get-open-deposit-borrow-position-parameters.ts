import { ISimplePositionTransition } from '@oasisdex/dma-library'
import { strategies } from '@oasisdex/oasis-actions'
import { getTokenAddresses } from 'actions/aave/getTokenAddresses'
import { OpenAaveDepositBorrowParameters } from 'actions/better-aave/types'
import { getNetworkContracts } from 'blockchain/contracts'
import { getRpcProvider, NetworkIds } from 'blockchain/networks'
import { getToken } from 'blockchain/tokensMetadata'
import { amountToWei } from 'blockchain/utils'
import { ProxyType } from 'features/aave/common'
import { getOneInchCall } from 'helpers/swap'

function assertNetwork(networkId: NetworkIds): asserts networkId is NetworkIds.MAINNET {
  if (networkId !== NetworkIds.MAINNET) {
    throw new Error('Open simple borrow position works only on Ethereum Mainnet')
  }
}
export async function getOpenDepositBorrowPositionParameters(
  args: OpenAaveDepositBorrowParameters,
): Promise<ISimplePositionTransition> {
  const {
    collateralToken,
    debtToken,
    slippage,
    collateralAmount,
    borrowAmount,
    proxyAddress,
    userAddress,
    proxyType,
    networkId,
  } = args

  assertNetwork(networkId)

  const libArgs = {
    slippage,
    collateralToken: {
      symbol: collateralToken,
      precision: getToken(collateralToken).precision,
    },
    debtToken: {
      symbol: debtToken,
      precision: getToken(debtToken).precision,
    },
    amountCollateralToDepositInBaseUnit: amountToWei(collateralAmount, collateralToken),
    amountDebtToBorrowInBaseUnit: amountToWei(borrowAmount, debtToken),
    positionType: 'Borrow' as const,
  }

  const deps = {
    addresses: getTokenAddresses(networkId),
    provider: getRpcProvider(networkId),
    getSwapData: getOneInchCall(getNetworkContracts(networkId).swapAddress),
    proxy: proxyAddress,
    user: userAddress,
    isDPMProxy: proxyType === ProxyType.DpmProxy,
    proxyAddress,
  }

  return await strategies.aave.v2.openDepositAndBorrowDebt(libArgs, deps)
}
