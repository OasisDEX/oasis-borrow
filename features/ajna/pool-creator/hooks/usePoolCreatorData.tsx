import type BigNumber from 'bignumber.js'
import { sendGenericTransaction$ } from 'blockchain/better-calls/send-generic-transaction'
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
import { getAjnaPoolInterestRateBoundaries } from 'features/ajna/pool-creator/calls'
import type { usePoolCreatorFormReducto } from 'features/ajna/pool-creator/state'
import type { PoolCreatorBoundries } from 'features/ajna/pool-creator/types'
import type { SearchAjnaPoolData } from 'features/ajna/pool-finder/helpers'
import { searchAjnaPool } from 'features/ajna/pool-finder/helpers'
import { getOmniTxStatuses } from 'features/omni-kit/contexts'
import { getOmniPositionUrl, getOmniSidebarTransactionStatus } from 'features/omni-kit/helpers'
import { isPoolOracless } from 'features/omni-kit/protocols/ajna/helpers'
import { settings as ajnaSettings } from 'features/omni-kit/protocols/ajna/settings'
import type { AjnaSupportedNetworkIds } from 'features/omni-kit/protocols/ajna/types'
import { OmniProductType, type OmniValidationItem } from 'features/omni-kit/types'
import type { TxDetails } from 'helpers/handleTransaction'
import { handleTransaction } from 'helpers/handleTransaction'
import { useObservable } from 'helpers/observableHook'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import { zero } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'
import { Trans, useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'
import { first } from 'rxjs/operators'
import { Text } from 'theme-ui'
import { AjnaErc20PoolFactory__factory } from 'types/ethers-contracts'

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
  const { connectedContext$ } = useMainContext()

  const [context] = useObservable(connectedContext$)

  const signer = context?.transactionProvider
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

  const networkContracts = getNetworkContracts(context?.chainId ?? NetworkIds.MAINNET)

  const onSubmit = () => {
    if (signer && 'ajnaERC20PoolFactory' in networkContracts) {
      const ajnaErc20PoolFactoryAddress = networkContracts.ajnaERC20PoolFactory.address
      const ajnaErc20PoolFactoryContract = AjnaErc20PoolFactory__factory.connect(
        ajnaErc20PoolFactoryAddress,
        signer,
      )

      sendGenericTransaction$({
        signer,
        contract: ajnaErc20PoolFactoryContract,
        method: 'deployPool',
        params: [collateralAddress, quoteAddress, amountToWad(interestRate.div(100)).toString()],
      }).subscribe((txState) => handleTransaction({ txState, ethPrice: zero, setTxDetails }))
    }
  }

  const txStatuses = getOmniTxStatuses(txDetails?.txStatus)

  const txSidebarStatus = getOmniSidebarTransactionStatus({
    ...('etherscan' in networkContracts && {
      etherscan: networkContracts.etherscan.url,
      etherscanName: networkContracts.etherscan.name,
    }),
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
      context?.chainId &&
      ajnaSettings.supportedNetworkIds.includes(context.chainId as AjnaSupportedNetworkIds)
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
              const omniPositionUrlCommon = {
                collateralAddress,
                collateralToken: identifiedTokens[collateralAddress.toLowerCase()].symbol,
                isPoolOracless: isPoolOracless({
                  collateralToken: identifiedTokens[collateralAddress.toLowerCase()].symbol,
                  quoteToken,
                  networkId: context.chainId,
                }),
                networkName: networksById[context.chainId].name,
                protocol: LendingProtocol.Ajna,
                quoteAddress,
                quoteToken: identifiedTokens[quoteAddress.toLowerCase()].symbol,
              }

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
                                  href={getOmniPositionUrl({
                                    ...omniPositionUrlCommon,
                                    productType: OmniProductType.Borrow,
                                  })}
                                />,
                                <AppLink
                                  sx={{ color: 'inherit' }}
                                  href={getOmniPositionUrl({
                                    ...omniPositionUrlCommon,
                                    productType: OmniProductType.Earn,
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
