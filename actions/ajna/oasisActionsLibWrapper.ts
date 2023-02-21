import { strategies } from '@oasisdex/oasis-actions'
import { AjnaActionData } from 'actions/ajna/types'
import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import { getToken } from 'blockchain/tokensMetadata'
import { ethers } from 'ethers'
import { AjnaBorrowFormState } from 'features/ajna/borrow/state/ajnaBorrowFormReducto'
import { AjnaPoolPairs } from 'features/ajna/common/types'
import { AjnaEarnFormState } from 'features/ajna/earn/state/ajnaEarnFormReducto'
import { zero } from 'helpers/zero'

import { AjnaPosition } from '@oasisdex/oasis-actions/lib/packages/oasis-actions/src/helpers/ajna'

function getCommonDependencies<P>({
  collateralToken,
  quoteToken,
  rpcProvider,
  context,
  dpmAddress,
}: {
  collateralToken: string
  quoteToken: string
  rpcProvider: ethers.providers.Provider
  context: Context
  dpmAddress: string
}) {
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

  return {
    defaultPromise,
    dependencies,
    commonPayload,
  }
}

interface AjnaTxHandlerInput<S, P> {
  formState: S
  collateralToken: string
  quoteToken: string
  context: Context
  position: P
}

export async function getAjnaBorrowParameters({
  formState: { action, depositAmount, generateAmount, paybackAmount, withdrawAmount, dpmAddress },
  rpcProvider,
  collateralToken,
  quoteToken,
  context,
  position,
}: AjnaTxHandlerInput<AjnaBorrowFormState, AjnaPosition> & {
  rpcProvider: ethers.providers.Provider
}): Promise<AjnaActionData<AjnaPosition>> {
  const { defaultPromise, dependencies, commonPayload } = getCommonDependencies<AjnaPosition>({
    collateralToken,
    quoteToken,
    rpcProvider,
    context,
    dpmAddress,
  })
  // TODO hardcoded for now, but will be moved eventually to library
  const price = new BigNumber(16821273)

  switch (action) {
    case 'open':
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
    case 'deposit': {
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
    case 'withdraw': {
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
    case 'generate': {
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
    case 'payback': {
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

export async function getAjnaEarnParameters({
  formState: { action, depositAmount, withdrawAmount, dpmAddress },
  rpcProvider,
  collateralToken,
  quoteToken,
  context,
  position,
}: AjnaTxHandlerInput<AjnaEarnFormState, AjnaPosition> & {
  rpcProvider: ethers.providers.Provider
}): Promise<AjnaActionData<AjnaPosition>> {
  const { defaultPromise, dependencies, commonPayload } = getCommonDependencies<AjnaPosition>({
    collateralToken,
    quoteToken,
    rpcProvider,
    context,
    dpmAddress,
  })
  // TODO hardcoded for now, but will be moved eventually to library
  const price = new BigNumber(16821273)

  // TODO adjust actions for earn
  switch (action) {
    case 'open':
      if (!depositAmount) {
        return defaultPromise
      }
      return strategies.ajna.open(
        {
          ...commonPayload,
          quoteAmount: zero,
          collateralAmount: depositAmount,
          price,
        },
        dependencies,
      )
    case 'deposit': {
      if (!depositAmount) {
        return defaultPromise
      }
      return strategies.ajna.depositBorrow(
        {
          ...commonPayload,
          quoteAmount: zero,
          collateralAmount: depositAmount,
          price,
          position,
        },
        dependencies,
      )
    }
    case 'withdraw': {
      if (!withdrawAmount) {
        return defaultPromise
      }
      return strategies.ajna.paybackWithdraw(
        {
          ...commonPayload,
          quoteAmount: zero,
          collateralAmount: withdrawAmount,
          position,
        },
        dependencies,
      )
    }
    default:
      return defaultPromise
  }
}
