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
import { getToken } from 'blockchain/tokensMetadata'
import { ethers } from 'ethers'
import { AjnaFormState, AjnaGenericPosition, AjnaPoolPairs } from 'features/ajna/common/types'
import { getAjnaPoolData } from 'features/ajna/positions/common/helpers/getAjnaPoolData'

interface AjnaTxHandlerInput {
  collateralPrice: BigNumber
  collateralToken: string
  context: Context
  position: AjnaGenericPosition
  quotePrice: BigNumber
  quoteToken: string
  rpcProvider: ethers.providers.Provider
  state: AjnaFormState
  isFormValid: boolean
  slippage: BigNumber
}

export async function getAjnaParameters({
  collateralPrice,
  collateralToken,
  context,
  position,
  quotePrice,
  quoteToken,
  rpcProvider,
  state,
  isFormValid,
  slippage,
}: AjnaTxHandlerInput): Promise<AjnaStrategy<AjnaGenericPosition> | undefined> {
  const tokenPair = `${collateralToken}-${quoteToken}` as AjnaPoolPairs
  const defaultPromise = Promise.resolve(undefined)
  const chainId = context.chainId
  const walletAddress = context.account
  const quoteTokenPrecision = getToken(quoteToken).precision
  const collateralTokenPrecision = getToken(collateralToken).precision

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
    collateralTokenPrecision,
    dpmProxyAddress: dpmAddress,
    poolAddress: addressesConfig.ajnaPoolPairs[tokenPair].address,
    quoteTokenPrecision,
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
      return ajnaAdjustMultiply({ state, commonPayload, dependencies, position })
    }
    case 'generate-multiply':
    case 'deposit-collateral-multiply': {
      const { loanToValue } = state

      if (loanToValue) {
        // TODO here handling for complex action once available
        return defaultPromise
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
        // TODO here handling for complex action once available
        return defaultPromise
      }

      return ajnaPaybackWithdrawBorrow({ state, commonPayload, dependencies, position })
    }
    case 'deposit-quote-multiply': {
      // TODO here handling for complex action once available
      return defaultPromise
    }
    case 'close-multiply': {
      return ajnaCloseMultiply({ commonPayload, dependencies, position })
    }
    default:
      return defaultPromise
  }
}
