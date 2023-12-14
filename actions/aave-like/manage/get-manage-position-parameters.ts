import type { IStrategy } from '@oasisdex/dma-library'
import { strategies } from '@oasisdex/dma-library'
import { getAddresses } from 'actions/aave-like/get-addresses'
import { getCurrentPositionLibCallData, networkIdToLibraryNetwork } from 'actions/aave-like/helpers'
import type { ManageAaveParameters } from 'actions/aave-like/types'
import type BigNumber from 'bignumber.js'
import { getRpcProvider } from 'blockchain/networks'
import { amountToWei } from 'blockchain/utils'
import { ManageCollateralActionsEnum, ManageDebtActionsEnum } from 'features/aave'
import { zero } from 'helpers/zero'
import type { AaveLendingProtocol } from 'lendingProtocols'
import { LendingProtocol } from 'lendingProtocols'

function getTokensInBaseUnit({
  manageTokenInput,
  currentPosition,
}: ManageAaveParameters): [BigNumber, BigNumber] {
  if (!manageTokenInput?.manageAction) {
    return [zero, zero]
  }

  let collateralInBaseUnit, debtInBaseUnit

  switch (manageTokenInput.manageAction) {
    case ManageCollateralActionsEnum.WITHDRAW_COLLATERAL:
    case ManageCollateralActionsEnum.DEPOSIT_COLLATERAL:
      collateralInBaseUnit = amountToWei(
        manageTokenInput?.manageInput1Value || zero,
        currentPosition.collateral.symbol,
      )
      debtInBaseUnit = amountToWei(
        manageTokenInput?.manageInput2Value || zero,
        currentPosition.debt.symbol,
      )
      break

    case ManageDebtActionsEnum.BORROW_DEBT:
    case ManageDebtActionsEnum.PAYBACK_DEBT:
      collateralInBaseUnit = amountToWei(
        manageTokenInput?.manageInput2Value || zero,
        currentPosition.collateral.symbol,
      )
      debtInBaseUnit = amountToWei(
        manageTokenInput?.manageInput1Value || zero,
        currentPosition.debt.symbol,
      )
      break

    default:
      throw Error('Unsupported manageAction')
  }

  return [collateralInBaseUnit, debtInBaseUnit]
}

export async function getManagePositionParameters(
  parameters: ManageAaveParameters,
): Promise<IStrategy> {
  const {
    proxyAddress,
    userAddress,
    networkId,
    slippage,
    currentPosition,
    manageTokenInput,
    protocol,
  } = parameters

  const provider = getRpcProvider(networkId)

  const [collateral, debt] = getTokensInBaseUnit(parameters)
  const [collateralToken, debtToken] = getCurrentPositionLibCallData(currentPosition)

  const aaveLikeBorrowStrategyType = {
    [LendingProtocol.AaveV2]: strategies.aave.borrow.v2,
    [LendingProtocol.AaveV3]: strategies.aave.borrow.v3,
    [LendingProtocol.SparkV3]: strategies.spark.borrow,
  }[protocol as AaveLendingProtocol]

  switch (manageTokenInput?.manageAction) {
    case ManageDebtActionsEnum.PAYBACK_DEBT:
    case ManageCollateralActionsEnum.WITHDRAW_COLLATERAL:
      type AaveLikePaybackWithdrawStrategyArgs = Parameters<
        typeof aaveLikeBorrowStrategyType.paybackWithdraw
      >[0]
      type AaveLikePaybackWithdrawStrategyDeps = Parameters<
        typeof aaveLikeBorrowStrategyType.paybackWithdraw
      >[1]

      const paybackWithdrawStratArgs: AaveLikePaybackWithdrawStrategyArgs = {
        slippage,
        debtToken,
        collateralToken,
        amountDebtToPaybackInBaseUnit: debt,
        amountCollateralToWithdrawInBaseUnit: collateral,
      }

      const paybackWithdrawStratDeps: Omit<
        AaveLikePaybackWithdrawStrategyDeps,
        'addresses' | 'protocolType'
      > = {
        currentPosition,
        provider: provider,
        proxy: proxyAddress,
        user: userAddress,
        network: networkIdToLibraryNetwork(networkId),
      }

      if (protocol === LendingProtocol.AaveV2) {
        const addressesV2 = getAddresses(networkId, LendingProtocol.AaveV2)
        return await strategies.aave.borrow.v2.paybackWithdraw(paybackWithdrawStratArgs, {
          ...paybackWithdrawStratDeps,
          addresses: addressesV2,
        })
      }

      if (protocol === LendingProtocol.AaveV3) {
        const addressesV3 = getAddresses(networkId, LendingProtocol.AaveV3)
        return await strategies.aave.borrow.v3.paybackWithdraw(paybackWithdrawStratArgs, {
          ...paybackWithdrawStratDeps,
          addresses: addressesV3,
        })
      }

      if (protocol === LendingProtocol.SparkV3) {
        const addressesV3 = getAddresses(networkId, LendingProtocol.SparkV3)
        return await strategies.spark.borrow.paybackWithdraw(paybackWithdrawStratArgs, {
          ...paybackWithdrawStratDeps,
          addresses: addressesV3,
        })
      }

      throw new Error(
        `Unsupported protocol ${protocol} for action ${manageTokenInput?.manageAction}`,
      )

    case ManageDebtActionsEnum.BORROW_DEBT:
    case ManageCollateralActionsEnum.DEPOSIT_COLLATERAL:
      type AaveLikeDepositBorrowStrategyArgs = Parameters<
        typeof aaveLikeBorrowStrategyType.depositBorrow
      >[0]
      type AaveLikeDepositBorrowStrategyDeps = Parameters<
        typeof aaveLikeBorrowStrategyType.depositBorrow
      >[1]

      const borrowDepositStratArgs: AaveLikeDepositBorrowStrategyArgs = {
        slippage,
        debtToken,
        collateralToken,
        amountDebtToBorrowInBaseUnit: debt,
        amountCollateralToDepositInBaseUnit: collateral,
        entryToken: collateralToken,
      }

      const borrowDepositStratDeps: Omit<AaveLikeDepositBorrowStrategyDeps, 'addresses'> = {
        currentPosition,
        provider: provider,
        proxy: proxyAddress,
        user: userAddress,
        network: networkIdToLibraryNetwork(networkId),
      }
      if (protocol === LendingProtocol.AaveV2) {
        const addressesV2 = getAddresses(networkId, LendingProtocol.AaveV2)
        return await strategies.aave.borrow.v2.depositBorrow(borrowDepositStratArgs, {
          ...borrowDepositStratDeps,
          addresses: addressesV2,
        })
      }
      if (protocol === LendingProtocol.AaveV3) {
        const addressesV3 = getAddresses(networkId, LendingProtocol.AaveV3)
        return await strategies.aave.borrow.v3.depositBorrow(borrowDepositStratArgs, {
          ...borrowDepositStratDeps,
          addresses: addressesV3,
        })
      }

      if (protocol === LendingProtocol.SparkV3) {
        const addressesV3 = getAddresses(networkId, LendingProtocol.SparkV3)
        return await strategies.spark.borrow.depositBorrow(borrowDepositStratArgs, {
          ...borrowDepositStratDeps,
          addresses: addressesV3,
        })
      }

      throw new Error(
        `Unsupported protocol ${protocol} for action ${manageTokenInput?.manageAction}`,
      )

    default:
      throw Error('Not implemented')
  }
}
