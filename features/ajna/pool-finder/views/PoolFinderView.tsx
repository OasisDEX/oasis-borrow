import { getNetworkContracts } from 'blockchain/contracts'
import { identifyTokens$ } from 'blockchain/identifyTokens'
import { getNetworkById, NetworkIds } from 'blockchain/networks'
import { useProductContext } from 'components/context/ProductContextProvider'
import { PoolFinderTableLoadingState } from 'features/ajna/pool-finder/components'
import {
  PoolFinderContentController,
  PoolFinderFormController,
  PoolFinderNaturalLanguageSelectorController,
} from 'features/ajna/pool-finder/controls'
import { parsePoolResponse, searchAjnaPool } from 'features/ajna/pool-finder/helpers'
import type { OraclessPoolResult, PoolFinderFormState } from 'features/ajna/pool-finder/types'
import { settings as ajnaSettings } from 'features/omni-kit/protocols/ajna/settings'
import type { OmniProductType } from 'features/omni-kit/types'
import { ProductHubIntro } from 'features/productHub/components/ProductHubIntro'
import { useAppConfig } from 'helpers/config'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import { uniq } from 'lodash'
import type { FC } from 'react'
import React, { useMemo, useState } from 'react'
import { combineLatest } from 'rxjs'
import { Box, Grid } from 'theme-ui'

interface PoolFinderViewProps {
  product: OmniProductType
}

export const PoolFinderView: FC<PoolFinderViewProps> = ({ product }) => {
  const { AjnaBase: ajnaBaseEnabled } = useAppConfig('features')

  const { tokenPriceUSDStatic$ } = useProductContext()

  const { chainId: walletNetworkId } = useAccount()
  const [tokenPriceUSDData, tokenPriceUSDError] = useObservable(
    useMemo(
      () => tokenPriceUSDStatic$(Object.keys(getNetworkContracts(NetworkIds.MAINNET).tokens)),
      [],
    ),
  )

  const [selectedProduct, setSelectedProduct] = useState<OmniProductType>(product)
  const [results, setResults] = useState<{ [key: string]: OraclessPoolResult[] }>({})
  const [resultsKey, setResultsKey] = useState<string>('')
  const [addresses, setAddresses] = useState<PoolFinderFormState>({
    collateralToken: '',
    poolAddress: '',
    quoteToken: '',
  })

  useDebouncedEffect(
    async () => {
      if (tokenPriceUSDData && resultsKey && !results[resultsKey]) {
        if (addresses.poolAddress || addresses.collateralToken || addresses.quoteToken) {
          let networkIds = [...ajnaSettings.supportedMainnetNetworkIds]

          if (walletNetworkId) {
            const walletNetwork = getNetworkById(walletNetworkId)

            if (walletNetwork.testnet)
              networkIds = [
                ...networkIds.filter((networkId) => networkId !== walletNetwork.mainnetId),
                walletNetworkId,
              ]
          }
          if (!ajnaBaseEnabled)
            networkIds = networkIds.filter((networkId) => networkId !== NetworkIds.BASEMAINNET)

          const pools = await Promise.all(
            networkIds.map(
              async (networkId) =>
                await searchAjnaPool(networkId, {
                  collateralToken: addresses.collateralToken,
                  poolAddress: addresses.poolAddress,
                  quoteToken: addresses.quoteToken,
                }),
            ),
          )

          if (pools.flat().length) {
            const identifiedTokensSubscription = combineLatest(
              ...networkIds.map((networkId, i) =>
                identifyTokens$(
                  networkId,
                  uniq(
                    pools[i].flatMap(({ collateralAddress, quoteTokenAddress }) => [
                      collateralAddress,
                      quoteTokenAddress,
                    ]),
                  ),
                ),
              ),
            ).subscribe((identifiedTokens) => {
              setResults({
                ...results,
                [resultsKey]: pools.flatMap((_pools, i) =>
                  parsePoolResponse(networkIds[i], identifiedTokens[i], _pools, tokenPriceUSDData),
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
    [addresses, resultsKey, tokenPriceUSDData, walletNetworkId],
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
        <Grid gap="48px">
          <Box sx={{ maxWidth: '804px', mx: 'auto' }}>
            <PoolFinderFormController
              onChange={(_addresses) => {
                setAddresses(_addresses)
                setResultsKey(
                  _addresses.collateralToken || _addresses.poolAddress || _addresses.quoteToken
                    ? Object.values(_addresses).join('-')
                    : '',
                )
              }}
            />
          </Box>
          {results[resultsKey] ? (
            <PoolFinderContentController
              addresses={addresses}
              selectedProduct={selectedProduct}
              tableData={results[resultsKey]}
            />
          ) : (
            <>{resultsKey && <PoolFinderTableLoadingState />}</>
          )}
        </Grid>
      </WithErrorHandler>
    </>
  )
}
