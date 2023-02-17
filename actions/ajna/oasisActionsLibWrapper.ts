import { strategies } from '@oasisdex/oasis-actions'
import { AjnaActionData } from 'actions/ajna/types'
import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import { getToken } from 'blockchain/tokensMetadata'
import { ethers } from 'ethers'
import { AjnaBorrowFormState } from 'features/ajna/borrow/state/ajnaBorrowFormReducto'
import { AjnaPoolPairs } from 'features/ajna/common/types'
import { zero } from 'helpers/zero'

import { AjnaPosition } from '@oasisdex/oasis-actions/lib/packages/oasis-actions/src/helpers/ajna'

interface AjnaTxHandlerInput {
  formState: AjnaBorrowFormState
  collateralToken: string
  quoteToken: string
  context: Context
  position: AjnaPosition
}

export async function getAjnaParameters<P>({
  formState: { action, depositAmount, generateAmount, paybackAmount, withdrawAmount, dpmAddress },
  rpcProvider,
  collateralToken,
  quoteToken,
  context,
  position,
}: AjnaTxHandlerInput & {
  rpcProvider: ethers.providers.Provider
}): Promise<AjnaActionData<P>> {
  const tokenPair = `${collateralToken}-${quoteToken}` as AjnaPoolPairs
  const defaultPromise = Promise.resolve({} as AjnaActionData<P>)

  const quoteTokenPrecision = getToken(quoteToken).precision
  const collateralTokenPrecision = getToken(collateralToken).precision

  const dependencies = {
    provider: rpcProvider,
    poolInfoAddress: context.ajnaPoolInfo.address,
    ajnaProxyActions: context.ajnaProxyActions.address,
    WETH: context.tokens.ETH.address,
  }

  if (!context.ajnaPoolPairs[tokenPair]) {
    throw new Error(`No pool for given token pair ${tokenPair}`)
  }

  const commonPayload = {
    poolAddress: context.ajnaPoolPairs[tokenPair].address,
    dpmProxyAddress: dpmAddress,
    quoteTokenPrecision,
    collateralTokenPrecision,
  }

  // TODO hardcoded for now, but will be moved eventually to library
  const price = new BigNumber(16821273)

  switch (action) {
    case 'openBorrow':
      if (!depositAmount) {
        return defaultPromise
      }
      return strategies.ajna.open(
        {
          ...commonPayload,
          quoteAmount: generateAmount || zero,
          collateralAmount: depositAmount,
          price,
        },
        dependencies,
      )
    case 'depositBorrow': {
      if (!depositAmount) {
        return defaultPromise
      }
      return strategies.ajna.depositBorrow(
        {
          ...commonPayload,
          quoteAmount: generateAmount || zero,
          collateralAmount: depositAmount,
          price,
          position,
        },
        dependencies,
      )
    }
    case 'withdrawBorrow': {
      if (!withdrawAmount) {
        return defaultPromise
      }
      return strategies.ajna.paybackWithdraw(
        {
          ...commonPayload,
          quoteAmount: paybackAmount || zero,
          collateralAmount: withdrawAmount,
          position,
        },
        dependencies,
      )
    }
    case 'generateBorrow': {
      if (!generateAmount) {
        return defaultPromise
      }
      return strategies.ajna.depositBorrow(
        {
          ...commonPayload,
          quoteAmount: generateAmount,
          collateralAmount: depositAmount || zero,
          price,
          position,
        },
        dependencies,
      )
    }
    case 'paybackBorrow': {
      if (!paybackAmount) {
        return defaultPromise
      }
      return strategies.ajna.paybackWithdraw(
        {
          ...commonPayload,
          quoteAmount: paybackAmount,
          collateralAmount: withdrawAmount || zero,
          position,
        },
        dependencies,
      )
    }
    default:
      return defaultPromise
  }
}
