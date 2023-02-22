import { strategies } from '@oasis-actions-poc'
import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import { getToken } from 'blockchain/tokensMetadata'
import { ethers } from 'ethers'
import { AjnaFormState, AjnaPoolPairs } from 'features/ajna/common/types'
import { AjnaEarnFormState } from 'features/ajna/earn/state/ajnaEarnFormReducto'
import { zero } from 'helpers/zero'

import { AjnaPosition } from '@oasis-actions-poc/lib/packages/oasis-actions/src/helpers/ajna'
import { AjnaEarn } from '@oasis-actions-poc/lib/packages/oasis-actions/src/helpers/ajna/AjnaEarn'
import { Strategy } from '@oasis-actions-poc/src/types/common'

interface AjnaTxHandlerInput {
  collateralToken: string
  context: Context
  position: AjnaPosition | AjnaEarn
  quoteToken: string
  state: AjnaFormState
}

export async function getAjnaParameters({
  collateralToken,
  context,
  position,
  quoteToken,
  rpcProvider,
  state,
}: AjnaTxHandlerInput & {
  rpcProvider: ethers.providers.Provider
}): Promise<Strategy<AjnaPosition | AjnaEarn>> {
  const tokenPair = `${collateralToken}-${quoteToken}` as AjnaPoolPairs
  const defaultPromise = Promise.resolve({} as Strategy<AjnaPosition | AjnaEarn>)

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
    poolAddress: context.ajnaPoolPairs[tokenPair].address,
    dpmProxyAddress: dpmAddress,
    quoteTokenPrecision,
    collateralTokenPrecision,
  }

  // TODO hardcoded for now, but will be moved eventually to library
  const borrowPrice = new BigNumber(16821273)

  // intentionally allowed for fallthrough; if none of conditions are met, just go to default return
  /* eslint-disable no-fallthrough */
  switch (action) {
    case 'open-borrow': {
      const { depositAmount, generateAmount } = state
      if (!depositAmount) return defaultPromise

      return strategies.ajna.borrow.open(
        {
          ...commonPayload,
          quoteAmount: generateAmount || zero,
          collateralAmount: depositAmount,
          price: borrowPrice,
        },
        dependencies,
      )
    }
    case 'deposit-borrow': {
      const { depositAmount, generateAmount } = state
      if (!depositAmount) return defaultPromise

      return strategies.ajna.borrow.depositBorrow(
        {
          ...commonPayload,
          quoteAmount: generateAmount || zero,
          collateralAmount: depositAmount,
          price: borrowPrice,
          position: position as AjnaPosition,
        },
        dependencies,
      )
    }
    case 'generate-borrow': {
      const { depositAmount, generateAmount } = state
      if (!generateAmount) return defaultPromise

      return strategies.ajna.borrow.depositBorrow(
        {
          ...commonPayload,
          quoteAmount: generateAmount,
          collateralAmount: depositAmount || zero,
          price: borrowPrice,
          position: position as AjnaPosition,
        },
        dependencies,
      )
    }
    case 'payback-borrow': {
      const { paybackAmount, withdrawAmount } = state
      if (!paybackAmount) return defaultPromise

      return strategies.ajna.borrow.paybackWithdraw(
        {
          ...commonPayload,
          quoteAmount: paybackAmount,
          collateralAmount: withdrawAmount || zero,
          position: position as AjnaPosition,
        },
        dependencies,
      )
    }
    case 'withdraw-borrow': {
      const { paybackAmount, withdrawAmount } = state
      if (!withdrawAmount) return defaultPromise

      return strategies.ajna.paybackWithdraw(
        {
          ...commonPayload,
          quoteAmount: paybackAmount || zero,
          collateralAmount: withdrawAmount,
          position: position as AjnaPosition,
        },
        dependencies,
      )
    }
    case 'open-earn': {
      const { price, depositAmount } = state as AjnaEarnFormState
      console.log('price', price)
      if (!depositAmount || !price) return defaultPromise

      return strategies.ajna.earn.open(
        {
          ...commonPayload,
          price,
          quoteAmount: depositAmount,
          isStakingNft: false,
          // position: position as AjnaEarn, // TODO currently not requried by interface, but will be
        },
        dependencies,
      )
    }
    default:
      return defaultPromise
  }
}
