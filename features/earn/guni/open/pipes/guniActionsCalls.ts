import { TxStatus } from '@oasisdex/transactions'
import { BigNumber } from 'bignumber.js'
import type { CallDef } from 'blockchain/calls/callsHelpers'
import { openGuniMultiplyVault } from 'blockchain/calls/proxyActions/proxyActions'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { amountToWei } from 'blockchain/utils'
import type { Quote } from 'features/exchange/exchange'
import { VaultType } from 'features/generalManageVault/vaultType.types'
import { jwtAuthGetToken } from 'features/shared/jwt'
import { parseVaultIdFromReceiptLogs } from 'features/shared/transactions'
import { saveVaultUsingApi$ } from 'features/shared/vaultApi'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import { transactionToX } from 'helpers/form'
import type { TxError } from 'helpers/types'
import { zero } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'
import { of } from 'rxjs'
import { catchError, startWith } from 'rxjs/operators'
import type { DssGuniProxyActions as GuniProxyActions, GuniToken } from 'types/web3-v1-contracts'

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
  call: (_, { contract, chainId }) => {
    return contract<GuniProxyActions>(
      getNetworkContracts(NetworkIds.MAINNET, chainId).guniProxyActions,
    ).methods.getOtherTokenAmount
  },
  prepareArgs: ({ token, leveragedAmount }, { chainId }) => {
    const { tokens, guniResolver } = getNetworkContracts(NetworkIds.MAINNET, chainId)
    const guniToken = tokens[token]
    return [guniToken.address, guniResolver, amountToWei(leveragedAmount, 'DAI').toFixed(0), 6] // TODO: remove fixed precision
  },
  postprocess: (token2Amount: any) => new BigNumber(token2Amount).div(new BigNumber(10).pow(18)),
}

export const getGuniMintAmount: CallDef<
  { token: string; amountOMax: BigNumber; amount1Max: BigNumber },
  { amount0: BigNumber; amount1: BigNumber; mintAmount: BigNumber }
> = {
  call: ({ token }, { contract, chainId }) => {
    const guniToken = getNetworkContracts(NetworkIds.MAINNET, chainId).tokens[token]
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
              LendingProtocol.Maker,
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
