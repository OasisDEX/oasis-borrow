import type BigNumber from 'bignumber.js'
import { getAjnaPoolInterestRateBoundaries } from 'blockchain/calls/ajnaErc20PoolFactory'
import { deployAjnaPool } from 'blockchain/calls/ajnaErc20PoolFactory.constants'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { getNetworkContracts } from 'blockchain/contracts'
import { identifyTokens$ } from 'blockchain/identifyTokens'
import type { IdentifiedTokens } from 'blockchain/identifyTokens.types'
import { NetworkIds, networksById } from 'blockchain/networks'
import { amountToWad } from 'blockchain/utils'
import type CancelablePromise from 'cancelable-promise'
import { cancelable } from 'cancelable-promise'
import { useMainContext } from 'components/context/MainContextProvider'
import { AppLink } from 'components/Links'
import { isAddress } from 'ethers/lib/utils'
import type { usePoolCreatorFormReducto } from 'features/ajna/pool-creator/state'
import type { PoolCreatorBoundries } from 'features/ajna/pool-creator/types'
import type { SearchAjnaPoolData } from 'features/ajna/pool-finder/helpers'
import { getOraclessProductUrl, searchAjnaPool } from 'features/ajna/pool-finder/helpers'
import { takeUntilTxState } from 'features/automation/api/takeUntilTxState'
import { getOmniTxStatuses } from 'features/omni-kit/contexts'
import { getOmniSidebarTransactionStatus } from 'features/omni-kit/helpers'
import { AJNA_SUPPORTED_NETWORKS } from 'features/omni-kit/protocols/ajna/constants'
import { OmniProductType, type OmniValidationItem } from 'features/omni-kit/types'
import type { TxDetails } from 'helpers/handleTransaction'
import { handleTransaction } from 'helpers/handleTransaction'
import { useObservable } from 'helpers/observableHook'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import { zero } from 'helpers/zero'
import { Trans, useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'
import { first } from 'rxjs/operators'
import { takeWhileInclusive } from 'rxjs-take-while-inclusive'
import { Text } from 'theme-ui'

interface UsePoolCreatorDataProps {
  collateralAddress: string
  form: ReturnType<typeof usePoolCreatorFormReducto>
  interestRate: BigNumber
  quoteAddress: string
}

export function usePoolCreatorData({
  collateralAddress,
  form: { dispatch },
  interestRate,
  quoteAddress,
}: UsePoolCreatorDataProps) {
  const { t } = useTranslation()
  const { context$, txHelpers$ } = useMainContext()

  const [context] = useObservable(context$)
  const [txHelpers] = useObservable(txHelpers$)

  const [txDetails, setTxDetails] = useState<TxDetails>()
  const [cancelablePromise, setCancelablePromise] =
    useState<CancelablePromise<[SearchAjnaPoolData[], IdentifiedTokens]>>()

  const [boundries, setBoundries] = useState<PoolCreatorBoundries>()
  const [collateralToken, setCollateralToken] = useState<string>('')
  const [quoteToken, setQuoteToken] = useState<string>('')
  const [errors, setErrors] = useState<OmniValidationItem[]>([])

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isFormValid, setIsFormValid] = useState<boolean>(false)
  const [isOnSupportedNetwork, setIsOnSupportedNetwork] = useState<boolean>(false)

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

  const txStatuses = getOmniTxStatuses(txDetails?.txStatus)
  const txSidebarStatus = getOmniSidebarTransactionStatus({
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
    const _isOnSupportedNetwork = !!(
      // dirty workaround for temporary goerli support
      // todo: remove second part of OR condition when goerli is discontinued
      (
        context?.chainId &&
        (AJNA_SUPPORTED_NETWORKS.includes(context.chainId) || context.chainId === NetworkIds.GOERLI)
      )
    )

    setBoundries(undefined)
    setIsOnSupportedNetwork(_isOnSupportedNetwork)
    dispatch({ type: 'reset' })
    if (_isOnSupportedNetwork)
      void getAjnaPoolInterestRateBoundaries(context.chainId).then(setBoundries)
  }, [context?.chainId])

  useEffect(() => {
    const localErrors: OmniValidationItem[] = []

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
        collateralAddress !== quoteAddress &&
        context?.chainId
      ) {
        setErrors([])

        const promise = cancelable(
          Promise.all([
            searchAjnaPool(context.chainId, {
              collateralToken: collateralAddress,
              poolAddress: '',
              quoteToken: quoteAddress,
            }),
            identifyTokens$(context.chainId, [collateralAddress, quoteAddress])
              .pipe(first())
              .toPromise(),
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
                          collateralToken: identifiedTokens[collateralAddress.toLowerCase()].symbol,
                          quoteToken: identifiedTokens[quoteAddress.toLowerCase()].symbol,
                        }}
                        components={[
                          <Text as="span" sx={{ fontWeight: 'semiBold' }} />,
                          ...(context?.chainId
                            ? [
                                <AppLink
                                  sx={{ color: 'inherit' }}
                                  href={getOraclessProductUrl({
                                    networkId: context.chainId,
                                    networkName: networksById[context.chainId].name,
                                    collateralAddress,
                                    collateralToken:
                                      identifiedTokens[collateralAddress.toLowerCase()].symbol,
                                    productType: OmniProductType.Borrow,
                                    quoteAddress,
                                    quoteToken: identifiedTokens[quoteAddress.toLowerCase()].symbol,
                                  })}
                                />,
                                <AppLink
                                  sx={{ color: 'inherit' }}
                                  href={getOraclessProductUrl({
                                    networkId: context.chainId,
                                    networkName: networksById[context.chainId].name,
                                    collateralAddress,
                                    collateralToken:
                                      identifiedTokens[collateralAddress.toLowerCase()].symbol,
                                    productType: OmniProductType.Earn,
                                    quoteAddress,
                                    quoteToken: identifiedTokens[quoteAddress.toLowerCase()].symbol,
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
              const identifyingErrors: OmniValidationItem[] = []

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
    [collateralAddress, quoteAddress, context?.chainId],
    250,
  )

  return {
    boundries,
    collateralToken,
    errors,
    isFormReady: !!(context && boundries),
    isFormValid,
    isLoading,
    isOnSupportedNetwork,
    networkId: context?.chainId,
    onSubmit,
    quoteToken,
    txSidebarStatus,
    txStatuses,
  }
}
