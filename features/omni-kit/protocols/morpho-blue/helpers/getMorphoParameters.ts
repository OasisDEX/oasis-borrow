import type {
  MorphoBlueCommonDependencies,
  MorphoblueDepositBorrowPayload,
  MorphoBluePosition,
  Network,
} from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import type { ethers } from 'ethers'
import { omniNetworkMap } from 'features/omni-kit/constants'
import { getMaxIncreasedValue } from 'features/omni-kit/protocols/ajna/helpers'
import {
  morphoActionDepositBorrow,
  morphoActionOpenBorrow,
  morphoActionPaybackWithdraw,
} from 'features/omni-kit/protocols/morpho-blue/actions/borrow'
import { getMorphoCumulatives } from 'features/omni-kit/protocols/morpho-blue/helpers/getMorphoCumulatives'
import type { OmniFormState, OmniSupportedNetworkIds } from 'features/omni-kit/types'
import { OmniBorrowFormAction } from 'features/omni-kit/types'

export const getMorphoParameters = async ({
  state,
  rpcProvider,
  networkId,
  isFormValid,
  walletAddress,
  quoteBalance,
  position,
  collateralPrecision,
  collateralPrice,
  quotePrecision,
  quotePrice,
}: {
  state: OmniFormState
  rpcProvider: ethers.providers.Provider
  networkId: OmniSupportedNetworkIds
  isFormValid: boolean
  walletAddress?: string
  quoteBalance: BigNumber
  position: MorphoBluePosition
  collateralPrecision: number
  collateralPrice: BigNumber
  quotePrice: BigNumber
  quotePrecision: number
}) => {
  const defaultPromise = Promise.resolve(undefined)

  const { action, dpmAddress } = state

  if (!isFormValid || !walletAddress) {
    return defaultPromise
  }

  const addressesConfig = getNetworkContracts(networkId)

  const commonPayload: MorphoblueDepositBorrowPayload = {
    quoteAmount: position.debtAmount,
    collateralAmount: position.collateralAmount,
    collateralPrecision,
    collateralPrice,
    quotePrice,
    quotePrecision,
    morphoBlueMarket: '',
    proxyAddress: dpmAddress,
    user: walletAddress,
  }

  const dependencies: MorphoBlueCommonDependencies = {
    provider: rpcProvider,
    network: omniNetworkMap[networkId] as Network,
    getCumulatives: getMorphoCumulatives(),
    operationExecutor: addressesConfig.operationExecutor.address, // duplicated
    addresses: {
      morphoblue: addressesConfig.morphoBlue.address,
      operationExecutor: addressesConfig.operationExecutor.address,
      tokens: {
        WETH: addressesConfig.tokens.WETH.address,
        DAI: addressesConfig.tokens.DAI.address,
        ETH: addressesConfig.tokens.ETH.address,
        USDC: addressesConfig.tokens.USDC.address,
        USDT: addressesConfig.tokens.USDT.address,
        WBTC: addressesConfig.tokens.WBTC.address,
        WSTETH: addressesConfig.tokens.WSTETH.address,
      },
    },
  }

  switch (action) {
    case OmniBorrowFormAction.OpenBorrow: {
      return morphoActionOpenBorrow({ state, commonPayload, dependencies })
    }
    case OmniBorrowFormAction.DepositBorrow:
    case OmniBorrowFormAction.GenerateBorrow: {
      return morphoActionDepositBorrow({
        state,
        commonPayload,
        dependencies,
      })
    }
    case OmniBorrowFormAction.PaybackBorrow:
    case OmniBorrowFormAction.WithdrawBorrow: {
      return morphoActionPaybackWithdraw({
        state: {
          ...state,
          paybackAmount:
            state.paybackAmount && state.paybackAmountMax
              ? getMaxIncreasedValue(state.paybackAmount, position.borrowRate)
              : state.paybackAmount,
        },
        commonPayload,
        dependencies,
        quoteBalance,
      })
    }
    default:
      return defaultPromise
  }
}
