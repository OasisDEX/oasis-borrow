import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { validateParameters } from 'blockchain/better-calls/dpm-account'
import { GasMultiplier } from 'blockchain/better-calls/utils'
import { getOverrides } from 'blockchain/better-calls/utils/get-overrides'
import type { GasPriceParams } from 'blockchain/prices.types'
import type { ethers } from 'ethers'
import type { OmniTxData } from 'features/omni-kit/hooks'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import { zero } from 'helpers/zero'
import { combineLatest, from, of } from 'rxjs'
import { catchError, first, map, startWith, switchMap } from 'rxjs/operators'

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
          .then((val) => new BigNumber(val.toString()).multipliedBy(GasMultiplier).toFixed(0)),
      ).pipe(
        map((gasAmount) => ({
          usdValue: amountFromWei(gasPrice.maxFeePerGas.times(gasAmount)).times(ethPrice),
          gasAmount,
          isSuccessful: true,
          isCompleted: true,
        })),
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
