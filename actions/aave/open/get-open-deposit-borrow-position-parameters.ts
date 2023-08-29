import { IOpenDepositBorrowStrategy, strategies } from '@oasisdex/dma-library'
import { getAddresses } from 'actions/aave/get-addresses'
import { networkIdToLibraryNetwork } from 'actions/aave/helpers'
import { OpenAaveDepositBorrowParameters } from 'actions/aave/types'
import { getRpcProvider, NetworkIds } from 'blockchain/networks'
import { getToken } from 'blockchain/tokensMetadata'
import { amountToWei } from 'blockchain/utils'

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

  type types = Parameters<typeof strategies.aave.borrow.v3.openDepositBorrow>

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

  const deps: types[1] = {
    addresses: getAddresses(networkId, 'v3'),
    provider: getRpcProvider(networkId),
    proxy: proxyAddress,
    user: userAddress,
    network: networkIdToLibraryNetwork(networkId),
    positionType: 'Borrow' as const,
  }

  return await strategies.aave.borrow.v3.openDepositBorrow(libArgs, deps)
}
