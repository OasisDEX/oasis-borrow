import { useAppContext } from 'components/AppContextProvider'
import { searchAjnaPool } from 'features/ajna/positions/common/helpers/searchAjnaPool'
import { PoolFinderTableLoadingState } from 'features/poolFinder/components/PoolFinderTableLoadingState'
import { PoolFinderContentController } from 'features/poolFinder/controls/PoolFinderContentController'
import { PoolFinderNaturalLanguageSelectorController } from 'features/poolFinder/controls/PoolFinderNaturalLanguageSelectorController'
import { validateOraclessPayload } from 'features/poolFinder/helpers'
import { OraclessPoolResult } from 'features/poolFinder/types'
import { ProductHubIntro } from 'features/productHub/components/ProductHubIntro'
import { ProductHubProductType } from 'features/productHub/types'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { useObservable } from 'helpers/observableHook'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import { uniq } from 'lodash'
import React, { FC, useState } from 'react'
import { Box, Flex, Input,  SxStyleProp, Text } from 'theme-ui'

const inputStyles: SxStyleProp = {
  height: '50px',
  maxWidth: '460px',
  p: 3,
  fontSize: 2,
  border: '1px solid',
  borderColor: 'neutral20',
  borderRadius: 'medium',
}

interface PoolFinderViewProps {
  product: ProductHubProductType
}

export const PoolFinderView: FC<PoolFinderViewProps> = ({ product }) => {
  const { context$, identifiedTokens$ } = useAppContext()

  const [context] = useObservable(context$)
  const [selectedProduct, setSelectedProduct] = useState<ProductHubProductType>(product)
  const [results, setResults] = useState<{ [key: string]: OraclessPoolResult[] }>({})
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
        !results[`${poolAddress}-${collateralAddress}-${quoteAddress}`] &&
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
          ).subscribe(
            (identifiedTokens) => {
              setResults({
                ...results,
                [`${poolAddress}-${collateralAddress}-${quoteAddress}`]: pools
                  .filter(
                    (pool) =>
                      Object.keys(identifiedTokens).includes(pool.collateralAddress) &&
                      Object.keys(identifiedTokens).includes(pool.quoteTokenAddress),
                  )
                  .map((pool) => ({
                    collateralAddress: pool.collateralAddress,
                    collateralToken: identifiedTokens[pool.collateralAddress].symbol,
                    quoteAddress: pool.quoteTokenAddress,
                    quoteToken: identifiedTokens[pool.quoteTokenAddress].symbol,
                  })),
              })
              try {
                identifiedTokensSubscription.unsubscribe()
              } catch (e) {}
            },
            undefined,
            () => {
              console.log('complete?')
            },
          )
        } else {
          setResults({
            ...results,
            [`${poolAddress}-${collateralAddress}-${quoteAddress}`]: [],
          })
        }
      }
    },
    [collateralAddress, poolAddress, quoteAddress],
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
      <WithLoadingIndicator value={[context]}>
        {([{ chainId }]) => (
          <>
            <Flex
              sx={{
                flexDirection: 'column',
                rowGap: 2,
                justifyItems: 'center',
                alignItems: 'center',
                mb: '48px',
              }}
            >
              <Input
                sx={inputStyles}
                placeholder="Pool address"
                value={poolAddress}
                onChange={(e) => setPoolAddress(e.target.value.toLowerCase())}
              />
              <Box>OR</Box>
              <Input
                sx={inputStyles}
                placeholder="Collateral token address"
                value={collateralAddress}
                onChange={(e) => setCollateralAddress(e.target.value.toLowerCase())}
              />
              <Input
                sx={inputStyles}
                placeholder="Quote token address"
                value={quoteAddress}
                onChange={(e) => setQuoteAddress(e.target.value.toLowerCase())}
              />
            </Flex>
            {results[`${poolAddress}-${collateralAddress}-${quoteAddress}`] ? (
              <PoolFinderContentController
                chainId={chainId}
                selectedProduct={selectedProduct}
                tableData={results[`${poolAddress}-${collateralAddress}-${quoteAddress}`]}
              />
            ) : (
              <>
                {errors.length > 0 ? (
                  errors.map((error) => <Text as="p">{error}</Text>)
                ) : (
                  <PoolFinderTableLoadingState />
                )}
              </>
            )}
          </>
        )}
      </WithLoadingIndicator>
    </>
  )
}
