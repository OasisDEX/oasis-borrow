import { strategies } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { callOasisActionsWithDpmProxy } from 'blockchain/calls/oasisActions'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { Context } from 'blockchain/network'
import { getToken } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { ethers } from 'ethers'
import { AjnaBorrowFormState } from 'features/ajna/borrow/state/ajnaBorrowFormReducto'
import { AjnaPoolPairs } from 'features/ajna/common/types'
import { AjnaBorrowPosition, useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import { takeUntilTxState } from 'features/automation/api/automationTxHandlers'
import { handleTransaction } from 'helpers/handleTransaction'
import { useObservable } from 'helpers/observableHook'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import { zero } from 'helpers/zero'
import { useState } from 'react'
import { takeWhileInclusive } from 'rxjs-take-while-inclusive'

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
  simulation: AjnaBorrowPosition
  tx: TxData
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
  const { depositAmount, generateAmount, paybackAmount, withdrawAmount, proxyAddress } = formState

  const quoteTokenPrecision = getToken(quoteToken).precision
  const collateralTokenPrecision = getToken(collateralToken).precision
  const defaultPromise = Promise.resolve({} as ActionData)

  const dependencies = {
    provider: rpcProvider,
    poolInfoAddress: context.ajnaPoolInfo.address,
    ajnaProxyActions: context.ajnaProxyActions.address,
    WETH: context.tokens.ETH.address,
  }

  if (!proxyAddress) {
    return defaultPromise
  }

  if (!context.ajnaPoolPairs[tokenPair]) {
    throw new Error(`No pool for given token pair ${tokenPair}`)
  }

  const commonPayload = {
    poolAddress: context.ajnaPoolPairs[tokenPair].address,
    dpmProxyAddress: proxyAddress,
    quoteTokenPrecision,
    collateralTokenPrecision,
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
  const { txHelpers$, context$ } = useAppContext()
  const [txHelpers] = useObservable(txHelpers$)
  const [context] = useObservable(context$)
  const {
    form: { state, updateState },
    tx: { setTxDetails, setSimulation },
    environment: { collateralToken, quoteToken, ethPrice },
  } = useAjnaBorrowContext()

  const [txData, setTxData] = useState<TxData>()

  const { proxyAddress } = state

  useDebouncedEffect(
    () => {
      if (txHelpers && context && proxyAddress) {
        updateState('isLoading', true)
        void getTxDetails({
          rpcProvider: context.rpcProvider,
          formState: state,
          collateralToken,
          quoteToken,
          context,
        })
          .then((data) => {
            updateState('isLoading', false)
            if ('tx' in data) {
              setTxData(data.tx)
              setSimulation(data.simulation)
              // TODO update it once aave sl is deployed as interface has been changed
              // uiChanges.publish(TX_DATA_CHANGE, {
              //   type: 'add-trigger',
              //   transaction: callLibraryWithDpmProxy,
              //   data: data.tx.data,
              // })
            }
          })
          .catch((error) => {
            updateState('isLoading', false)
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

  if (!txHelpers || !txData || !proxyAddress) {
    return () => console.warn('no txHelpers or txData or proxyAddress')
  }

  return () =>
    txHelpers
      .sendWithGasEstimation(callOasisActionsWithDpmProxy, {
        kind: TxMetaKind.libraryCall,
        proxyAddress,
        ...txData,
      })
      .pipe(takeWhileInclusive((txState) => !takeUntilTxState.includes(txState.status)))
      .subscribe((txState) => handleTransaction({ txState, ethPrice, setTxDetails }))
}
