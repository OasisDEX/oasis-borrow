import { AjnaEarnPosition, AjnaPosition, strategies } from '@oasisdex/oasis-actions-poc'
import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import { getToken } from 'blockchain/tokensMetadata'
import { ethers } from 'ethers'
import { AjnaFormState, AjnaPoolPairs } from 'features/ajna/common/types'
import { getAjnaEarnData } from 'features/ajna/positions/earn/helpers/getAjnaEarnData'
import { AjnaEarnFormState } from 'features/ajna/positions/earn/state/ajnaEarnFormReducto'
import { zero } from 'helpers/zero'

import { Strategy } from '@oasisdex/oasis-actions-poc/src/types/common'

interface AjnaTxHandlerInput {
  collateralPrice: BigNumber
  collateralToken: string
  context: Context
  position: AjnaPosition | AjnaEarnPosition
  quotePrice: BigNumber
  quoteToken: string
  rpcProvider: ethers.providers.Provider
  state: AjnaFormState
  isFormValid: boolean
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
}: AjnaTxHandlerInput): Promise<Strategy<AjnaPosition | AjnaEarnPosition> | undefined> {
  const tokenPair = `${collateralToken}-${quoteToken}` as AjnaPoolPairs
  const defaultPromise = Promise.resolve(undefined)

  const quoteTokenPrecision = getToken(quoteToken).precision
  const collateralTokenPrecision = getToken(collateralToken).precision

  const { action, dpmAddress } = state

  const dependencies = {
    ajnaProxyActions: context.ajnaProxyActions.address,
    poolInfoAddress: context.ajnaPoolInfo.address,
    provider: rpcProvider,
    WETH: context.tokens.ETH.address,
  }

  if (!context.ajnaPoolPairs[tokenPair]) {
    throw new Error(`No pool for given token pair: ${tokenPair}`)
  }

  const commonPayload = {
    collateralTokenPrecision,
    dpmProxyAddress: dpmAddress,
    poolAddress: context.ajnaPoolPairs[tokenPair].address,
    quoteTokenPrecision,
  }

  // TODO hardcoded for now, but will be moved eventually to library
  const borrowPrice = new BigNumber(12662543981384068647567)

  if (!isFormValid) {
    return defaultPromise
  }

  switch (action) {
    case 'open-borrow': {
      const { depositAmount, generateAmount } = state

      return strategies.ajna.borrow.open(
        {
          ...commonPayload,
          collateralAmount: depositAmount!,
          collateralPrice,
          price: borrowPrice,
          quoteAmount: generateAmount || zero,
          quotePrice,
        },
        dependencies,
      )
    }
    case 'deposit-borrow': {
      const { depositAmount, generateAmount } = state

      return strategies.ajna.borrow.depositBorrow(
        {
          ...commonPayload,
          collateralAmount: depositAmount!,
          position: position as AjnaPosition,
          price: borrowPrice,
          quoteAmount: generateAmount || zero,
        },
        dependencies,
      )
    }
    case 'generate-borrow': {
      const { depositAmount, generateAmount } = state

      return strategies.ajna.borrow.depositBorrow(
        {
          ...commonPayload,
          collateralAmount: depositAmount || zero,
          position: position as AjnaPosition,
          price: borrowPrice,
          quoteAmount: generateAmount!,
        },
        dependencies,
      )
    }
    case 'payback-borrow': {
      const { paybackAmount, withdrawAmount } = state

      return strategies.ajna.borrow.paybackWithdraw(
        {
          ...commonPayload,
          collateralAmount: withdrawAmount || zero,
          position: position as AjnaPosition,
          quoteAmount: paybackAmount!,
        },
        dependencies,
      )
    }
    case 'withdraw-borrow': {
      const { paybackAmount, withdrawAmount } = state

      return strategies.ajna.paybackWithdraw(
        {
          ...commonPayload,
          collateralAmount: withdrawAmount!,
          position: position as AjnaPosition,
          quoteAmount: paybackAmount || zero,
        },
        dependencies,
      )
    }
    case 'open-earn': {
      const { price, depositAmount } = state as AjnaEarnFormState

      return strategies.ajna.earn.open(
        {
          ...commonPayload,
          price: price!,
          quoteAmount: depositAmount!,
          isStakingNft: false,
          collateralPrice,
          quotePrice,
        },
        { ...dependencies, getEarnData: getAjnaEarnData },
      )
    }
    case 'deposit-earn': {
      const { price, depositAmount } = state as AjnaEarnFormState

      return strategies.ajna.earn.depositAndAdjust(
        {
          ...commonPayload,
          price: price!,
          quoteAmount: depositAmount || zero,
          position: position as AjnaEarnPosition,
        },
        { ...dependencies },
      )
    }
    case 'withdraw-earn': {
      const { price, withdrawAmount } = state as AjnaEarnFormState

      return strategies.ajna.earn.withdrawAndAdjust(
        {
          ...commonPayload,
          price: price!,
          quoteAmount: withdrawAmount || zero,
          position: position as AjnaEarnPosition,
        },
        { ...dependencies },
      )
    }
    default:
      return defaultPromise
  }
}
