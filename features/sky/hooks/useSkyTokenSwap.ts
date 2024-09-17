import BigNumber from 'bignumber.js'
import { createApproveTransaction } from 'blockchain/better-calls/erc20'
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

type UseSkyTokenSwapType = {
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

export const useSkyTokenSwap = ({
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
}: UseSkyTokenSwapType) => {
  const { connect, connecting } = useConnection()
  const { connectedContext$ } = useMainContext()
  const [context] = useObservable(connectedContext$)
  const [isSettingAllowance, setIsSettingAllowance] = useState(false)
  const [allowanceStatus, setAllowanceStatus] = useState<'success' | 'error' | undefined>()
  const [transactionStatus, setTransactionStatus] = useState<'success' | 'error' | undefined>()
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
      createApproveTransaction({
        token: resolvedPrimaryTokenData.token,
        spender: contractAddress,
        amount,
        networkId: 1,
        signer,
      })
        .then((tx) => {
          setReloadingTokenInfo(true)
          console.info('Approve transaction', tx)
          tx.wait()
            .then((receipt) => {
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
    setReloadingTokenInfo(true)
    return depositAction({ isTokenSwapped, resolvedPrimaryTokenData, amount, signer })
      .then((tx: ethers.ContractTransaction) => {
        tx.wait()
          .then((receipt) => {
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
  const actionLabel = useMemo(() => {
    if (!walletAddress) {
      return 'Connect wallet'
    }
    if (
      resolvedPrimaryTokenData.allowance.isZero() ||
      resolvedPrimaryTokenData.allowance.isLessThan(amount || 0)
    ) {
      return 'Set allowance'
    }
    return !isTokenSwapped ? 'Upgrade' : 'Downgrade'
  }, [walletAddress, resolvedPrimaryTokenData.allowance, amount, isTokenSwapped])
  const isLoading = isSettingAllowance || reloadingTokenInfo || connecting
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
  }
}
