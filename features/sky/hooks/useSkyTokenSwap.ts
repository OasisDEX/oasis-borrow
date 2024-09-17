import BigNumber from 'bignumber.js'
import { createApproveTransaction } from 'blockchain/better-calls/erc20'
import { useMainContext } from 'components/context/MainContextProvider'
import type { SwapCardType } from 'features/sky/components/SwapCard'
import type { skySwapTokensConfig } from 'features/sky/config'
import { useConnection } from 'features/web3OnBoard/useConnection'
import { useObservable } from 'helpers/observableHook'
import { useCallback, useMemo, useState } from 'react'

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
  setIsLoadingAllowance: (isLoading: boolean) => void
  isLoadingAllowance: boolean
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
  setIsLoadingAllowance,
  isLoadingAllowance,
  contractAddress,
}: UseSkyTokenSwapType) => {
  const { connect, connecting } = useConnection()
  const { connectedContext$ } = useMainContext()
  const [context] = useObservable(connectedContext$)
  const [isSettingAllowance, setIsSettingAllowance] = useState(false)
  const [isTokenSwapped, setIsTokenSwapped] = useState(false)
  const signer = context?.transactionProvider
  const [amount, setAmount] = useState<BigNumber>()

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
      setIsSettingAllowance(true)
      createApproveTransaction({
        token: resolvedPrimaryTokenData.token,
        spender: contractAddress,
        amount,
        networkId: 1,
        signer,
      })
        .then((tx) => {
          setIsLoadingAllowance(true)
          console.info('Approve transaction', tx)
          tx.wait()
            .then((receipt) => {
              setIsSettingAllowance(false)
              console.info('Approve transaction receipt', receipt)
            })
            .catch((e) => {
              console.error('Approve transaction failed 1', e)
              setIsSettingAllowance(false)
            })
            .finally(() => {
              setIsLoadingAllowance(false)
            })
        })
        .catch((e) => {
          setIsLoadingAllowance(false)
          setIsSettingAllowance(false)
          console.error('Approve transaction failed 2', e)
        })
    }
  }, [
    amount,
    contractAddress,
    resolvedPrimaryTokenData.token,
    setIsLoadingAllowance,
    signer,
    walletAddress,
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
  const executeDeposit = useCallback(() => {
    if (!amount) {
      console.error('Amount is not set')
      return () => {}
    }
    if (!signer) {
      console.error('Signer is not set')
      return () => {}
    }
    return depositAction({ isTokenSwapped, resolvedPrimaryTokenData, amount, signer })
  }, [amount, depositAction, isTokenSwapped, resolvedPrimaryTokenData, signer])
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
    return 'Swap'
  }, [walletAddress, resolvedPrimaryTokenData.allowance, amount])
  const isLoading = isSettingAllowance || isLoadingAllowance || connecting
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
  }
}
