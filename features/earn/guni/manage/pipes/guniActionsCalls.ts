import { TxStatus } from '@oasisdex/transactions'
import { BigNumber } from 'bignumber.js'
import type { CallDef } from 'blockchain/calls/callsHelpers'
import { closeGuniVaultCall } from 'blockchain/calls/proxyActions/proxyActions'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { getToken } from 'blockchain/tokensMetadata'
import type { Vault } from 'blockchain/vaults.types'
import type { Quote } from 'features/exchange/exchange'
import { VaultType } from 'features/generalManageVault/vaultType.types'
import type { ManageChange } from 'features/multiply/manage/pipes/manageMultiplyVaultTransactions.types'
import { parseVaultIdFromReceiptLogs } from 'features/shared/transactions'
import { saveVaultUsingApi$ } from 'features/shared/vaultApi'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import { transactionToX } from 'helpers/form'
import { zero } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'
import type { Observable } from 'rxjs'
import { of } from 'rxjs'
import { catchError, first, startWith, switchMap } from 'rxjs/operators'
import type { GuniToken } from 'types/web3-v1-contracts'

export const getUnderlyingBalances: CallDef<
  { token: string },
  { amount0: BigNumber; amount1: BigNumber }
> = {
  call: ({ token }, { contract, chainId }) => {
    const guniToken = getNetworkContracts(NetworkIds.MAINNET, chainId).tokens[token]
    return contract<GuniToken>(guniToken).methods.getUnderlyingBalances
  },
  prepareArgs: () => [],
  postprocess: ({ 0: amount0, 1: amount1 }: any, { token }) => {
    const { token0, token1 } = getToken(token)
    const token0Precision = getToken(token0!).precision
    const token1Precision = getToken(token1!).precision

    return {
      amount0: new BigNumber(amount0).div(new BigNumber(10).pow(token0Precision)),
      amount1: new BigNumber(amount1).div(new BigNumber(10).pow(token1Precision)),
    }
  },
}

export const getTotalSupply: CallDef<{ token: string }, BigNumber> = {
  call: ({ token }, { contract, chainId }) => {
    const guniToken = getNetworkContracts(NetworkIds.MAINNET, chainId).tokens[token]
    return contract<GuniToken>(guniToken).methods.totalSupply
  },
  prepareArgs: () => [],
  postprocess: (total: any, { token }) => {
    const { precision } = getToken(token)
    return new BigNumber(total).div(new BigNumber(10).pow(precision))
  },
}

interface CloseGuniTxStateDependencies {
  vault: Vault
  account?: string
  swap?: Quote
  requiredDebt?: BigNumber
  minToTokenAmount?: BigNumber
  proxyAddress?: string
  fromTokenAmount?: BigNumber
  toTokenAmount?: BigNumber
}

export function closeGuniVault<S extends CloseGuniTxStateDependencies>(
  txHelpers$: Observable<TxHelpers>,
  change: (ch: ManageChange) => void,
  {
    proxyAddress,
    account,
    toTokenAmount,
    fromTokenAmount,
    requiredDebt,
    swap,
    minToTokenAmount,
    vault,
  }: S,
) {
  return txHelpers$
    .pipe(
      first(),
      switchMap(({ sendWithGasEstimation }) => {
        return sendWithGasEstimation(closeGuniVaultCall, {
          kind: TxMetaKind.closeGuni,
          token: vault.token,
          ilk: vault.ilk,
          userAddress: account || '',
          requiredDebt: requiredDebt || zero,
          cdpId: vault.id.toString(),
          fromTokenAmount: fromTokenAmount || zero,
          toTokenAmount: toTokenAmount || zero,
          minToTokenAmount: minToTokenAmount || zero,
          exchangeAddress: swap?.status === 'SUCCESS' ? swap.tx.to : '0x',
          exchangeData: swap?.status === 'SUCCESS' ? swap.tx.data : '0x',
          proxyAddress: proxyAddress!,
        }).pipe(
          transactionToX<ManageChange, any>(
            { kind: 'manageWaitingForApproval' },
            (txState) =>
              of({
                kind: 'manageInProgress',
                manageTxHash: (txState as any).txHash as string,
              }),
            (txState) => {
              return of({
                kind: 'manageFailure',
                txError:
                  txState.status === TxStatus.Error ||
                  txState.status === TxStatus.CancelledByTheUser
                    ? txState.error
                    : undefined,
              })
            },
            (txState) => {
              const id = parseVaultIdFromReceiptLogs(
                txState.status === TxStatus.Success && txState.receipt,
              )

              if (id) {
                saveVaultUsingApi$(
                  id,
                  VaultType.Multiply,
                  parseInt(txState.networkId),
                  LendingProtocol.Maker,
                  account!,
                ).subscribe()
              }

              return of({
                kind: 'manageSuccess',
                id: id!,
              })
            },
          ),
          startWith({ kind: 'manageWaitingForApproval' } as ManageChange),
          catchError(() => of({ kind: 'manageFailure' } as ManageChange)),
        )
      }),
    )
    .subscribe((ch) => change(ch))
}
