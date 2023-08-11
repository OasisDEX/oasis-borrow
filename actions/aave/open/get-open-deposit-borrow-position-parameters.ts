import { IOpenDepositBorrowStrategy, strategies } from '@oasisdex/dma-library'
import { getTokenAddresses } from 'actions/aave/get-token-addresses'
import { networkIdToLibraryNetwork } from 'actions/aave/helpers'
import { OpenAaveDepositBorrowParameters } from 'actions/aave/types'
import { getOnChainPosition } from 'actions/aave/view'
import { getRpcProvider, NetworkIds } from 'blockchain/networks'
import { getToken } from 'blockchain/tokensMetadata'
import { amountToWei } from 'blockchain/utils'
import { LendingProtocol } from 'lendingProtocols'

function assertNetwork(networkId: NetworkIds): asserts networkId is NetworkIds.MAINNET {
  if (networkId !== NetworkIds.MAINNET) {
    throw new Error('Open simple borrow position works only on Ethereum Mainnet')
  }
}
export async function getOpenDepositBorrowPositionParameters(
  args: OpenAaveDepositBorrowParameters,
): Promise<IOpenDepositBorrowStrategy> {
  const {
    collateralToken,
    debtToken,
    slippage,
    collateralAmount,
    borrowAmount,
    proxyAddress,
    userAddress,
    networkId,
  } = args

  assertNetwork(networkId)

  type types = Parameters<typeof strategies.aave.v3.openDepositBorrow>

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
    entryToken: {
      symbol: collateralToken,
      precision: getToken(collateralToken).precision,
    },
  }

  const onChainPosition = await getOnChainPosition({
    networkId,
    proxyAddress,
    collateralToken,
    debtToken,
    protocol: LendingProtocol.AaveV3,
  })

  const deps: types[1] = {
    addresses: getTokenAddresses(networkId),
    provider: getRpcProvider(networkId),
    proxy: proxyAddress,
    user: userAddress,
    network: networkIdToLibraryNetwork(networkId),
    positionType: 'Borrow' as const,
    currentPosition: onChainPosition,
  }

  return await strategies.aave.v3.openDepositBorrow(libArgs, deps)
}
