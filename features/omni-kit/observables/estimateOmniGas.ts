import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { validateParameters } from 'blockchain/better-calls/dpm-account'
import { GasMultiplier } from 'blockchain/better-calls/utils'
import { getOverrides } from 'blockchain/better-calls/utils/get-overrides'
import type { GasPriceParams } from 'blockchain/prices.types'
import { getOptimismTransactionFee } from 'blockchain/transaction-fee'
import type { ethers } from 'ethers'
import { omniL2SupportedNetworks } from 'features/omni-kit/constants'
import type { OmniTxData } from 'features/omni-kit/hooks'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import { zero } from 'helpers/zero'
import { combineLatest, from, of } from 'rxjs'
import { catchError, first, startWith, switchMap } from 'rxjs/operators'

export const estimateOmniGas$ = ({
  signer,
  networkId,
  proxyAddress,
  txData,
  gasPrice,
  ethPrice,
}: {
  gasPrice: GasPriceParams
  ethPrice: BigNumber
  signer: ethers.Signer
  networkId: OmniSupportedNetworkIds
  proxyAddress: string
  txData: OmniTxData
}) =>
  combineLatest(
    from(validateParameters({ signer, networkId, proxyAddress })),
    from(getOverrides(signer)),
  ).pipe(
    switchMap(([{ dpm }, override]) =>
      from(
        dpm.estimateGas
          .execute(txData.to, txData.data, {
            ...override,
            value: txData.value,
          })
          .then((val) =>
            new BigNumber(val.toString()).multipliedBy(GasMultiplier).decimalPlaces(0),
          ),
      ).pipe(
        switchMap(async (gasAmount) => {
          let usdValue = amountFromWei(gasPrice.maxFeePerGas.times(gasAmount)).times(ethPrice)

          if (omniL2SupportedNetworks.includes(networkId)) {
            const optimismTxFeeData = await getOptimismTransactionFee({
              estimatedGas: gasAmount.toString(),
              transactionData: txData.data,
            })

            if (!optimismTxFeeData) {
              return {
                usdValue: zero,
                gasAmount,
                isSuccessful: false,
                isCompleted: true,
              }
            }

            usdValue = amountFromWei(
              new BigNumber(optimismTxFeeData.l1Fee).plus(optimismTxFeeData.l2Fee),
            ).times(optimismTxFeeData.ethUsdPriceUSD)
          }

          return {
            usdValue,
            gasAmount,
            isSuccessful: true,
            isCompleted: true,
          }
        }),
      ),
    ),
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
