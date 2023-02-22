import { strategies } from '@oasisdex/oasis-actions'
import { AjnaActionData } from 'actions/ajna/types'
import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import { getToken } from 'blockchain/tokensMetadata'
import { ethers } from 'ethers'
import { AjnaFormState, AjnaPoolPairs } from 'features/ajna/common/types'
import { AjnaEarnPosition } from 'features/ajna/earn/fakePosition'
import { zero } from 'helpers/zero'

import { AjnaPosition } from '@oasisdex/oasis-actions/lib/packages/oasis-actions/src/helpers/ajna'

interface AjnaTxHandlerInput {
  collateralToken: string
  context: Context
  position: AjnaPosition | AjnaEarnPosition
  quoteToken: string
  state: AjnaFormState
}

export async function getAjnaParameters<P>({
  collateralToken,
  context,
  position,
  quoteToken,
  rpcProvider,
  state,
}: AjnaTxHandlerInput & {
  rpcProvider: ethers.providers.Provider
}): Promise<AjnaActionData<P>> {
  const tokenPair = `${collateralToken}-${quoteToken}` as AjnaPoolPairs
  const defaultPromise = Promise.resolve({} as AjnaActionData<P>)

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
  const price = new BigNumber(16821273)

  // intentionally allowed for fallthrough; if none of conditions are met, just go to default return
  /* eslint-disable no-fallthrough */
  switch (action) {
    case 'open-borrow': {
      const { depositAmount, generateAmount } = state

      if (depositAmount) {
        // @ts-ignore
        return strategies.ajna.open(
          {
            ...commonPayload,
            quoteAmount: generateAmount || zero,
            collateralAmount: depositAmount,
            price,
          },
          dependencies,
        )
      }
    }
    case 'deposit-borrow': {
      const { depositAmount, generateAmount } = state

      if (depositAmount) {
        // @ts-ignore
        return strategies.ajna.depositBorrow(
          {
            ...commonPayload,
            quoteAmount: generateAmount || zero,
            collateralAmount: depositAmount,
            price,
            position: position as AjnaPosition,
          },
          dependencies,
        )
      }
    }
    case 'generate-borrow': {
      const { depositAmount, generateAmount } = state

      if (generateAmount) {
        // @ts-ignore
        return strategies.ajna.depositBorrow(
          {
            ...commonPayload,
            quoteAmount: generateAmount,
            collateralAmount: depositAmount || zero,
            price,
            position: position as AjnaPosition,
          },
          dependencies,
        )
      }
    }
    case 'payback-borrow': {
      const { paybackAmount, withdrawAmount } = state

      if (paybackAmount) {
        // @ts-ignore
        return strategies.ajna.paybackWithdraw(
          {
            ...commonPayload,
            quoteAmount: paybackAmount,
            collateralAmount: withdrawAmount || zero,
            position: position as AjnaPosition,
          },
          dependencies,
        )
      }
    }
    case 'withdraw-borrow': {
      const { paybackAmount, withdrawAmount } = state

      if (withdrawAmount) {
        // @ts-ignore
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
    }
    // Earn example
    // case 'withdraw-earn': {
    //   const { price, withdrawAmount } = state as AjnaEarnFormState
    //
    //   if (withdrawAmount) {
    //     return strategies.ajna.paybackWithdraw(
    //       {
    //         ...commonPayload,
    //         price,
    //         collateralAmount: withdrawAmount,
    //         position: position as AjnaEarnPosition,
    //       },
    //       dependencies,
    //     )
    //   }
    // }
    default:
      return defaultPromise
  }
}
