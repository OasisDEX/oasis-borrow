import { BigNumber } from 'bignumber.js'
import { DssGuniProxyActions } from 'types/ethers-contracts/DssGuniProxyActions'
import { CallDef } from 'blockchain/calls/callsHelpers'
import { amountToWei } from 'blockchain/utils'
import { TxHelpers } from 'components/AppContext'
import { ContextConnected } from 'blockchain/network'
import { getQuote$, getTokenMetaData } from 'features/exchange/exchange'
import { catchError, first, startWith, switchMap } from 'rxjs/operators'
import { one, zero } from 'helpers/zero'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { openGuniMultiplyVault } from 'blockchain/calls/proxyActions'
import { of } from 'rxjs'
import { transactionToX } from 'helpers/form'
import { TxStatus } from '@oasisdex/transactions'
import { parseVaultIdFromReceiptLogs } from 'features/openVault/openVaultTransactions'

type TxChange =
  | { kind: 'txWaitingForApproval' }
  | {
      kind: 'txInProgress'
      openTxHash: string
    }
  | {
      kind: 'txFailure'
      txError?: any
    }
  | {
      kind: 'txSuccess'
      id: BigNumber
    }

export const getToken1Balance: CallDef<{ token: string; leveragedAmount: BigNumber }, BigNumber> = {
  call: (_, { contract, dssGuniProxyActions }) => {
    return contract<DssGuniProxyActions>(dssGuniProxyActions).methods.getOtherTokenAmount
  },
  prepareArgs: ({ token, leveragedAmount }, context) => {
    const glpToken = context.tokens[token]

    console.log([
      glpToken.address,
      context.guniResolver,
      amountToWei(leveragedAmount, 'DAI').toFixed(0),
      6,
    ])

    return [
      glpToken.address,
      context.guniResolver,
      amountToWei(leveragedAmount, 'DAI').toFixed(0),
      6,
    ] // TODO: remove fixed precision
  },
  postprocess: (token2Amount: any) => new BigNumber(token2Amount).div(new BigNumber(10).pow(18)),
}

interface StateDependencies {
  depositAmount?: BigNumber
  proxyAddress?: string
  ilk: string
  token: string
  buyingCollateral?: BigNumber
  account: string
  slippage: BigNumber
  toTokenAmount?: BigNumber
  fromTokenAmount?: BigNumber
  borrowedDaiAmount?: BigNumber
  oneInchAmount?: BigNumber
  token1Amount?: BigNumber
}

export function openGuniVault<S extends StateDependencies>(
  { sendWithGasEstimation }: TxHelpers,
  { tokens, exchange }: ContextConnected,
  change: (ch: TxChange) => void,
  {
    depositAmount,
    proxyAddress,
    ilk,
    token,
    buyingCollateral,
    account,
    slippage,
    toTokenAmount,
    fromTokenAmount,
    borrowedDaiAmount,
    token1Amount, // USDC
    token0Amount, // DAI
  }: S,
) {
  return getQuote$(
    getTokenMetaData('DAI', tokens),
    getTokenMetaData(token, tokens),
    exchange.address,
    token1Amount!,
    slippage,
    'BUY_COLLATERAL',
  )
    .pipe(
      first(),
      switchMap((swap) =>
        sendWithGasEstimation(openGuniMultiplyVault, {
          kind: TxMetaKind.openGuni,
          depositCollateral: depositAmount || zero,
          userAddress: account,
          proxyAddress: proxyAddress!,
          ilk,
          token,
          exchangeAddress: swap?.status === 'SUCCESS' ? swap.tx.to : '0x',
          exchangeData: swap?.status === 'SUCCESS' ? swap.tx.data : '0x',
          minToTokenAmount: token1Amount?.times(one.minus(slippage)) || zero,
          requiredDebt: borrowedDaiAmount,
          toTokenAmount: toTokenAmount,
          fromTokenAmount,
        }).pipe(
          transactionToX<TxChange, any>(
            { kind: 'txWaitingForApproval' },
            (txState) =>
              of({ kind: 'txInProgress', openTxHash: (txState as any).txHash as string }),
            (txState) =>
              of({
                kind: 'txFailure',
                txError:
                  txState.status === TxStatus.Error ||
                  txState.status === TxStatus.CancelledByTheUser
                    ? txState.error
                    : undefined,
              }),
            (txState) => {
              const id = parseVaultIdFromReceiptLogs(
                txState.status === TxStatus.Success && txState.receipt,
              )

              // const jwtToken = jwtAuthGetToken(account as string)
              // if (id && jwtToken) {
              //   saveVaultUsingApi$(
              //     id,
              //     jwtToken,
              //     VaultType.Multiply,
              //     parseInt(txState.networkId),
              //   ).subscribe()
              // }

              return of({
                kind: 'txSuccess',
                id: id!,
              })
            },
          ),
        ),
      ),
      startWith({ kind: 'txWaitingForApproval' } as TxChange),
      catchError(() => of({ kind: 'txFailure' } as TxChange)),
    )
    .subscribe((ch) => change(ch))
}
