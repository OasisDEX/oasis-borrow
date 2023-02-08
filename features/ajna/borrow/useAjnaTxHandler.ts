import { strategies, views } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { callOasisActionsWithDpmProxy } from 'blockchain/calls/oasisActions'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { Context } from 'blockchain/network'
import { getToken } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { ethers } from 'ethers'
import { AjnaBorrowFormState } from 'features/ajna/borrow/state/ajnaBorrowFormReducto'
import { AjnaPoolPairs } from 'features/ajna/common/types'
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import { takeUntilTxState } from 'features/automation/api/automationTxHandlers'
import { CancellationPromiseToken, makeCancellablePromise } from 'helpers/cancellablePromis'
import { TX_DATA_CHANGE } from 'helpers/gasEstimate'
import { handleTransaction } from 'helpers/handleTransaction'
import { useObservable } from 'helpers/observableHook'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import { zero } from 'helpers/zero'
import { useState } from 'react'
import { takeWhileInclusive } from 'rxjs-take-while-inclusive'

import { AjnaPosition } from '@oasisdex/oasis-actions/lib/src/helpers/ajna'

interface AjnaTxHandlerInput {
  formState: AjnaBorrowFormState
  collateralToken: string
  quoteToken: string
  context: Context
}

interface TxData {
  data: string
  to: string
  value: string
}

interface ActionData {
  simulation: {
    targetPosition: AjnaPosition
    swap: any[]
  }
  tx: TxData
}

export interface OasisActionCallData extends TxData {
  kind: TxMetaKind.libraryCall
  proxyAddress: string
}

async function getTxDetails({
  formState,
  rpcProvider,
  collateralToken,
  quoteToken,
  context,
}: AjnaTxHandlerInput & {
  rpcProvider: ethers.providers.Provider
}): Promise<ActionData> {
  const tokenPair = `${collateralToken}-${quoteToken}` as AjnaPoolPairs
  const { depositAmount, generateAmount, paybackAmount, withdrawAmount, dpmAddress } = formState
  const defaultPromise = Promise.resolve({} as ActionData)

  if (!dpmAddress) {
    return defaultPromise
  }

  const anjaPosition = await views.ajna.getPosition(
    {
      proxyAddress: dpmAddress,
      poolAddress: context.ajnaPoolPairs[tokenPair].address,
    },
    { poolInfoAddress: context.ajnaPoolInfo.address, provider: rpcProvider },
  )

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
    position: anjaPosition,
  }

  // TODO hardcoded for now, but will be moved eventually to library
  const price = new BigNumber(16821273)

  switch (formState.action) {
    case 'open':
    case 'deposit': {
      if (!depositAmount) {
        return defaultPromise
      }
      return await strategies.ajna[formState.action === 'open' ? 'open' : 'depositBorrow'](
        {
          ...commonPayload,
          quoteAmount: generateAmount || zero,
          collateralAmount: depositAmount,
          price,
        },
        dependencies,
      )
    }
    case 'withdraw': {
      if (!withdrawAmount) {
        return defaultPromise
      }
      return await strategies.ajna.paybackWithdraw(
        {
          ...commonPayload,
          quoteAmount: paybackAmount || zero,
          collateralAmount: withdrawAmount,
        },
        dependencies,
      )
    }
    case 'generate': {
      if (!generateAmount) {
        return defaultPromise
      }
      return await strategies.ajna.depositBorrow(
        {
          ...commonPayload,
          quoteAmount: generateAmount,
          collateralAmount: depositAmount || zero,
          price,
        },
        dependencies,
      )
    }
    case 'payback': {
      if (!paybackAmount) {
        return defaultPromise
      }
      return await strategies.ajna.paybackWithdraw(
        {
          ...commonPayload,
          quoteAmount: paybackAmount,
          collateralAmount: withdrawAmount || zero,
        },
        dependencies,
      )
    }
    default:
      return defaultPromise
  }
}

type AjnaTxHandler = () => void

export function useAjnaTxHandler(): AjnaTxHandler {
  const { txHelpers$, context$, uiChanges } = useAppContext()
  const [txHelpers] = useObservable(txHelpers$)
  const [context] = useObservable(context$)
  const {
    form: { state },
    tx: { setTxDetails },
    environment: { collateralToken, quoteToken, ethPrice },
    position: { setSimulation, setIsLoadingSimulation },
  } = useAjnaBorrowContext()

  const [txData, setTxData] = useState<TxData>()
  const [promiseToken, setPromiseToken] = useState<CancellationPromiseToken>()
  const { dpmAddress } = state

  useDebouncedEffect(
    () => {
      if (txHelpers && context && dpmAddress) {
        promiseToken?.cancel()
        const token = new CancellationPromiseToken()
        setPromiseToken(token)
        setIsLoadingSimulation(true)
        makeCancellablePromise(
          getTxDetails({
            rpcProvider: context.rpcProvider,
            formState: state,
            collateralToken,
            quoteToken,
            context,
          }),
          token,
        )
          .then((data) => {
            setTxData(data?.tx)
            setSimulation(data?.simulation.targetPosition)
            setIsLoadingSimulation(false)

            uiChanges.publish(TX_DATA_CHANGE, {
              type: 'tx-data',
              transaction: callOasisActionsWithDpmProxy,
              data: {
                kind: TxMetaKind.libraryCall,
                proxyAddress: dpmAddress,
                ...data?.tx,
              },
            })
          })
          .catch((error) => {
            console.error(error)
          })
      }
    },
    [
      state.depositAmount?.toString(),
      state.generateAmount?.toString(),
      state.withdrawAmount?.toString(),
      state.paybackAmount?.toString(),
    ],
    250,
  )

  if (!txHelpers || !txData || !dpmAddress) {
    return () => console.warn('no txHelpers or txData or proxyAddress')
  }

  return () =>
    txHelpers
      .sendWithGasEstimation(callOasisActionsWithDpmProxy, {
        kind: TxMetaKind.libraryCall,
        proxyAddress: dpmAddress,
        ...txData,
      })
      .pipe(takeWhileInclusive((txState) => !takeUntilTxState.includes(txState.status)))
      .subscribe((txState) => handleTransaction({ txState, ethPrice, setTxDetails }))
}
