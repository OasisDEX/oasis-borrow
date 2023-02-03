import { strategies } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { callLibraryWithDpmProxy } from 'blockchain/calls/oasisActions'
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
import { ten } from 'helpers/zero'
import { useEffect, useState } from 'react'
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
  const { depositAmount, generateAmount, proxyAddress } = formState

  const quotePrecision = getToken(quoteToken).precision
  const collateralPrecision = getToken(collateralToken).precision
  const defaultPromise: Promise<ActionData> = new Promise((resolve) => resolve({} as ActionData))

  const dependencies = {
    provider: rpcProvider,
    poolInfoAddress: context.ajnaPoolInfo.address,
    ajnaProxyActions: context.ajnaProxyActions.address,
    WETH: context.tokens.ETH.address,
  }

  switch (formState.action) {
    case 'open':
      if (!depositAmount || !generateAmount || !proxyAddress) {
        return defaultPromise
      }
      return await strategies.ajna.open(
        {
          poolAddress: context.ajnaPoolPairs[tokenPair].address,
          collateralAmount: depositAmount.times(ten.pow(collateralPrecision)),
          debtAmount: generateAmount.times(ten.pow(quotePrecision)),
          dpmProxyAddress: proxyAddress,
          // TODO hardcoded for now, but will be moved eventually to library
          price: new BigNumber(16821273),
        },
        dependencies,
      )
    case 'deposit': {
      // return await strategies.ajna.deposit({})
      return defaultPromise
    }
    case 'withdraw': {
      // return await strategies.ajna.withdraw({})
      return defaultPromise
    }
    case 'generate': {
      // return await strategies.ajna.generate({})
      return defaultPromise
    }
    case 'payback': {
      // return await strategies.ajna.payback({})
      return defaultPromise
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
    form: { state },
    tx: { setTxDetails, setSimulation },
    environment: { collateralToken, quoteToken, ethPrice },
  } = useAjnaBorrowContext()

  const [txData, setTxData] = useState<TxData>()

  const { proxyAddress } = state

  useEffect(() => {
    if (txHelpers && context && proxyAddress) {
      void getTxDetails({
        rpcProvider: context.rpcProvider,
        formState: state,
        collateralToken,
        quoteToken,
        context,
      }).then((data) => {
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
    }
  }, [state])

  if (!txHelpers || !txData || !proxyAddress) {
    return () => console.warn('no txHelpers or txData or proxyAddress')
  }

  return () =>
    txHelpers
      .sendWithGasEstimation(callLibraryWithDpmProxy, {
        kind: TxMetaKind.libraryCall,
        proxyAddress,
        ...txData,
      })
      .pipe(takeWhileInclusive((txState) => !takeUntilTxState.includes(txState.status)))
      .subscribe((txState) => handleTransaction({ txState, ethPrice, setTxDetails }))
}
