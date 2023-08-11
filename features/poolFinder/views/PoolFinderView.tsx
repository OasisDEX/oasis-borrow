import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { useAppContext } from 'components/AppContextProvider'
import { searchAjnaPool } from 'features/ajna/positions/common/helpers/searchAjnaPool'
import { PoolFinderFormLoadingState } from 'features/poolFinder/components/PoolFinderFormLoadingState'
import { PoolFinderTableLoadingState } from 'features/poolFinder/components/PoolFinderTableLoadingState'
import { PoolFinderContentController } from 'features/poolFinder/controls/PoolFinderContentController'
import { PoolFinderFormController } from 'features/poolFinder/controls/PoolFinderFormController'
import { PoolFinderNaturalLanguageSelectorController } from 'features/poolFinder/controls/PoolFinderNaturalLanguageSelectorController'
import { parsePoolResponse } from 'features/poolFinder/helpers'
import { getOraclessTokenAddress } from 'features/poolFinder/helpers/getOraclessTokenAddress'
import { OraclessPoolResult } from 'features/poolFinder/types'
import { ProductHubIntro } from 'features/productHub/components/ProductHubIntro'
import { ProductHubProductType } from 'features/productHub/types'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import { uniq } from 'lodash'
import React, { FC, useMemo, useState } from 'react'
import { Box } from 'theme-ui'

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
  const [collateralToken, setCollateralToken] = useState<string>('')
  const [quoteToken, setQuoteToken] = useState<string>('')

  useDebouncedEffect(
    async () => {
      if (context?.chainId && tokenPriceUSDData && resultsKey && !results[resultsKey]) {
        const tokensAddresses = await getOraclessTokenAddress({ collateralToken, quoteToken })

        if (
          tokensAddresses.collateralToken.addresses.length ||
          tokensAddresses.quoteToken.addresses.length
        ) {
          const pools = await searchAjnaPool({
            collateralAddress: tokensAddresses.collateralToken.addresses,
            poolAddress: poolAddress ? [poolAddress] : [],
            quoteAddress: tokensAddresses.quoteToken.addresses,
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
    [context?.chainId, collateralToken, poolAddress, resultsKey, quoteToken, tokenPriceUSDData],
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
            <>
              <Box sx={{ maxWidth: '804px', mx: 'auto' }}>
                <PoolFinderFormController
                  onChange={(addresses) => {
                    setCollateralToken(addresses.collateralAddress)
                    setPoolAddress(addresses.poolAddress)
                    setQuoteToken(addresses.quoteAddress)
                    setResultsKey(
                      addresses.collateralAddress || addresses.poolAddress || addresses.quoteAddress
                        ? Object.values(addresses).join('-')
                        : '',
                    )
                  }}
                />
              </Box>
              <Box sx={{ mt: '48px' }}>
                {results[resultsKey] ? (
                  <PoolFinderContentController
                    chainId={chainId}
                    selectedProduct={selectedProduct}
                    tableData={results[resultsKey]}
                  />
                ) : (
                  <>{resultsKey && <PoolFinderTableLoadingState />}</>
                )}
              </Box>
            </>
          )}
        </WithLoadingIndicator>
      </WithErrorHandler>
    </>
  )
}
