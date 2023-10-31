import BigNumber from 'bignumber.js'
import type { TransactionDef } from 'blockchain/calls/callsHelpers'
import type { TxData } from 'helpers/context/TxData'
import { TX_DATA_CHANGE } from 'helpers/gasEstimate.constants'
import type { TxPayloadChange } from 'helpers/gasEstimate.types'
import { useObservable } from 'helpers/observableHook'
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation.types'
import { GasEstimationStatus } from 'helpers/types/HasGasEstimation.types'
import type { WithChildren } from 'helpers/types/With.types'
import { useUIChanges } from 'helpers/uiChangesHook'
import { zero } from 'helpers/zero'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { of } from 'rxjs'

import { isProductContextAvailable, useProductContext } from './ProductContextProvider'

export type GasEstimationContext = {
  isSuccessful: boolean
  isCompleted: boolean
  gasAmount: BigNumber
  usdValue: BigNumber
}

export const gasEstimationContext = createContext<GasEstimationContext | undefined>(undefined)

export const useGasEstimationContext = () => {
  const gasContext = useContext(gasEstimationContext)
  if (!gasContext) {
    throw new Error(
      "Gas estimation context not available! useGasEstimationContext can't be used serverside",
    )
  }
  return gasContext
}

/*
  This component is providing data regarding gas based on txData received from uiChanges.
*/

export function GasEstimationContextProvider({ children }: WithChildren) {
  if (!isProductContextAvailable()) {
    return null
  }
  const [gasEstimate, setEstimate] = useState<GasEstimationContext | undefined>(undefined)
  const { addGasEstimation$ } = useProductContext()

  const [txData] = useUIChanges<TxPayloadChange>(TX_DATA_CHANGE)

  const gasEstimationData$ = useMemo(() => {
    if (!txData) {
      return of(undefined)
    }

    const transactionDef = txData!.transaction as TransactionDef<TxData>
    const transactionData = txData.data as TxData

    return addGasEstimation$(
      { gasEstimationStatus: GasEstimationStatus.unset },
      ({ estimateGas }) => estimateGas(transactionDef, transactionData),
    )
  }, [txData])

  const [gasEstimationData] = useObservable(gasEstimationData$)

  const estimate: HasGasEstimation | undefined = gasEstimationData
    ? (gasEstimationData as HasGasEstimation)
    : undefined

  useEffect(() => {
    setEstimate({
      gasAmount: estimate ? new BigNumber(estimate.gasEstimation!) : zero,
      isSuccessful: !!estimate && estimate.gasEstimationStatus === GasEstimationStatus.calculated,
      usdValue: estimate?.gasEstimationUsd ? estimate.gasEstimationUsd : zero,
      isCompleted:
        !!estimate &&
        (estimate.gasEstimationStatus === GasEstimationStatus.error ||
          estimate.gasEstimationStatus === GasEstimationStatus.calculated),
    })
  }, [gasEstimationData])

  return (
    <gasEstimationContext.Provider value={gasEstimate}>{children}</gasEstimationContext.Provider>
  )
}
