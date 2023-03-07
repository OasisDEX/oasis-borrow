import { strategies } from '@oasis-actions-poc'
import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import { getToken } from 'blockchain/tokensMetadata'
import { ethers } from 'ethers'
import { AjnaFormState, AjnaPoolPairs } from 'features/ajna/common/types'
import { getAjnaEarnData } from 'features/ajna/positions/earn/helpers/getAjnaEarnData'
import { AjnaEarnFormState } from 'features/ajna/positions/earn/state/ajnaEarnFormReducto'
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

      if (depositAmount) {
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
      break
    }
    case 'deposit-borrow': {
      const { depositAmount, generateAmount } = state

      if (depositAmount) {
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
      break
    }
    case 'generate-borrow': {
      const { depositAmount, generateAmount } = state

      if (generateAmount) {
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
      break
    }
    case 'payback-borrow': {
      const { paybackAmount, withdrawAmount } = state

      if (paybackAmount) {
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
      break
    }
    case 'withdraw-borrow': {
      const { paybackAmount, withdrawAmount } = state

      if (withdrawAmount) {
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
      break
    }
    case 'open-earn': {
      const { price, depositAmount } = state as AjnaEarnFormState

      if (depositAmount && price) {
        return strategies.ajna.earn.open(
          {
            ...commonPayload,
            price,
            quoteAmount: depositAmount,
            isStakingNft: false,
          },
          { ...dependencies, getEarnData: getAjnaEarnData },
        )
      }
      break
    }
    case 'deposit-earn': {
      const { price, depositAmount } = state as AjnaEarnFormState

      if (price) {
        return strategies.ajna.earn.depositAndAdjust(
          {
            ...commonPayload,
            price,
            quoteAmount: depositAmount || zero,
            position: position as AjnaEarn,
          },
          { ...dependencies, getEarnData: getAjnaEarnData },
        )
      }
      break
    }
    case 'withdraw-earn': {
      const { price, withdrawAmount } = state as AjnaEarnFormState

      if (price) {
        return strategies.ajna.earn.withdrawAndAdjust(
          {
            ...commonPayload,
            price,
            quoteAmount: withdrawAmount || zero,
            position: position as AjnaEarn,
          },
          { ...dependencies, getEarnData: getAjnaEarnData },
        )
      }
      break
    }
    default:
      return defaultPromise
  }

  return defaultPromise
}
