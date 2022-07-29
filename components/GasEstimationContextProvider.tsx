import BigNumber from 'bignumber.js'
import {
  TxPayloadChangeBase,
} from 'features/automation/protection/common/UITypes/AddFormChange'
import { GasEstimationStatus, HasGasEstimation } from 'helpers/form'
import { TX_DATA_CHANGE } from 'helpers/gasEstimate'
import { useObservable } from 'helpers/observableHook'
import { useUIChanges } from 'helpers/uiChangesHook'
import React, { useContext, useEffect, useMemo,useState } from 'react'

import { WithChildren } from '../helpers/types'
import { isAppContextAvailable, useAppContext } from './AppContextProvider'

export type GasEstimationContex = {
  isSuccessful: boolean
  isCompleted: boolean
  gasAmount: BigNumber
  usdValue: BigNumber
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
  if (!isAppContextAvailable()) {
    return null
  }
  const [gasEstimate, setEstimate] = useState<GasEstimationContex | undefined>(undefined)

  const { addGasEstimation$ } = useAppContext()

  const [txData] = useUIChanges<TxPayloadChangeBase>(TX_DATA_CHANGE)
  console.log('txData', txData)
  const gasEstimationData$ = useMemo(() => {
    return addGasEstimation$(
      { gasEstimationStatus: GasEstimationStatus.unset },
      ({ estimateGas }) => estimateGas(txData.transaction, txData.tx.data),
    )
  }, [txData])

  const [gasEstimationData] = useObservable(gasEstimationData$)

  const estimate: HasGasEstimation | undefined = gasEstimationData
    ? (gasEstimationData as HasGasEstimation)
    : undefined

  useEffect(() => {
    console.log('heheheheh', estimate)
    setEstimate({
      gasAmount: estimate ? new BigNumber(estimate.gasEstimation!) : new BigNumber(0),
      isSuccessful: !!estimate && estimate.gasEstimationStatus == GasEstimationStatus.calculated,
      usdValue: estimate ? estimate.gasEstimationUsd! : new BigNumber(0),
      isCompleted:
        !!estimate &&
        (estimate.gasEstimationStatus == GasEstimationStatus.error ||
          estimate.gasEstimationStatus == GasEstimationStatus.calculated),
    })
    // TODO: Add actual estimation here
  }, [gasEstimationData])

  return (
    <gasEstimationContext.Provider value={gasEstimate}>{children}</gasEstimationContext.Provider>
  )
}
