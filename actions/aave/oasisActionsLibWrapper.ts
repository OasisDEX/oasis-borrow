import {
  AAVEStrategyAddresses,
  AAVETokens,
  IPosition,
  IPositionTransition,
  IRiskRatio,
  Position,
  strategies,
  ZERO,
} from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { ethNullAddress } from 'blockchain/config'
import { Context } from 'blockchain/network'
import { getToken } from 'blockchain/tokensMetadata'
import { amountToWei } from 'blockchain/utils'
import { providers } from 'ethers'
import { ProxyType } from 'features/aave/common/StrategyConfigTypes'
import { ManageCollateralActionsEnum, ManageDebtActionsEnum } from 'features/aave/strategyConfig'
import { getOneInchCall } from 'helpers/swap'
import { zero } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'

import { checkContext } from './checkContext'
import { getAddressesFromContext } from './getAddressesFromContext'
import {
  AdjustAaveParameters,
  CloseAaveParameters,
  GetOnChainPositionParams,
  ManageAaveParameters,
  OpenAaveParameters,
} from './types/'

// todo: export from oasis-actions
type Swap2 = {
  fromTokenAmount: BigNumber
  minToTokenAmount: BigNumber
  tokenFee: BigNumber
  collectFeeFrom: 'sourceToken' | 'targetToken'
  sourceToken: { symbol: string; precision: number }
  targetToken: { symbol: string; precision: number }
}

export function getFee(swap: Swap2): BigNumber {
  return swap.tokenFee.div(new BigNumber(10).pow(swap[swap.collectFeeFrom].precision))
}

async function openAave(
  slippage: BigNumber,
  riskRatio: IRiskRatio,
  debtToken: { symbol: AAVETokens; precision: number },
  collateralToken: {
    symbol: AAVETokens
    precision: number
  },
  depositedByUser: {
    collateralToken?: { amountInBaseUnit: BigNumber }
    debtToken?: { amountInBaseUnit: BigNumber }
  },
  positionType: 'Multiply' | 'Earn' | 'Borrow',
  context: Context,
  proxyAddress: string,
  proxyType: ProxyType,
  protocol: LendingProtocol,
) {
  const args: Parameters<typeof strategies.aave.v2.open>[0] &
    Parameters<typeof strategies.aave.v3.open>[0] = {
    slippage,
    multiple: riskRatio,
    debtToken: debtToken,
    collateralToken: collateralToken,
    depositedByUser,
    positionType: positionType,
  }

  const dependencies: Parameters<typeof strategies.aave.v2.open>[1] &
    Parameters<typeof strategies.aave.v3.open>[1] = {
    addresses: getAddressesFromContext(context),
    provider: context.rpcProvider,
    getSwapData: getOneInchCall(context.swapAddress),
    proxy: proxyAddress,
    user: proxyAddress !== ethNullAddress ? context.account! : ethNullAddress, // mocking the address before wallet connection
    isDPMProxy: proxyType === ProxyType.DpmProxy,
  }

  switch (protocol) {
    case LendingProtocol.AaveV2:
      return await strategies.aave.v2.open(args, dependencies)
    case LendingProtocol.AaveV3:
      return await strategies.aave.v3.open(args, dependencies)
  }
}

export async function getOpenTransaction({
  context,
  amount,
  collateralToken,
  debtToken,
  depositToken,
  riskRatio,
  slippage,
  proxyAddress,
  proxyType,
  positionType,
  protocol,
}: OpenAaveParameters): Promise<IPositionTransition> {
  const _collateralToken = {
    symbol: collateralToken as AAVETokens,
    precision: getToken(collateralToken).precision,
  }

  const _debtToken = {
    symbol: debtToken as AAVETokens,
    precision: getToken(debtToken).precision,
  }

  let depositedByUser: {
    collateralToken?: {
      amountInBaseUnit: BigNumber
    }
    debtToken?: { amountInBaseUnit: BigNumber }
  }

  if (depositToken === debtToken) {
    depositedByUser = {
      debtToken: {
        amountInBaseUnit: amountToWei(amount, debtToken),
      },
    }
  } else if (depositToken === collateralToken) {
    depositedByUser = {
      collateralToken: {
        amountInBaseUnit: amountToWei(amount, collateralToken),
      },
    }
  } else {
    throw new Error('Token is neither collateral nor debt')
  }
  return openAave(
    slippage,
    riskRatio,
    _debtToken,
    _collateralToken,
    depositedByUser,
    positionType,
    context,
    proxyAddress,
    proxyType,
    protocol,
  )
}

