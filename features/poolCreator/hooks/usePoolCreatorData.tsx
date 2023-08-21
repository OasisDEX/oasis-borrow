import BigNumber from 'bignumber.js'
import {
  deployAjnaPool,
  getAjnaPoolInterestRateBoundaries,
} from 'blockchain/calls/ajnaErc20PoolFactory'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { getNetworkContracts } from 'blockchain/contracts'
import { IdentifiedTokens } from 'blockchain/identifyTokens'
import { NetworkIds } from 'blockchain/networks'
import { amountToWad } from 'blockchain/utils'
import CancelablePromise, { cancelable } from 'cancelable-promise'
import { useMainContext } from 'components/context/MainContextProvider'
import { useProductContext } from 'components/context/ProductContextProvider'
import { AppLink } from 'components/Links'
import { isAddress } from 'ethers/lib/utils'
import { AjnaValidationItem } from 'features/ajna/common/types'
import { getTxStatuses } from 'features/ajna/positions/common/contexts/ajnaTxManager'
import { getAjnaSidebarTransactionStatus } from 'features/ajna/positions/common/helpers/getAjnaSidebarTransactionStatus'
import {
  searchAjnaPool,
  SearchAjnaPoolData,
} from 'features/ajna/positions/common/helpers/searchAjnaPool'
import { takeUntilTxState } from 'features/automation/api/automationTxHandlers'
import { PoolCreatorBoundries } from 'features/poolCreator/types'
import { getOraclessProductUrl } from 'features/poolFinder/helpers'
import { handleTransaction, TxDetails } from 'helpers/handleTransaction'
import { useObservable } from 'helpers/observableHook'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import { zero } from 'helpers/zero'
import { Trans, useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'
import { takeWhileInclusive } from 'rxjs-take-while-inclusive'
import { first } from 'rxjs/operators'
import { Text } from 'theme-ui'

interface UsePoolCreatorDataProps {
  collateralAddress: string
  interestRate: BigNumber
  quoteAddress: string
}

export function usePoolCreatorData({
  collateralAddress,
  interestRate,
  quoteAddress,
}: UsePoolCreatorDataProps) {
  const { t } = useTranslation()
  const { context$, txHelpers$ } = useMainContext()
  const { identifiedTokens$ } = useProductContext()

  const [context] = useObservable(context$)
  const [txHelpers] = useObservable(txHelpers$)

  const [txDetails, setTxDetails] = useState<TxDetails>()
  const [cancelablePromise, setCancelablePromise] =
    useState<CancelablePromise<[SearchAjnaPoolData[], IdentifiedTokens]>>()

  const [boundries, setBoundries] = useState<PoolCreatorBoundries>()
  const [collateralToken, setCollateralToken] = useState<string>('')
  const [quoteToken, setQuoteToken] = useState<string>('')
  const [errors, setErrors] = useState<AjnaValidationItem[]>([])

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isFormValid, setIsFormValid] = useState<boolean>(false)

  const onSubmit = () => {
    txHelpers
      ?.sendWithGasEstimation(deployAjnaPool, {
        kind: TxMetaKind.deployAjnaPool,
        collateralAddress,
        quoteAddress,
        interestRate: amountToWad(interestRate.div(100)).toString(),
      })
      .pipe(takeWhileInclusive((txState) => !takeUntilTxState.includes(txState.status)))
      .subscribe((txState) => {
        handleTransaction({
          txState,
          ethPrice: zero,
          setTxDetails,
        })
      })
  }

  const txStatuses = getTxStatuses(txDetails?.txStatus)
  const txSidebarStatus = getAjnaSidebarTransactionStatus({
    etherscan: getNetworkContracts(NetworkIds.MAINNET, context?.chainId).etherscan.url,
    isTxInProgress: txStatuses.isTxInProgress,
    isTxSuccess: txStatuses.isTxSuccess,
    text: t(
      txStatuses.isTxSuccess
        ? 'pool-creator.transaction.success'
        : 'pool-creator.transaction.progress',
      { collateralToken, quoteToken },
    ),
    txDetails,
  })?.at(0)

  useEffect(() => {
    if (context?.chainId) void getAjnaPoolInterestRateBoundaries(context.chainId).then(setBoundries)
  }, [context?.chainId])

  useEffect(() => {
    const localErrors: AjnaValidationItem[] = []

    if (collateralAddress.length && !isAddress(collateralAddress))
      localErrors.push({
        message: { translationKey: 'collateral-is-not-address' },
      })
    if (quoteAddress.length && !isAddress(quoteAddress))
      localErrors.push({
        message: { translationKey: 'quote-is-not-address' },
      })
    if (collateralAddress.length && quoteAddress.length && collateralAddress === quoteAddress)
      localErrors.push({
        message: { translationKey: 'collateral-equals-quote' },
      })

    setErrors(localErrors)
    setIsLoading(true)
    setIsFormValid(false)
    cancelablePromise?.cancel()
  }, [collateralAddress, quoteAddress])

  useDebouncedEffect(
    () => {
      if (
        isAddress(collateralAddress) &&
        isAddress(quoteAddress) &&
        collateralAddress !== quoteAddress
      ) {
        setErrors([])

        const promise = cancelable(
          Promise.all([
            searchAjnaPool({
              collateralAddress: [collateralAddress],
              poolAddress: [],
              quoteAddress: [quoteAddress],
            }),
            identifiedTokens$([collateralAddress, quoteAddress]).pipe(first()).toPromise(),
          ]),
        )
        setCancelablePromise(promise)

        promise
          .then(([pools, identifiedTokens]) => {
            const tokensKeys = Object.keys(identifiedTokens)

            if (pools.length) {
              setErrors([
                {
                  message: {
                    component: (
                      <Trans
                        i18nKey="pool-creator.validations.pool-already-exists"
                        values={{
                          collateralToken: identifiedTokens[collateralAddress].symbol,
                          quoteToken: identifiedTokens[quoteAddress].symbol,
                        }}
                        components={[
                          <Text as="span" sx={{ fontWeight: 'semiBold' }} />,
                          ...(context?.chainId
                            ? [
                                <AppLink
                                  sx={{ color: 'inherit' }}
                                  href={getOraclessProductUrl({
                                    chainId: context.chainId,
                                    collateralAddress,
                                    collateralToken: identifiedTokens[collateralAddress].symbol,
                                    product: 'borrow',
                                    quoteAddress,
                                    quoteToken: identifiedTokens[quoteAddress].symbol,
                                  })}
                                />,
                                <AppLink
                                  sx={{ color: 'inherit' }}
                                  href={getOraclessProductUrl({
                                    chainId: context.chainId,
                                    collateralAddress,
                                    collateralToken: identifiedTokens[collateralAddress].symbol,
                                    product: 'earn',
                                    quoteAddress,
                                    quoteToken: identifiedTokens[quoteAddress].symbol,
                                  })}
                                />,
                              ]
                            : []),
                        ]}
                      />
                    ),
                  },
                },
              ])
            } else if (tokensKeys.length < 2) {
              const identifyingErrors: AjnaValidationItem[] = []

              if (!tokensKeys.includes(collateralAddress.toLowerCase()))
                identifyingErrors.push({
                  message: { translationKey: 'collateral-is-not-erc20' },
                })
              if (!tokensKeys.includes(quoteAddress.toLowerCase()))
                identifyingErrors.push({
                  message: { translationKey: 'quote-is-not-erc20' },
                })

              setErrors(identifyingErrors)
            } else {
              setCollateralToken(identifiedTokens[collateralAddress.toLowerCase()].symbol)
              setQuoteToken(identifiedTokens[quoteAddress.toLowerCase()].symbol)
              setIsFormValid(true)
            }
          })
          .catch(() => {
            setErrors([{ message: { translationKey: 'unknown-error' } }])
          })
          .finally(() => {
            setIsLoading(false)
          })
      } else {
        setIsLoading(false)
      }
    },
    [collateralAddress, quoteAddress],
    250,
  )

  return {
    boundries,
    collateralToken,
    errors,
    isLoading,
    isFormReady: context && txHelpers ? true : undefined,
    isFormValid,
    onSubmit,
    quoteToken,
    txSidebarStatus,
    txStatuses,
  }
}
