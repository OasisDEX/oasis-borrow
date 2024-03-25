import BigNumber from 'bignumber.js'
import { validateParameters } from 'blockchain/better-calls/dpm-account'
import { GasMultiplier } from 'blockchain/better-calls/utils'
import { getOverrides } from 'blockchain/better-calls/utils/get-overrides'
import { getTransactionFee } from 'blockchain/transaction-fee'
import type { ethers } from 'ethers'
import type { OmniTxData } from 'features/omni-kit/hooks'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import { zero } from 'helpers/zero'
import { combineLatest, from, of } from 'rxjs'
import { catchError, first, startWith, switchMap } from 'rxjs/operators'

export const estimateOmniGas$ = ({
  networkId,
  proxyAddress,
  signer,
  txData,
  sendAsSinger = false,
}: {
  networkId: OmniSupportedNetworkIds
  proxyAddress: string
  signer: ethers.Signer
  txData: OmniTxData
  sendAsSinger?: boolean
}) =>
  combineLatest(
    from(validateParameters({ signer, networkId, proxyAddress })),
    from(getOverrides(signer)),
  ).pipe(
    switchMap(([{ dpm }, override]) => {
      const estimateGasRequest = sendAsSinger
        ? signer.estimateGas({
            ...override,
            to: txData.to,
            data: txData.data,
            value: txData.value,
          })
        : dpm.estimateGas.execute(txData.to, txData.data, {
            ...override,
            value: txData.value,
          })

      return from(
        estimateGasRequest.then((val) =>
          new BigNumber(val.toString()).multipliedBy(GasMultiplier).decimalPlaces(0),
        ),
      ).pipe(
        switchMap(async (gasAmount) => {
          const feeData = await getTransactionFee({
            estimatedGas: gasAmount.toString(),
            networkId,
          })

          if (!feeData) {
            return {
              usdValue: zero,
              gasAmount,
              isSuccessful: false,
              isCompleted: true,
            }
          }

          return {
            usdValue: new BigNumber(feeData.feeUsd),
            gasAmount,
            isSuccessful: true,
            isCompleted: true,
          }
        }),
      )
    }),
    first(),
    startWith({
      isSuccessful: false,
      isCompleted: false,
      gasAmount: zero,
      usdValue: zero,
    }),
    catchError((error) => {
      console.warn('Gas estimation error', error)
      return of({
        isSuccessful: false,
        isCompleted: true,
        gasAmount: zero,
        usdValue: zero,
      })
    }),
  )
