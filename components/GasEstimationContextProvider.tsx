import BigNumber from 'bignumber.js'
import { TxPayloadChange, TX_DATA_CHANGE } from 'features/automation/protection/common/UITypes/AddFormChange'
import { GasEstimationStatus, HasGasEstimation } from 'helpers/form'
import { useObservable } from 'helpers/observableHook'
import { useUIChanges } from 'helpers/uiChangesHook'
import React, { useContext, useEffect, useState, useMemo } from 'react'

import { WithChildren } from '../helpers/types'
import { useAppContext } from './AppContextProvider'

export type GasEstimationContex = {
  isSuccessful : boolean,
  gasAmount : BigNumber,
  usdValue : BigNumber,
}

export const gasEstimationContext = React.createContext<GasEstimationContex | undefined>(undefined)

export function isGasEstimationContextAvailable(): boolean {
  return !!useContext(gasEstimationContext)
}

export function useGasEstimationContext(): GasEstimationContex {
  const ac = useContext(gasEstimationContext)
  if (!ac) {
    throw new Error("AppContext not available! useAppContext can't be used serverside")
  }
  return ac
}

/*
  This component is providing streams of data used for rendering whole app (AppContext).
  It depends on web3 - which for now is only provided by Client side.
  To block rendering of given page eg. '/trade' setup conditional rendering
  on top of that page with isAppContextAvailable.
*/

export function GasEstimationContextProvider({ children }: WithChildren) {
  const [gasEstimate, setEstimate] = useState<GasEstimationContex | undefined>(undefined)
  const { addGasEstimation$ } = useAppContext();

  const [txData] = useUIChanges<TxPayloadChange>(TX_DATA_CHANGE)

  const gasEstimationData$ = useMemo(() => {
    return addGasEstimation$(
      { gasEstimationStatus: GasEstimationStatus.unset },
      ({ estimateGas }) => estimateGas(txData.transaction, txData.data),
    )
  }, [txData])

  const [gasEstimationData] = useObservable(gasEstimationData$)

  const estimate : HasGasEstimation | undefined = gasEstimationData?(gasEstimationData as HasGasEstimation):undefined;

  useEffect(() => {
      
    setEstimate({
      gasAmount:estimate?new BigNumber(estimate.gasEstimation!):new BigNumber(0),
      isSuccessful:!!estimate,
      usdValue:estimate?estimate.gasEstimationUsd!:new BigNumber(0),
    })
   // TODO: Add actual estimation here
  }, [])

  return <gasEstimationContext.Provider value={gasEstimate}>{children}</gasEstimationContext.Provider>
}

