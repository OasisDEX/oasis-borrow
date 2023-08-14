import CancelablePromise, { cancelable } from 'cancelable-promise'
import { useAppContext } from 'components/AppContextProvider'
import { isAddress } from 'ethers/lib/utils'
import { searchAjnaPool } from 'features/ajna/positions/common/helpers/searchAjnaPool'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import { useEffect, useState } from 'react'
import { first } from 'rxjs/operators'

interface usePoolCreatorDataProps {
  collateralAddress: string
  quoteAddress: string
}

export function usePoolCreatorData({ collateralAddress, quoteAddress }: usePoolCreatorDataProps) {
  const { identifiedTokens$ } = useAppContext()

  const [cancelablePromise, setCancelablePromise] = useState<CancelablePromise<any>>()
  const [collateralToken, setCollateralToken] = useState<string>('')
  const [quoteToken, setQuoteToken] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isReady, setIsReady] = useState<boolean>(false)
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    setErrors([
      ...(!isAddress(collateralAddress)
        ? ['Collateral token address is not valid contract address']
        : []),
      ...(!isAddress(quoteAddress) ? ['Quote token address is not valid contract address'] : []),
      ...(collateralAddress === quoteAddress ? ['Collateral and token addresses has to be different'] : []),
    ])
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
                `Pool ${identifiedTokens[collateralAddress].symbol}/${identifiedTokens[quoteAddress].symbol} already exist`,
              ])
            } else {
              setCollateralToken(identifiedTokens[collateralAddress].symbol)
              setQuoteToken(identifiedTokens[quoteAddress].symbol)
              setIsReady(true)
            }
          })
          .catch((error) => {
            console.log(error)
            setErrors(['There was an unknown error, please try again later'])
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
    collateralToken,
    errors,
    isError: errors.length > 0,
    isLoading,
    isReady,
    quoteToken,
  }
}
