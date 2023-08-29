import { IOpenDepositBorrowStrategy, strategies } from '@oasisdex/dma-library'
import { getAddresses } from 'actions/aave-like/get-addresses'
import { networkIdToLibraryNetwork } from 'actions/aave-like/helpers'
import { OpenAaveDepositBorrowParameters } from 'actions/aave-like/types'
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

  const aaveLikeArgs = {
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

  const aaveLikeDeps = {
    // addresses: getTokenAddresses(networkId),
    provider: getRpcProvider(networkId),
    proxy: proxyAddress,
    user: userAddress,
    network: networkIdToLibraryNetwork(networkId),
    positionType: 'Borrow' as const,
  }

  switch (args.protocol) {
    case LendingProtocol.AaveV2:
      return await strategies.aave.borrow.v3.openDepositBorrow(aaveLikeArgs, {
        ...aaveLikeDeps,
        addresses: getAddresses(networkId, LendingProtocol.AaveV2),
      })
    case LendingProtocol.AaveV3:
    // Do stuff
    case LendingProtocol.SparkV3:
    // Do stuff
    default:
      throw new Error('Invalid protocol')
  }

  // type types = Parameters<typeof strategies.aave.v3.openDepositBorrow>
  //
  // const libArgs: types[0] = {
  //   slippage,
  //   collateralToken: {
  //     symbol: collateralToken,
  //     precision: getToken(collateralToken).precision,
  //   },
  //   debtToken: {
  //     symbol: debtToken,
  //     precision: getToken(debtToken).precision,
  //   },
  //   amountCollateralToDepositInBaseUnit: amountToWei(collateralAmount, collateralToken),
  //   amountDebtToBorrowInBaseUnit: amountToWei(borrowAmount, debtToken),
  //   entryToken: {
  //     symbol: collateralToken,
  //     precision: getToken(collateralToken).precision,
  //   },
  // }
  //
  // const deps: types[1] = {
  //   addresses: getTokenAddresses(networkId),
  //   provider: getRpcProvider(networkId),
  //   proxy: proxyAddress,
  //   user: userAddress,
  //   network: networkIdToLibraryNetwork(networkId),
  //   positionType: 'Borrow' as const,
  // }
  //
  // return await strategies.aave.v3.openDepositBorrow(libArgs, deps)
}
