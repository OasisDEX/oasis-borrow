import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { useAppContext } from 'components/AppContextProvider'
import { searchAjnaPool } from 'features/ajna/positions/common/helpers/searchAjnaPool'
import { PoolFinderTableLoadingState } from 'features/poolFinder/components/PoolFinderTableLoadingState'
import { PoolFinderContentController } from 'features/poolFinder/controls/PoolFinderContentController'
import { PoolFinderFormController } from 'features/poolFinder/controls/PoolFinderFormController'
import { PoolFinderNaturalLanguageSelectorController } from 'features/poolFinder/controls/PoolFinderNaturalLanguageSelectorController'
import { parsePoolResponse, validateOraclessPayload } from 'features/poolFinder/helpers'
import { OraclessPoolResult } from 'features/poolFinder/types'
import { ProductHubIntro } from 'features/productHub/components/ProductHubIntro'
import { ProductHubProductType } from 'features/productHub/types'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import { uniq } from 'lodash'
import React, { FC, useMemo, useState } from 'react'
import { Box, Text } from 'theme-ui'

interface PoolFinderViewProps {
  product: ProductHubProductType
}

export const PoolFinderView: FC<PoolFinderViewProps> = ({ product }) => {
  const { context$, identifiedTokens$, tokenPriceUSDStatic$ } = useAppContext()

  const [context] = useObservable(context$)
  const [tokenPriceUSDData, tokenPriceUSDError] = useObservable(
    useMemo(
      () => tokenPriceUSDStatic$(Object.keys(getNetworkContracts(NetworkIds.MAINNET).tokens)),
      [],
    ),
  )

  const [selectedProduct, setSelectedProduct] = useState<ProductHubProductType>(product)
  const [results, setResults] = useState<{ [key: string]: OraclessPoolResult[] }>({})
  const [resultsKey, setResultsKey] = useState<string>('')
  const [poolAddress, setPoolAddress] = useState<string>('')
  const [collateralAddress, setCollateralAddress] = useState<string>('')
  const [quoteAddress, setQuoteAddress] = useState<string>('')
  const [errors, setErrors] = useState<string[]>([])

  useDebouncedEffect(
    async () => {
      const validation = validateOraclessPayload({
        collateralAddress,
        poolAddress,
        quoteAddress,
      })

      setErrors(validation)
      if (
        context?.chainId &&
        tokenPriceUSDData &&
        resultsKey &&
        !results[resultsKey] &&
        validation.length === 0
      ) {
        const { pools, size } = await searchAjnaPool({
          collateralAddress,
          poolAddress,
          quoteAddress,
        })
        if (size > 0) {
          const identifiedTokensSubscription = identifiedTokens$(
            uniq(
              pools.flatMap(({ collateralAddress, quoteTokenAddress }) => [
                collateralAddress,
                quoteTokenAddress,
              ]),
            ),
          ).subscribe((identifiedTokens) => {
            setResults({
              ...results,
              [resultsKey]: parsePoolResponse(
                context.chainId,
                identifiedTokens,
                pools,
                tokenPriceUSDData,
              ),
            })
            try {
              identifiedTokensSubscription.unsubscribe()
            } catch (e) {}
          })
        } else {
          setResults({
            ...results,
            [resultsKey]: [],
          })
        }
      }
    },
    [context?.chainId, collateralAddress, poolAddress, resultsKey, quoteAddress, tokenPriceUSDData],
    250,
  )

  return (
    <>
      <Box
        sx={{
          position: 'relative',
          my: [3, null, '48px'],
          textAlign: 'center',
          zIndex: 3,
        }}
      >
        <PoolFinderNaturalLanguageSelectorController
          gradient={['#f154db', '#974eea']}
          product={product}
          onChange={(_selectedProduct) => {
            setSelectedProduct(_selectedProduct)
          }}
        />
        <ProductHubIntro selectedProduct={selectedProduct} />
      </Box>
      <Box sx={{ maxWidth: '804px', mx: 'auto' }}>
        <PoolFinderFormController
          onChange={(addresses) => {
            setCollateralAddress(addresses.collateralAddress)
            setPoolAddress(addresses.poolAddress)
            setQuoteAddress(addresses.quoteAddress)
            setResultsKey(
              addresses.collateralAddress || addresses.poolAddress || addresses.quoteAddress
                ? Object.values(addresses).join('-')
                : '',
            )
          }}
        />
      </Box>
      <WithErrorHandler error={[tokenPriceUSDError]}>
        <WithLoadingIndicator
          value={[context, tokenPriceUSDData]}
          customLoader={<PoolFinderTableLoadingState />}
        >
          {([{ chainId }]) => (
            <Box sx={{ mt: '48px' }}>
              {results[resultsKey] ? (
                <PoolFinderContentController
                  chainId={chainId}
                  selectedProduct={selectedProduct}
                  tableData={results[resultsKey]}
                />
              ) : (
                <>
                  {resultsKey && errors.length > 0 ? (
                    errors.map((error) => <Text as="p">{error}</Text>)
                  ) : (
                    <>{resultsKey && <PoolFinderTableLoadingState />}</>
                  )}
                </>
              )}
            </Box>
          )}
        </WithLoadingIndicator>
      </WithErrorHandler>
    </>
  )
}
