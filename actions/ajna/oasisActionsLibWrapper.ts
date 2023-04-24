import { AjnaEarnPosition, AjnaPosition, strategies } from '@oasisdex/oasis-actions-poc'
import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { Context } from 'blockchain/network'
import { getToken } from 'blockchain/tokensMetadata'
import { ethers } from 'ethers'
import { AjnaFormState, AjnaGenericPosition, AjnaPoolPairs } from 'features/ajna/common/types'
import { getAjnaPoolData } from 'features/ajna/positions/common/helpers/getAjnaPoolData'
import { getAjnaEarnData } from 'features/ajna/positions/earn/helpers/getAjnaEarnData'
import { AjnaEarnFormState } from 'features/ajna/positions/earn/state/ajnaEarnFormReducto'
import { zero } from 'helpers/zero'

import { Strategy } from '@oasisdex/oasis-actions-poc/src/types/common'

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
}: AjnaTxHandlerInput): Promise<Strategy<AjnaGenericPosition> | undefined> {
  const tokenPair = `${collateralToken}-${quoteToken}` as AjnaPoolPairs
  const defaultPromise = Promise.resolve(undefined)

  const quoteTokenPrecision = getToken(quoteToken).precision
  const collateralTokenPrecision = getToken(collateralToken).precision

  const { action, dpmAddress } = state
  const addressesConfig = getNetworkContracts(context.chainId)

  const dependencies = {
    ajnaProxyActions: addressesConfig.ajnaProxyActions.address,
    poolInfoAddress: addressesConfig.ajnaPoolInfo.address,
    provider: rpcProvider,
    WETH: addressesConfig.tokens.ETH.address,
    getPoolData: getAjnaPoolData,
  }

  if (!addressesConfig.ajnaPoolPairs[tokenPair]) {
    throw new Error(`No pool for given token pair: ${tokenPair}`)
  }

  const commonPayload = {
    collateralTokenPrecision,
    dpmProxyAddress: dpmAddress,
    poolAddress: addressesConfig.ajnaPoolPairs[tokenPair].address,
    quoteTokenPrecision,
  }

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
          isStakingNft: true,
          collateralPrice,
          quotePrice,
        },
        {
          ...dependencies,
          getEarnData: getAjnaEarnData,
          rewardsManagerAddress: getNetworkContracts(context.chainId).ajnaRewardsManager.address,
        },
      )
    }
    case 'deposit-earn': {
      const { price, depositAmount } = state as AjnaEarnFormState

      return strategies.ajna.earn.depositAndAdjust(
        {
          ...commonPayload,
          price: price!,
          collateralAmount: zero,
          quoteAmount: depositAmount || zero,
          position: position as AjnaEarnPosition,
          isStakingNft: true,
          collateralPrice,
          quotePrice,
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
          collateralAmount: zero,
          quoteAmount: withdrawAmount || zero,
          position: position as AjnaEarnPosition,
          collateralPrice,
          quotePrice,
        },
        { ...dependencies },
      )
    }
    default:
      return defaultPromise
  }
}
