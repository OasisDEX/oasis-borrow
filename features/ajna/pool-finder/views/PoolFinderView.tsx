import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { useMainContext } from 'components/context/MainContextProvider'
import { useProductContext } from 'components/context/ProductContextProvider'
import {
  PoolFinderFormLoadingState,
  PoolFinderTableLoadingState,
} from 'features/ajna/pool-finder/components'
import {
  PoolFinderContentController,
  PoolFinderFormController,
  PoolFinderNaturalLanguageSelectorController,
} from 'features/ajna/pool-finder/controls'
import {
  parsePoolResponse,
  searchAjnaPool,
} from 'features/ajna/pool-finder/helpers'
import type { OraclessPoolResult, PoolFinderFormState } from 'features/ajna/pool-finder/types'
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
    collateralToken: '',
    poolAddress: '',
    quoteToken: '',
  })

  useDebouncedEffect(
    async () => {
      if (context?.chainId && tokenPriceUSDData && resultsKey && !results[resultsKey]) {
        if (addresses.poolAddress || addresses.collateralToken || addresses.quoteToken) {
          const pools = await searchAjnaPool(context.chainId, {
            collateralToken: addresses.collateralToken,
            poolAddress: addresses.poolAddress,
            quoteToken: addresses.quoteToken,
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
                      addresses.collateralToken || addresses.poolAddress || addresses.quoteToken
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
