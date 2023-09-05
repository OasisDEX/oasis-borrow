import {
  IOpenDepositBorrowStrategy,
  strategies,
} from '@oasisdex/dma-library'
import { getAddresses } from 'actions/aave-like/get-addresses'
import { networkIdToLibraryNetwork } from 'actions/aave-like/helpers'
import { OpenAaveDepositBorrowParameters } from 'actions/aave-like/types'
import { getRpcProvider, NetworkIds } from 'blockchain/networks'
import { getToken } from 'blockchain/tokensMetadata'
import { amountToWei } from 'blockchain/utils'
import { AaveLikeLendingProtocol, LendingProtocol } from 'lendingProtocols'

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
    protocol,
  } = args

  assertNetwork(networkId)

  const aaveLikeOpenStrategyType = {
    [LendingProtocol.AaveV2]: strategies.aave.borrow.v2,
    [LendingProtocol.AaveV3]: strategies.aave.borrow.v3,
    [LendingProtocol.SparkV3]: strategies.spark.borrow,
  }[protocol as AaveLikeLendingProtocol]

  type AaveLikeOpenStrategyArgs = Parameters<typeof aaveLikeOpenStrategyType.openDepositBorrow>[0]
  type AaveLikeOpenStrategyDeps = Parameters<typeof aaveLikeOpenStrategyType.openDepositBorrow>[1]

  const aaveLikeArgs: AaveLikeOpenStrategyArgs = {
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

  const aaveLikeDeps: Omit<AaveLikeOpenStrategyDeps, 'addresses'> = {
    provider: getRpcProvider(networkId),
    proxy: proxyAddress,
    user: userAddress,
    network: networkIdToLibraryNetwork(networkId),
    positionType: 'Borrow' as const,
  }

  switch (args.protocol) {
    case LendingProtocol.AaveV2:
      throw new Error('New Aave V2 positions are no longer supported')
    case LendingProtocol.AaveV3:
      return await strategies.aave.borrow.v3.openDepositBorrow(aaveLikeArgs, {
        ...aaveLikeDeps,
        addresses: getAddresses(networkId, LendingProtocol.AaveV3),
      })
    case LendingProtocol.SparkV3:
      return await strategies.spark.borrow.openDepositBorrow(aaveLikeArgs, {
        ...aaveLikeDeps,
        addresses: getAddresses(networkId, LendingProtocol.SparkV3),
      })
    default:
      throw new Error('Invalid protocol')
  }
}