export async function getOnChainPosition({
  context,
  proxyAddress,
  collateralToken,
  debtToken,
  protocol,
}: GetOnChainPositionParams): Promise<IPosition> {
  const provider = new providers.JsonRpcProvider(context.infuraUrl, context.chainId)
  const _collateralToken = {
    symbol: collateralToken as AAVETokens,
    precision: getToken(collateralToken).precision,
  }

  const _debtToken = {
    symbol: debtToken as AAVETokens,
    precision: getToken(debtToken).precision,
  }

  if (protocol === LendingProtocol.AaveV2) {
    return await strategies.aave.v2.view(
      {
        proxy: proxyAddress,
        collateralToken: _collateralToken,
        debtToken: _debtToken,
      },
      { addresses: getAddressesFromContext(context), provider },
    )
  }

  if (protocol === LendingProtocol.AaveV3) {
    return await strategies.aave.v3.view(
      {
        proxy: proxyAddress,
        collateralToken: _collateralToken,
        debtToken: _debtToken,
      },
      { addresses: getAddressesFromContext(context), provider },
    )
  }

  throw new Error('Protocol not supported')
}

export async function getAdjustAaveParameters({
  context,
  proxyAddress,
  slippage,
  riskRatio,
  currentPosition,
  proxyType,
  positionType,
}: AdjustAaveParameters): Promise<IPositionTransition> {
  try {
    checkContext(context, 'adjust position')

    const provider = context.rpcProvider

    const collateralToken = {
      symbol: currentPosition.collateral.symbol as AAVETokens,
      precision: currentPosition.collateral.precision,
    }

    const debtToken = {
      symbol: currentPosition.debt.symbol as AAVETokens,
      precision: currentPosition.debt.precision,
    }

    type adjustParameters = Parameters<typeof strategies.aave.v2.adjust>

    const stratArgs: adjustParameters[0] = {
      slippage,
      multiple: riskRatio.multiple,
      debtToken: debtToken,
      collateralToken: collateralToken,
      positionType,
    }

    const stratDeps: adjustParameters[1] = {
      addresses: getAddressesFromContext(context) as AAVEStrategyAddresses,
      currentPosition,
      provider: provider,
      getSwapData: getOneInchCall(context.swapAddress),
      proxy: proxyAddress,
      user: context.account,
      isDPMProxy: proxyType === ProxyType.DpmProxy,
    }

    return strategies.aave.v2.adjust(stratArgs, stratDeps)
  } catch (e) {
    console.error(e)
    throw e
  }
}

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

