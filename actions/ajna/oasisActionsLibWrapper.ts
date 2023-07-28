import {
  AjnaCommonDependencies,
  AjnaCommonPayload,
  AjnaStrategy,
  Network,
} from '@oasisdex/dma-library'
import {
  ajnaDepositGenerateBorrow,
  ajnaOpenBorrow,
  ajnaPaybackWithdrawBorrow,
} from 'actions/ajna/borrow'
import { ajnaClaimEarn, ajnaDepositEarn, ajnaOpenEarn, ajnaWithdrawEarn } from 'actions/ajna/earn'
import { ajnaAdjustMultiply, ajnaCloseMultiply, ajnaOpenMultiply } from 'actions/ajna/multiply'
import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { Context } from 'blockchain/network'
import { NetworkIds } from 'blockchain/networks'
import { ethers } from 'ethers'
import { AjnaFormState, AjnaGenericPosition, AjnaPoolPairs } from 'features/ajna/common/types'
import { getAjnaPoolData } from 'features/ajna/positions/common/helpers/getAjnaPoolData'

interface AjnaTxHandlerInput {
  collateralPrecision: number
  collateralPrice: BigNumber
  collateralToken: string
  context: Context
  isFormValid: boolean
  position: AjnaGenericPosition
  quotePrecision: number
  quotePrice: BigNumber
  quoteToken: string
  rpcProvider: ethers.providers.Provider
  slippage: BigNumber
  state: AjnaFormState
}

export async function getAjnaParameters({
  collateralPrecision,
  collateralPrice,
  collateralToken,
  context,
  isFormValid,
  position,
  quotePrecision,
  quotePrice,
  quoteToken,
  rpcProvider,
  slippage,
  state,
}: AjnaTxHandlerInput): Promise<AjnaStrategy<AjnaGenericPosition> | undefined> {
  const tokenPair = `${collateralToken}-${quoteToken}` as AjnaPoolPairs
  const defaultPromise = Promise.resolve(undefined)
  const chainId = context.chainId
  const walletAddress = context.account

  const { action, dpmAddress } = state
  const addressesConfig = getNetworkContracts(NetworkIds.MAINNET, context.chainId)

  const dependencies: AjnaCommonDependencies = {
    ajnaProxyActions: addressesConfig.ajnaProxyActions.address,
    poolInfoAddress: addressesConfig.ajnaPoolInfo.address,
    provider: rpcProvider,
    WETH: addressesConfig.tokens.ETH.address,
    getPoolData: getAjnaPoolData,
    network: 'mainnet' as Network,
  }

  if (!addressesConfig.ajnaPoolPairs[tokenPair]) {
    throw new Error(`No pool for given token pair: ${tokenPair}`)
  }

  const commonPayload: AjnaCommonPayload = {
    collateralTokenPrecision: collateralPrecision,
    dpmProxyAddress: dpmAddress,
    poolAddress: addressesConfig.ajnaPoolPairs[tokenPair].address,
    quoteTokenPrecision: quotePrecision,
    collateralPrice,
    quotePrice,
  }

  if (!isFormValid || !walletAddress) {
    return defaultPromise
  }

  switch (action) {
    case 'open-borrow': {
      return ajnaOpenBorrow({ state, commonPayload, dependencies })
    }
    case 'deposit-borrow':
    case 'generate-borrow': {
      return ajnaDepositGenerateBorrow({ state, commonPayload, dependencies, position })
    }
    case 'payback-borrow':
    case 'withdraw-borrow': {
      return ajnaPaybackWithdrawBorrow({ state, commonPayload, dependencies, position })
    }

    case 'open-earn': {
      return ajnaOpenEarn({ state, commonPayload, dependencies, chainId })
    }
    case 'deposit-earn': {
      return ajnaDepositEarn({ state, commonPayload, dependencies, position })
    }
    case 'withdraw-earn': {
      return ajnaWithdrawEarn({ state, commonPayload, dependencies, position })
    }
    case 'claim-earn': {
      return ajnaClaimEarn({ state, commonPayload, dependencies, position })
    }
    case 'open-multiply': {
      return ajnaOpenMultiply({
        state,
        commonPayload,
        dependencies,
        chainId,
        collateralToken,
        quoteToken,
        walletAddress,
        pool: position.pool,
        slippage,
      })
    }
    case 'adjust': {
      return ajnaAdjustMultiply({
        state,
        commonPayload,
        dependencies,
        position,
        slippage,
        collateralToken,
        quoteToken,
      })
    }
    case 'generate-multiply':
    case 'deposit-collateral-multiply': {
      const { loanToValue } = state

      if (loanToValue) {
        return ajnaAdjustMultiply({
          state,
          commonPayload,
          dependencies,
          position,
          slippage,
          collateralToken,
          quoteToken,
        })
      }

      return ajnaDepositGenerateBorrow({
        state,
        commonPayload,
        dependencies,
        position,
      })
    }
    case 'payback-multiply':
    case 'withdraw-multiply': {
      const { loanToValue } = state

      if (loanToValue) {
        return ajnaAdjustMultiply({
          state,
          commonPayload,
          dependencies,
          position,
          slippage,
          collateralToken,
          quoteToken,
        })
      }

      return ajnaPaybackWithdrawBorrow({ state, commonPayload, dependencies, position })
    }
    case 'deposit-quote-multiply': {
      // TODO here handling for complex action once available
      return defaultPromise
    }
    case 'close-multiply': {
      return ajnaCloseMultiply({
        state,
        commonPayload,
        dependencies,
        position,
        collateralToken,
        quoteToken,
        slippage,
      })
    }
    default:
      return defaultPromise
  }
}
