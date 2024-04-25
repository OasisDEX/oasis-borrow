import BigNumber from 'bignumber.js'
import { estimateGas } from 'blockchain/better-calls/dpm-account'
import type { NetworkIds } from 'blockchain/networks'
import { getTransactionFee } from 'blockchain/transaction-fee'
import type { ethers } from 'ethers'
import type { TriggerTransaction } from 'helpers/lambda/triggers'
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation.types'
import { GasEstimationStatus } from 'helpers/types/HasGasEstimation.types'
import { useEffect, useState } from 'react'

export interface GasEstimationParams {
  signer?: ethers.Signer
  networkId: NetworkIds
  transaction?: TriggerTransaction
}

export function useGasEstimation({
  signer,
  transaction,
  networkId,
}: GasEstimationParams): HasGasEstimation {
  const [resultState, setResultState] = useState<HasGasEstimation>({
    gasEstimationStatus: GasEstimationStatus.unset,
  })

  useEffect(() => {
    if (signer && transaction) {
      setResultState({ gasEstimationStatus: GasEstimationStatus.calculating })
      estimateGas({
        ...transaction,
        signer,
        networkId,
      })
        .then(async (_gas) => {
          const fee = await getTransactionFee({ estimatedGas: _gas, networkId })
          return { fee, gas: _gas }
        })
        .then(({ fee, gas: _gas }) => {
          if (!fee) {
            setResultState({ gasEstimationStatus: GasEstimationStatus.error })
            return
          }
          setResultState({
            gasEstimationStatus: GasEstimationStatus.calculated,
            gasEstimationEth: new BigNumber(fee.fee),
            gasEstimation: parseInt(_gas),
            gasEstimationUsd: new BigNumber(fee.feeUsd),
          })
        })
        .catch((error) => {
          setResultState({ gasEstimationStatus: GasEstimationStatus.error })
          console.error('Error estimating gas', error)
        })
    }
  }, [transaction, signer, networkId])

  return resultState
}
