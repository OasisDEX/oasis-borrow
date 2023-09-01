import { AAVETokens, IStrategy, strategies } from '@oasisdex/dma-library'
import { getAddresses } from 'actions/aave-like/get-addresses'
import { networkIdToLibraryNetwork } from 'actions/aave-like/helpers'
import { ManageAaveParameters } from 'actions/aave-like/types'
import BigNumber from 'bignumber.js'
import { getRpcProvider } from 'blockchain/networks'
import { amountToWei } from 'blockchain/utils'
import { ManageCollateralActionsEnum, ManageDebtActionsEnum } from 'features/aave'
import { zero } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'

function getTokensInBaseUnit({
  manageTokenInput,
  currentPosition,
}: ManageAaveParameters): [BigNumber, BigNumber] {
  if (!manageTokenInput?.manageTokenAction) {
    return [zero, zero]
  }

  const collateralInBaseUnit =
    manageTokenInput?.manageTokenAction === ManageCollateralActionsEnum.WITHDRAW_COLLATERAL ||
    manageTokenInput.manageTokenAction === ManageCollateralActionsEnum.DEPOSIT_COLLATERAL
      ? amountToWei(
          manageTokenInput?.manageTokenActionValue || zero,
          currentPosition.collateral.symbol,
        )
      : zero

  const debtInBaseUnit =
    manageTokenInput?.manageTokenAction === ManageDebtActionsEnum.BORROW_DEBT ||
    manageTokenInput?.manageTokenAction === ManageDebtActionsEnum.PAYBACK_DEBT
      ? amountToWei(manageTokenInput?.manageTokenActionValue || zero, currentPosition.debt.symbol)
      : zero

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

  switch (manageTokenInput?.manageTokenAction) {
    case ManageDebtActionsEnum.PAYBACK_DEBT:
    case ManageCollateralActionsEnum.WITHDRAW_COLLATERAL:
      type paybackWithdrawTypes = Parameters<typeof strategies.aave.borrow.v2.paybackWithdraw> &
        Parameters<
          typeof strategies.aave.borrow.v3.paybackWithdraw
        > /* & Parameters<typeof strategies.spark.paybackWithdraw> */

      const paybackWithdrawStratArgs: paybackWithdrawTypes[0] = {
        slippage,
        debtToken: {
          symbol: currentPosition.debt.symbol as AAVETokens,
          precision: currentPosition.debt.precision,
        },
        collateralToken: {
          symbol: currentPosition.collateral.symbol as AAVETokens,
          precision: currentPosition.collateral.precision,
        },
        amountCollateralToWithdrawInBaseUnit: collateral,
        amountDebtToPaybackInBaseUnit: debt,
      }

      const paybackWithdrawStratDeps: Omit<paybackWithdrawTypes[1], 'addresses'> = {
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
          protocolType: 'Spark',
          addresses: addressesV3,
        })
      }

      throw new Error(
        `Unsupported protocol ${protocol} for action ${manageTokenInput?.manageTokenAction}`,
      )

    case ManageDebtActionsEnum.BORROW_DEBT:
    case ManageCollateralActionsEnum.DEPOSIT_COLLATERAL:
      type borrowDepositTypes = Parameters<typeof strategies.aave.borrow.v2.depositBorrow> &
        Parameters<
          typeof strategies.aave.borrow.v3.depositBorrow
        > /* & Parameters<typeof strategies.spark.depositBorrow> */

      const borrowDepositStratArgs: borrowDepositTypes[0] = {
        debtToken: {
          symbol: currentPosition.debt.symbol as AAVETokens,
          precision: currentPosition.debt.precision,
        },
        collateralToken: {
          symbol: currentPosition.collateral.symbol as AAVETokens,
          precision: currentPosition.collateral.precision,
        },
        slippage,
        amountDebtToBorrowInBaseUnit: debt,
        amountCollateralToDepositInBaseUnit: collateral,
        entryToken: {
          symbol: currentPosition.collateral.symbol as AAVETokens,
          precision: currentPosition.collateral.precision,
        },
      }

      const borrowDepositStratDeps: Omit<borrowDepositTypes[1], 'addresses'> = {
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
        `Unsupported protocol ${protocol} for action ${manageTokenInput?.manageTokenAction}`,
      )

    default:
      throw Error('Not implemented')
  }
}
