import { ISimplePositionTransition, Network } from '@oasisdex/dma-library'
import { strategies } from '@oasisdex/dma-library'
import { getTokenAddresses } from 'actions/aave/get-token-addresses'
import { OpenAaveDepositBorrowParameters } from 'actions/aave/types'
import { getRpcProvider, NetworkIds } from 'blockchain/networks'
import { getToken } from 'blockchain/tokensMetadata'
import { amountToWei } from 'blockchain/utils'
import { ProxyType } from 'features/aave/common'

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

  type types = Parameters<typeof strategies.aave.v2.openDepositAndBorrowDebt>

  const libArgs: types[0] = {
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

  const deps: types[1] = {
    addresses: getTokenAddresses(networkId),
    provider: getRpcProvider(networkId),
    proxy: proxyAddress,
    user: userAddress,
    isDPMProxy: proxyType === ProxyType.DpmProxy,
    network: 'mainnet' as Network,
  }

  return await strategies.aave.v2.openDepositAndBorrowDebt(libArgs, deps)
}
