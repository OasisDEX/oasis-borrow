import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { useMainContext } from 'components/context/MainContextProvider'
import { useProductContext } from 'components/context/ProductContextProvider'
import { searchAjnaPool } from 'features/ajna/positions/common/helpers/searchAjnaPool'
import { PoolFinderFormLoadingState } from 'features/poolFinder/components/PoolFinderFormLoadingState'
import { PoolFinderTableLoadingState } from 'features/poolFinder/components/PoolFinderTableLoadingState'
import { PoolFinderContentController } from 'features/poolFinder/controls/PoolFinderContentController'
import { PoolFinderFormController } from 'features/poolFinder/controls/PoolFinderFormController'
import { PoolFinderNaturalLanguageSelectorController } from 'features/poolFinder/controls/PoolFinderNaturalLanguageSelectorController'
import { getOraclessTokenAddress, parsePoolResponse } from 'features/poolFinder/helpers'
import type { OraclessPoolResult, PoolFinderFormState } from 'features/poolFinder/types'
import { ProductHubIntro } from 'features/productHub/components/ProductHubIntro'
import type { ProductHubProductType } from 'features/productHub/types'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import { uniq } from 'lodash'
import type { FC } from 'react'
import React, { useMemo, useState } from 'react'
import { Box, Grid } from 'theme-ui'

interface PoolFinderViewProps {
  product: ProductHubProductType
}

export const PoolFinderView: FC<PoolFinderViewProps> = ({ product }) => {
  const { context$ } = useMainContext()
  const { identifiedTokens$, tokenPriceUSDStatic$ } = useProductContext()

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
  const [addresses, setAddresses] = useState<PoolFinderFormState>({
    collateralAddress: '',
    poolAddress: '',
    quoteAddress: '',
  })

  useDebouncedEffect(
    async () => {
      if (context?.chainId && tokenPriceUSDData && resultsKey && !results[resultsKey]) {
        const { collateralToken, quoteToken } = await getOraclessTokenAddress({
          collateralToken: addresses.collateralAddress,
          quoteToken: addresses.quoteAddress,
        })

        if (addresses.poolAddress || collateralToken.length || quoteToken.length) {
          const pools = await searchAjnaPool(context.chainId, {
            collateralAddress: collateralToken,
            poolAddress: addresses.poolAddress ? [addresses.poolAddress] : [],
            quoteAddress: quoteToken,
          })

          if (pools.length) {
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
        } else {
          setResults({
            ...results,
            [resultsKey]: [],
          })
        }
      }
    },
    [addresses, context?.chainId, resultsKey, tokenPriceUSDData],
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
      <WithErrorHandler error={[tokenPriceUSDError]}>
        <WithLoadingIndicator
          value={[context, tokenPriceUSDData]}
          customLoader={<PoolFinderFormLoadingState />}
        >
          {([{ chainId }]) => (
            <Grid gap="48px">
              <Box sx={{ maxWidth: '804px', mx: 'auto' }}>
                <PoolFinderFormController
                  chainId={chainId}
                  onChange={(addresses) => {
                    setAddresses(addresses)
                    setResultsKey(
                      addresses.collateralAddress || addresses.poolAddress || addresses.quoteAddress
                        ? Object.values(addresses).join('-')
                        : '',
                    )
                  }}
                />
              </Box>
              {results[resultsKey] ? (
                <PoolFinderContentController
                  addresses={addresses}
                  chainId={chainId}
                  selectedProduct={selectedProduct}
                  tableData={results[resultsKey]}
                />
              ) : (
                <>{resultsKey && <PoolFinderTableLoadingState />}</>
              )}
            </Grid>
          )}
        </WithLoadingIndicator>
      </WithErrorHandler>
    </>
  )
}
