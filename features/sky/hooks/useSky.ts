import BigNumber from 'bignumber.js'
import { createApproveTransaction } from 'blockchain/better-calls/erc20'
import { NetworkIds } from 'blockchain/networks'
import { useMainContext } from 'components/context/MainContextProvider'
import type { ethers } from 'ethers'
import type { SwapCardType } from 'features/sky/components/SwapCard'
import type { skySwapTokensConfig } from 'features/sky/config'
import { useConnection } from 'features/web3OnBoard/useConnection'
import { useObservable } from 'helpers/observableHook'
import { useCallback, useEffect, useMemo, useState } from 'react'

export type ResolvedDepositParamsType = {
  token: string
  allowance: BigNumber
  balance: BigNumber
}

type useSkyType = {
  primaryToken: string
  secondaryToken: string
  primaryTokenBalance: BigNumber
  primaryTokenAllowance: BigNumber
  secondaryTokenBalance: BigNumber
  secondaryTokenAllowance: BigNumber
  depositAction: SwapCardType['depositAction']
  walletAddress?: string
  setReloadingTokenInfo: (isLoading: boolean) => void
  reloadingTokenInfo: boolean
} & (typeof skySwapTokensConfig)[number]

export const useSky = ({
  primaryToken,
  secondaryToken,
  primaryTokenBalance,
  primaryTokenAllowance,
  secondaryTokenBalance,
  secondaryTokenAllowance,
  depositAction,
  walletAddress,
  setReloadingTokenInfo,
  reloadingTokenInfo,
  contractAddress,
  stake,
}: useSkyType) => {
  const { connect, connecting } = useConnection()
  const { connectedContext$ } = useMainContext()
  const [context] = useObservable(connectedContext$)
  const [isSettingAllowance, setIsSettingAllowance] = useState(false)
  const [allowanceStatus, setAllowanceStatus] = useState<'success' | 'error' | undefined>()
  const [allowanceTx, setAllowanceTx] = useState<string | undefined>()
  const [transactionStatus, setTransactionStatus] = useState<'success' | 'error' | undefined>()
  const [transactionTx, setTransactionTx] = useState<string | undefined>()
  const [isTokenSwapped, setIsTokenSwapped] = useState(false)
  const signer = context?.transactionProvider
  const [amount, setAmount] = useState<BigNumber>()

  useEffect(() => {
    setAmount(undefined)
  }, [isTokenSwapped])

  const resolvedPrimaryTokenData = useMemo(() => {
    if (isTokenSwapped) {
      return {
        token: secondaryToken,
        allowance: secondaryTokenAllowance,
        balance: secondaryTokenBalance,
      }
    }
    return { token: primaryToken, allowance: primaryTokenAllowance, balance: primaryTokenBalance }
  }, [
    isTokenSwapped,
    primaryToken,
    primaryTokenAllowance,
    primaryTokenBalance,
    secondaryToken,
    secondaryTokenAllowance,
    secondaryTokenBalance,
  ])
  const resolvedSecondaryTokenData = useMemo(() => {
    if (isTokenSwapped) {
      return { token: primaryToken, allowance: primaryTokenAllowance, balance: primaryTokenBalance }
    }
    return {
      token: secondaryToken,
      allowance: secondaryTokenAllowance,
      balance: secondaryTokenBalance,
    }
  }, [
    isTokenSwapped,
    primaryToken,
    primaryTokenAllowance,
    primaryTokenBalance,
    secondaryToken,
    secondaryTokenAllowance,
    secondaryTokenBalance,
  ])

  const approveAllowance = useMemo(() => {
    if (!walletAddress || !amount || !signer) {
      return () => {}
    }
    return () => {
      setAllowanceStatus(undefined)
      setIsSettingAllowance(true)
      setAllowanceTx(undefined)
      createApproveTransaction({
        token: resolvedPrimaryTokenData.token,
        spender: contractAddress,
        amount,
        networkId: NetworkIds.MAINNET,
        signer,
      })
        .then((tx) => {
          setReloadingTokenInfo(true)
          console.info('Approve transaction', tx)
          tx.wait()
            .then((receipt) => {
              setAllowanceTx(receipt.transactionHash)
              setAllowanceStatus('success')
              setIsSettingAllowance(false)
              console.info('Approve transaction receipt', receipt)
            })
            .catch((e) => {
              setAllowanceStatus('error')
              console.error('Approve transaction failed 1', e)
              setIsSettingAllowance(false)
            })
            .finally(() => {
              setReloadingTokenInfo(false)
            })
        })
        .catch((e) => {
          setAllowanceStatus('error')
          setReloadingTokenInfo(false)
          setIsSettingAllowance(false)
          console.error('Approve transaction failed 2', e)
        })
    }
  }, [
    amount,
    contractAddress,
    resolvedPrimaryTokenData.token,
    setReloadingTokenInfo,
    signer,
    walletAddress,
  ])
  const executeDeposit = useCallback(() => {
    if (!amount) {
      console.error('Amount is not set')
      return () => {}
    }
    if (!signer) {
      console.error('Signer is not set')
      return () => {}
    }
    setTransactionStatus(undefined)
    setTransactionTx(undefined)
    return depositAction({ isTokenSwapped, resolvedPrimaryTokenData, amount, signer })
      .then((tx: ethers.ContractTransaction) => {
        setReloadingTokenInfo(true)
        tx.wait()
          .then((receipt) => {
            setTransactionTx(receipt.transactionHash)
            setIsSettingAllowance(false)
            setTransactionStatus('success')
            console.info('Deposit transaction receipt', receipt)
          })
          .catch((e) => {
            setTransactionStatus('error')
            setIsSettingAllowance(false)
            console.error('Deposit transaction failed 1', e)
          })
          .finally(() => {
            setAmount(undefined)
            setReloadingTokenInfo(false)
          })
      })
      .catch((e) => {
        setTransactionStatus('error')
        setReloadingTokenInfo(false)
        console.error('Deposit transaction failed 2', e)
      })
  }, [
    amount,
    depositAction,
    isTokenSwapped,
    resolvedPrimaryTokenData,
    signer,
    setReloadingTokenInfo,
  ])
  const onAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = new BigNumber(
      e.target.value.replaceAll(
        // leave only numbers and dots
        /[^0-9.]/g,
        '',
      ),
    )
    setAmount(
      newValue.gt(resolvedPrimaryTokenData.balance) ? resolvedPrimaryTokenData.balance : newValue,
    )
    return null
  }
  const onSetMax = () => {
    setAmount(resolvedPrimaryTokenData.balance)
  }
  const action = useMemo(() => {
    if (!walletAddress) {
      return connect
    }
    if (
      resolvedPrimaryTokenData.allowance.isZero() ||
      (amount && resolvedPrimaryTokenData.allowance.isLessThan(amount))
    ) {
      return approveAllowance
    }
    return amount
      ? executeDeposit
      : () => {
          console.error('Amount is not set')
        }
  }, [
    walletAddress,
    resolvedPrimaryTokenData.allowance,
    amount,
    executeDeposit,
    connect,
    approveAllowance,
  ])
  const isLoading = isSettingAllowance || reloadingTokenInfo || connecting
  const actionLabel = useMemo(() => {
    if (!walletAddress) {
      return 'Connect wallet'
    }
    if (
      (resolvedPrimaryTokenData.allowance.isZero() ||
        resolvedPrimaryTokenData.allowance.isLessThan(amount || 0)) &&
      !isLoading
    ) {
      return 'Set allowance'
    }
    return stake ? (isTokenSwapped ? `Unstake` : `Stake`) : isTokenSwapped ? `Downgrade` : `Upgrade`
  }, [walletAddress, resolvedPrimaryTokenData.allowance, amount, isTokenSwapped, isLoading, stake])
  const buttonDisabled =
    (!amount || amount.isZero() || amount.isNaN() || isLoading) && !!walletAddress
  return {
    amount,
    onAmountChange,
    onSetMax,
    maxAmount: resolvedPrimaryTokenData.balance,
    action,
    actionLabel,
    isLoading,
    buttonDisabled,
    setIsTokenSwapped,
    isTokenSwapped,
    resolvedPrimaryTokenData,
    resolvedSecondaryTokenData,
    allowanceStatus,
    setAllowanceStatus,
    transactionStatus,
    setTransactionStatus,
    allowanceTx,
    transactionTx,
    setTransactionTx,
    signer,
  }
}
