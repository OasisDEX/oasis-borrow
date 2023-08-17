import { getAjnaPoolInterestRateBoundaries } from 'blockchain/calls/ajnaErc20PoolFactory'
import { NetworkIds } from 'blockchain/networks'
import CancelablePromise, { cancelable } from 'cancelable-promise'
import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { isAddress } from 'ethers/lib/utils'
import { AjnaValidationItem } from 'features/ajna/common/types'
import { searchAjnaPool } from 'features/ajna/positions/common/helpers/searchAjnaPool'
import { PoolCreatorBoundries } from 'features/poolCreator/types'
import { getOraclessProductUrl } from 'features/poolFinder/helpers'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import { Trans } from 'next-i18next'
import { useEffect, useState } from 'react'
import { first } from 'rxjs/operators'
import { Text } from 'theme-ui'

interface usePoolCreatorDataProps {
  chainId?: NetworkIds
  collateralAddress: string
  quoteAddress: string
}

export function usePoolCreatorData({
  chainId,
  collateralAddress,
  quoteAddress,
}: usePoolCreatorDataProps) {
  const { identifiedTokens$ } = useAppContext()

  const [cancelablePromise, setCancelablePromise] = useState<CancelablePromise<any>>()
  const [boundries, setBoundries] = useState<PoolCreatorBoundries>()
  const [collateralToken, setCollateralToken] = useState<string>('')
  const [quoteToken, setQuoteToken] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isReady, setIsReady] = useState<boolean>(false)
  const [errors, setErrors] = useState<AjnaValidationItem[]>([])

  useEffect(() => {
    if (chainId) void getAjnaPoolInterestRateBoundaries(chainId).then(setBoundries)
  }, [chainId])

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
    setIsReady(false)
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
                          ...(chainId
                            ? [
                                <AppLink
                                  sx={{ color: 'inherit' }}
                                  href={getOraclessProductUrl({
                                    chainId,
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
                                    chainId,
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
            } else {
              setCollateralToken(identifiedTokens[collateralAddress].symbol)
              setQuoteToken(identifiedTokens[quoteAddress].symbol)
              setIsReady(true)
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
    isReady,
    quoteToken,
  }
}
