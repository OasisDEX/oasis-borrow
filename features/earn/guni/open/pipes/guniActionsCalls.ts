import { TxStatus } from '@oasisdex/transactions'
import { BigNumber } from 'bignumber.js'
import { CallDef } from 'blockchain/calls/callsHelpers'
import { openGuniMultiplyVault } from 'blockchain/calls/proxyActions/proxyActions'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { amountToWei } from 'blockchain/utils'
import { TxHelpers } from 'components/AppContext'
import { Quote } from 'features/exchange/exchange'
import { transactionToX } from 'helpers/form'
import { zero } from 'helpers/zero'
import { of } from 'rxjs'
import { catchError, startWith } from 'rxjs/operators'
import { DssGuniProxyActions as GuniProxyActions } from 'types/ethers-contracts/DssGuniProxyActions'
import { GuniToken } from 'types/ethers-contracts/GuniToken'

import { TxError } from '../../../../../helpers/types'
import { VaultType } from '../../../../generalManageVault/vaultType'
import { parseVaultIdFromReceiptLogs } from '../../../../shared/transactions'
import { saveVaultUsingApi$ } from '../../../../shared/vaultApi'
import { jwtAuthGetToken } from '../../../../termsOfService/jwt'

export type TxChange =
  | { kind: 'txWaitingForApproval' }
  | {
      kind: 'txInProgress'
      openTxHash: string
    }
  | {
      kind: 'txFailure'
      txError?: TxError
    }
  | {
      kind: 'txSuccess'
      id: BigNumber
    }

export const getToken1Balance: CallDef<{ token: string; leveragedAmount: BigNumber }, BigNumber> = {
  call: (_, { contract, guniProxyActions }) => {
    return contract<GuniProxyActions>(guniProxyActions).methods.getOtherTokenAmount
  },
  prepareArgs: ({ token, leveragedAmount }, context) => {
    const guniToken = context.tokens[token]
    return [
      guniToken.address,
      context.guniResolver,
      amountToWei(leveragedAmount, 'DAI').toFixed(0),
      6,
    ] // TODO: remove fixed precision
  },
  postprocess: (token2Amount: any) => new BigNumber(token2Amount).div(new BigNumber(10).pow(18)),
}

export const getGuniMintAmount: CallDef<
  { token: string; amountOMax: BigNumber; amount1Max: BigNumber },
  { amount0: BigNumber; amount1: BigNumber; mintAmount: BigNumber }
> = {
  call: ({ token }, { contract, tokens }) => {
    const guniToken = tokens[token]
    return contract<GuniToken>(guniToken).methods.getMintAmounts
  },
  prepareArgs: ({ amountOMax, amount1Max }) => {
    return [amountToWei(amountOMax, 'DAI').toFixed(0), amountToWei(amount1Max, 'USDC').toFixed(0)]
  },
  postprocess: ({ amount0, amount1, mintAmount }: any) => {
    return {
      amount0: new BigNumber(amount0).div(new BigNumber(10).pow(18)),
      amount1: new BigNumber(amount1).div(new BigNumber(10).pow(6)),
      mintAmount: new BigNumber(mintAmount).div(new BigNumber(10).pow(18)),
    }
  },
}

export interface TxStateDependencies {
  depositAmount?: BigNumber
  proxyAddress?: string
  ilk: string
  token: string
  slippage: BigNumber
  account: string
  swap?: Quote
  flAmount?: BigNumber
  leveragedAmount?: BigNumber
  token0Amount?: BigNumber
  token1Amount?: BigNumber
  amount0?: BigNumber
  amount1?: BigNumber
  fromTokenAmount?: BigNumber
  toTokenAmount?: BigNumber
  minToTokenAmount?: BigNumber
  afterCollateralAmount?: BigNumber
  afterOutstandingDebt?: BigNumber
  requiredDebt?: BigNumber
  oazoFee?: BigNumber
  totalFees?: BigNumber
}

export function openGuniVault<S extends TxStateDependencies>(
  { sendWithGasEstimation }: TxHelpers,
  change: (ch: TxChange) => void,
  {
    depositAmount,
    proxyAddress,
    ilk,
    token,
    account,
    // slippage,
    toTokenAmount,
    fromTokenAmount,
    // token1Amount, // USDC
    token0Amount, // DAI
    requiredDebt,
    swap,
    minToTokenAmount,
  }: S,
) {
  return sendWithGasEstimation(openGuniMultiplyVault, {
    kind: TxMetaKind.openGuni,
    depositCollateral: depositAmount || zero,
    userAddress: account,
    proxyAddress: proxyAddress!,
    ilk,
    token,
    exchangeAddress: swap?.status === 'SUCCESS' ? swap.tx.to : '0x',
    exchangeData: swap?.status === 'SUCCESS' ? swap.tx.data : '0x',
    minToTokenAmount: minToTokenAmount || zero,
    requiredDebt: requiredDebt || zero,
    toTokenAmount: toTokenAmount || zero,
    fromTokenAmount: fromTokenAmount || zero,
    token0Amount: token0Amount || zero,
  })
    .pipe(
      transactionToX<TxChange, any>(
        { kind: 'txWaitingForApproval' },
        (txState) => of({ kind: 'txInProgress', openTxHash: (txState as any).txHash as string }),
        (txState) => {
          return of({
            kind: 'txFailure',
            txError:
              txState.status === TxStatus.Error || txState.status === TxStatus.CancelledByTheUser
                ? txState.error
                : undefined,
          })
        },
        (txState) => {
          const id = parseVaultIdFromReceiptLogs(
            txState.status === TxStatus.Success && txState.receipt,
          )

          const jwtToken = jwtAuthGetToken(account)
          if (id && jwtToken) {
            saveVaultUsingApi$(
              id,
              jwtToken,
              VaultType.Multiply,
              parseInt(txState.networkId),
            ).subscribe()
          }

          return of({
            kind: 'txSuccess',
            id: id!,
          })
        },
      ),
      startWith({ kind: 'txWaitingForApproval' } as TxChange),
      catchError(() => of({ kind: 'txFailure' } as TxChange)),
    )
    .subscribe((ch) => change(ch))
}