export async function getManageAaveParameters(
  parameters: ManageAaveParameters,
): Promise<IPositionTransition> {
  try {
    const {
      context,
      proxyAddress,
      slippage,
      currentPosition,
      manageTokenInput,
      proxyType,
    } = parameters

    checkContext(context, 'deposit/borrow position')
    const provider = new providers.JsonRpcProvider(context.infuraUrl, context.chainId)
    const addresses = getAddressesFromContext(context)

    const [collateral, debt] = getTokensInBaseUnit(parameters)

    switch (manageTokenInput?.manageTokenAction) {
      case ManageDebtActionsEnum.PAYBACK_DEBT:
      case ManageCollateralActionsEnum.WITHDRAW_COLLATERAL:
        type types = Parameters<typeof strategies.aave.v2.paybackWithdraw>

        const paybackWithdrawStratArgs: types[0] = {
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

        const paybackWithdrawStratDeps: types[1] = {
          addresses: addresses as AAVEStrategyAddresses,
          currentPosition,
          provider: provider,
          getSwapData: getOneInchCall(context.swapAddress),
          proxy: proxyAddress,
          user: context.account,
          isDPMProxy: proxyType === ProxyType.DpmProxy,
        }

        return await strategies.aave.v2.paybackWithdraw(
          paybackWithdrawStratArgs,
          paybackWithdrawStratDeps,
        )
      case ManageDebtActionsEnum.BORROW_DEBT:
      case ManageCollateralActionsEnum.DEPOSIT_COLLATERAL:
        const borrowDepositStratArgs: Parameters<typeof strategies.aave.v2.depositBorrow>[0] = {
          slippage,
        }
        if (manageTokenInput?.manageTokenAction === ManageDebtActionsEnum.BORROW_DEBT) {
          borrowDepositStratArgs.borrowAmount = debt || ZERO
        }
        if (
          manageTokenInput?.manageTokenAction === ManageCollateralActionsEnum.DEPOSIT_COLLATERAL
        ) {
          borrowDepositStratArgs.entryToken = {
            amountInBaseUnit: collateral || ZERO,
            symbol: currentPosition.collateral.symbol as Exclude<AAVETokens, 'WSTETH'>,
            precision: currentPosition.collateral.precision,
          }
        }
        const borrowDepositStratDeps: Parameters<typeof strategies.aave.v2.depositBorrow>[1] = {
          addresses: addresses as AAVEStrategyAddresses,
          currentPosition,
          provider: provider,
          getSwapData: getOneInchCall(context.swapAddress),
          proxy: proxyAddress,
          user: context.account,
          isDPMProxy: proxyType === ProxyType.DpmProxy,
        }
        return await strategies.aave.v2.depositBorrow(
          borrowDepositStratArgs,
          borrowDepositStratDeps,
        )
      default:
        throw Error('Not implemented')
    }
  } catch (e) {
    console.error(e)
    throw e
  }
}

export async function getCloseAaveParameters({
  context,
  proxyAddress,
  slippage,
  currentPosition,
  proxyType,
  shouldCloseToCollateral,
  protocol,
}: CloseAaveParameters): Promise<IPositionTransition> {
  checkContext(context, 'adjust position')

  const collateralToken = {
    symbol: currentPosition.collateral.symbol as AAVETokens,
    precision: currentPosition.collateral.precision,
  }

  const debtToken = {
    symbol: currentPosition.debt.symbol as AAVETokens,
    precision: currentPosition.debt.precision,
  }

  type closeParameters =
    | Parameters<typeof strategies.aave.v2.close>
    | Parameters<typeof strategies.aave.v3.close>
  const stratArgs: closeParameters[0] = {
    slippage,
    debtToken,
    collateralToken,
    collateralAmountLockedInProtocolInWei: currentPosition.collateral.amount.minus(1),
    shouldCloseToCollateral,
  }

  const stratDeps: closeParameters[1] = {
    addresses: getAddressesFromContext(context) as AAVEStrategyAddresses,
    currentPosition,
    provider: context.rpcProvider,
    getSwapData: getOneInchCall(context.swapAddress),
    proxy: proxyAddress,
    user: context.account,
    isDPMProxy: proxyType === ProxyType.DpmProxy,
  }

  switch (protocol) {
    case LendingProtocol.AaveV2:
      return strategies.aave.v2.close(stratArgs, stratDeps)
    case LendingProtocol.AaveV3:
      return strategies.aave.v3.close(stratArgs, stratDeps)
  }
}

export function getEmptyPosition(collateral: string, debt: string) {
  return new Position(
    {
      amount: zero,
      symbol: debt,
      precision: getToken(debt).precision,
    },
    {
      amount: zero,
      symbol: collateral,
      precision: getToken(collateral).precision,
    },
    zero,
    {
      maxLoanToValue: zero,
      liquidationThreshold: zero,
      dustLimit: zero,
    },
  )
}
